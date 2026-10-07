"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type {
  FormEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  RefObject,
} from "react";

import CreateFolderModal from "@/components/chatHistory/CreateFolderModal";
import FolderColorPicker from "@/components/chatHistory/FolderColorPicker";
import {
  folderMoveOptionLabel,
  listChatHistorySidebarSections,
  listFoldersForMove,
  listValidParentsForFolder,
  type ChatFolderTreeNode,
  type ChatHistorySidebarSection,
} from "@/lib/chatHistory/group";
import {
  CHAT_HISTORY_NAME_MAX_CHARS,
  DEFAULT_CHAT_FOLDER_COLOR,
  type ChatConversationSummary,
  type ChatFolderColor,
  type ChatFolderCreateInput,
  type ChatFolderDto,
  type ChatFolderPatchInput,
} from "@/lib/chatHistory/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/messages";
import { getModuleById } from "@/lib/modules/catalog";
import { getModuleDisplay } from "@/lib/modules/moduleDisplay";

type ChatHistorySidebarProps = {
  conversations: ChatConversationSummary[];
  folders: ChatFolderDto[];
  activeConversationId: string | null;
  disabled: boolean;
  /** True while the first list/resume bootstrap is still running. */
  loading: boolean;
  onSelectConversation: (conversationId: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onCreateFolder: (input: ChatFolderCreateInput) => void;
  onUpdateFolder: (folderId: string, input: ChatFolderPatchInput) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameConversation: (conversationId: string, title: string) => void;
  onDeleteConversation: (conversationId: string) => void;
};

/**
 * Global history list: Chats section (ChatGPT "Projects" slot), folders first, then
 * no-folder chats, and row actions via ⋯ menus. Rail New chat (home launcher) lives
 * in AppNav above All Tools. Rows show tool title so cross-tool lists stay clear.
 */
export default function ChatHistorySidebar({
  conversations,
  folders,
  activeConversationId,
  disabled,
  loading,
  onSelectConversation,
  onMoveToFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onRenameConversation,
  onDeleteConversation,
}: ChatHistorySidebarProps) {
  const { t } = useI18n();
  const [creatingFolder, setCreatingFolder] = useState(false);
  /** Bound parent when creating a subfolder; null for top-level from +. */
  const [createParentFolder, setCreateParentFolder] =
    useState<ChatFolderDto | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderRenameDraft, setFolderRenameDraft] = useState("");
  const [folderRenameColor, setFolderRenameColor] =
    useState<ChatFolderColor>(DEFAULT_CHAT_FOLDER_COLOR);
  const [folderRenameParent, setFolderRenameParent] = useState("");
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const folderRenameInputRef = useRef<HTMLInputElement | null>(null);

  /** Folders (roots + nested) first; ungrouped chats always last. */
  const sections: ChatHistorySidebarSection[] = useMemo(() => {
    return listChatHistorySidebarSections(conversations, folders);
  }, [conversations, folders]);

  useEffect(() => {
    if (renamingFolderId === null) {
      return;
    }
    const input: HTMLInputElement | null = folderRenameInputRef.current;
    if (input === null) {
      return;
    }
    input.focus();
    input.select();
  }, [renamingFolderId]);

  /**
   * Opens the top-level create-folder modal (+ next to Chats).
   */
  function startCreateFolder(): void {
    setOpenMenuKey(null);
    setCreateParentFolder(null);
    setCreatingFolder(true);
  }

  /**
   * Opens the subfolder create modal bound to a root folder (from that folder's ⋯).
   */
  function startCreateSubfolder(folder: ChatFolderDto): void {
    if (folder.parentFolderId !== null) {
      return;
    }
    setOpenMenuKey(null);
    setCreateParentFolder(folder);
    setCreatingFolder(true);
  }

  /**
   * Closes the create-folder modal without saving.
   */
  function cancelCreateFolder(): void {
    setCreatingFolder(false);
    setCreateParentFolder(null);
  }

  /**
   * Starts inline rename/color edit for one folder.
   */
  function startRenameFolder(folder: ChatFolderDto): void {
    setOpenMenuKey(null);
    setRenamingFolderId(folder.id);
    setFolderRenameDraft(folder.name);
    setFolderRenameColor(folder.color);
    setFolderRenameParent(folder.parentFolderId ?? "");
    setNameError(null);
  }

  /**
   * Cancels an in-progress folder rename.
   */
  function cancelRenameFolder(): void {
    setRenamingFolderId(null);
    setFolderRenameDraft("");
    setFolderRenameColor(DEFAULT_CHAT_FOLDER_COLOR);
    setFolderRenameParent("");
    setNameError(null);
  }

  /**
   * Saves the inline folder rename and color.
   */
  function handleRenameFolder(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const folderId: string | null = renamingFolderId;
    if (folderId === null) {
      return;
    }
    const name: string = folderRenameDraft.trim();
    if (name.length === 0) {
      setNameError(t("histFolderNameRequired"));
      return;
    }
    const previous: ChatFolderDto | undefined = folders.find(
      (folder) => folder.id === folderId,
    );
    setNameError(null);
    setRenamingFolderId(null);
    setFolderRenameDraft("");
    setFolderRenameColor(DEFAULT_CHAT_FOLDER_COLOR);
    setFolderRenameParent("");
    const nextParent: string | null =
      folderRenameParent.trim().length > 0 ? folderRenameParent.trim() : null;
    const patch: ChatFolderPatchInput = {};
    if (previous === undefined || previous.name !== name) {
      patch.name = name;
    }
    if (previous === undefined || previous.color !== folderRenameColor) {
      patch.color = folderRenameColor;
    }
    const previousParent: string | null =
      previous === undefined ? null : previous.parentFolderId;
    if (previousParent !== nextParent) {
      patch.parentFolderId = nextParent;
    }
    if (
      patch.name === undefined &&
      patch.color === undefined &&
      patch.parentFolderId === undefined
    ) {
      return;
    }
    onUpdateFolder(folderId, patch);
  }

  /**
   * Confirms folder delete: chats stay and return to Ungrouped.
   */
  function handleDeleteFolder(folderId: string): void {
    setOpenMenuKey(null);
    const confirmed: boolean = window.confirm(t("histDeleteFolderConfirm"));
    if (!confirmed) {
      return;
    }
    if (renamingFolderId === folderId) {
      cancelRenameFolder();
    }
    onDeleteFolder(folderId);
  }

  /**
   * Escape cancels an in-progress folder rename.
   */
  function handleFolderRenameKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    cancelRenameFolder();
  }

  const folderSectionCount: number = sections.filter((section) => {
    return section.kind === "folder";
  }).length;
  const ungroupedSection: ChatHistorySidebarSection | undefined = sections.find(
    (section) => section.kind === "ungrouped",
  );
  const ungroupedConversations: ChatConversationSummary[] =
    ungroupedSection !== undefined && ungroupedSection.kind === "ungrouped"
      ? ungroupedSection.conversations
      : [];
  const showEmptyInbox: boolean =
    !loading && folderSectionCount === 0 && ungroupedConversations.length === 0;

  return (
    <aside className="chat-history-sidebar" aria-label={t("histTitle")}>
      <div className="chat-history-sidebar-head">
        <div className="chat-history-sidebar-title-row">
          <p className="chat-history-sidebar-title">{t("histTitle")}</p>
          <button
            type="button"
            className="chat-history-icon-btn"
            disabled={disabled || loading}
            aria-label={t("histCreateFolder")}
            title={t("histCreateFolder")}
            onClick={startCreateFolder}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <CreateFolderModal
        open={creatingFolder}
        disabled={disabled || loading}
        parentFolder={createParentFolder}
        onClose={cancelCreateFolder}
        onCreate={onCreateFolder}
      />

      {loading ? (
        <p className="chat-history-empty" aria-live="polite">
          {t("histLoading")}
        </p>
      ) : null}

      <div className="chat-history-groups">
        {sections.map((section) => {
          if (section.kind === "folder") {
            return (
              <FolderTreeBlock
                key={section.node.folder.id}
                node={section.node}
                depth={0}
                folders={folders}
                activeConversationId={activeConversationId}
                disabled={disabled}
                renamingFolderId={renamingFolderId}
                folderRenameDraft={folderRenameDraft}
                folderRenameColor={folderRenameColor}
                folderRenameParent={folderRenameParent}
                nameError={nameError}
                folderRenameInputRef={folderRenameInputRef}
                openMenuKey={openMenuKey}
                setOpenMenuKey={setOpenMenuKey}
                setFolderRenameDraft={setFolderRenameDraft}
                setFolderRenameColor={setFolderRenameColor}
                setFolderRenameParent={setFolderRenameParent}
                onStartRenameFolder={startRenameFolder}
                onCreateSubfolder={startCreateSubfolder}
                onCancelRenameFolder={cancelRenameFolder}
                onRenameFolderSubmit={handleRenameFolder}
                onFolderRenameKeyDown={handleFolderRenameKeyDown}
                onDeleteFolder={handleDeleteFolder}
                onSelectConversation={onSelectConversation}
                onMoveToFolder={onMoveToFolder}
                onRenameConversation={onRenameConversation}
                onDeleteConversation={onDeleteConversation}
              />
            );
          }

          return (
            <section key="ungrouped" className="chat-history-ungrouped">
              {showEmptyInbox ? (
                <p className="chat-history-empty">{t("histEmpty")}</p>
              ) : section.conversations.length === 0 ? null : (
                <ul className="chat-history-thread-list">
                  {section.conversations.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      conversation={conversation}
                      folders={folders}
                      active={conversation.id === activeConversationId}
                      disabled={disabled}
                      openMenuKey={openMenuKey}
                      setOpenMenuKey={setOpenMenuKey}
                      onSelectConversation={onSelectConversation}
                      onMoveToFolder={onMoveToFolder}
                      onRenameConversation={onRenameConversation}
                      onDeleteConversation={onDeleteConversation}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

type FolderTreeBlockProps = {
  node: ChatFolderTreeNode;
  depth: number;
  folders: ChatFolderDto[];
  activeConversationId: string | null;
  disabled: boolean;
  renamingFolderId: string | null;
  folderRenameDraft: string;
  folderRenameColor: ChatFolderColor;
  folderRenameParent: string;
  nameError: string | null;
  folderRenameInputRef: RefObject<HTMLInputElement | null>;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  setFolderRenameDraft: (value: string) => void;
  setFolderRenameColor: (value: ChatFolderColor) => void;
  setFolderRenameParent: (value: string) => void;
  onStartRenameFolder: (folder: ChatFolderDto) => void;
  onCreateSubfolder: (folder: ChatFolderDto) => void;
  onCancelRenameFolder: () => void;
  onRenameFolderSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFolderRenameKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onDeleteFolder: (folderId: string) => void;
  onSelectConversation: (conversationId: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onRenameConversation: (conversationId: string, title: string) => void;
  onDeleteConversation: (conversationId: string) => void;
};

/**
 * One collapsible folder (and optional nested children) with color bar and chats.
 * Chevron + summary toggle expand/collapse; children sit in indented nest chrome.
 */
function FolderTreeBlock({
  node,
  depth,
  folders,
  activeConversationId,
  disabled,
  renamingFolderId,
  folderRenameDraft,
  folderRenameColor,
  folderRenameParent,
  nameError,
  folderRenameInputRef,
  openMenuKey,
  setOpenMenuKey,
  setFolderRenameDraft,
  setFolderRenameColor,
  setFolderRenameParent,
  onStartRenameFolder,
  onCreateSubfolder,
  onCancelRenameFolder,
  onRenameFolderSubmit,
  onFolderRenameKeyDown,
  onDeleteFolder,
  onSelectConversation,
  onMoveToFolder,
  onRenameConversation,
  onDeleteConversation,
}: FolderTreeBlockProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(true);
  const isRenaming: boolean = renamingFolderId === node.folder.id;
  const folderMenuKey: string = `folder:${node.folder.id}`;
  const nestedClass: string =
    depth > 0 ? "chat-history-folder chat-history-folder-nested" : "chat-history-folder";
  const emptyFolder: boolean =
    node.conversations.length === 0 && node.children.length === 0;
  /** Max 2 levels: only root folders may create a subfolder. */
  const canCreateSubfolder: boolean = node.folder.parentFolderId === null;
  const parentOptions: ChatFolderDto[] = listValidParentsForFolder(
    folders,
    node.folder.id,
  );
  const showParentSelect: boolean =
    parentOptions.length > 0 || node.folder.parentFolderId !== null;
  const toggleHint: string = expanded
    ? t("histFolderCollapse")
    : t("histFolderExpand");

  useEffect(() => {
    if (isRenaming) {
      setExpanded(true);
    }
  }, [isRenaming]);

  return (
    <details
      className={nestedClass}
      open={expanded}
      data-folder-color={node.folder.color}
      onToggle={(event) => {
        const nextOpen: boolean = event.currentTarget.open;
        if (isRenaming && !nextOpen) {
          setExpanded(true);
          return;
        }
        setExpanded(nextOpen);
      }}
    >
      <summary
        className="chat-history-folder-summary"
        aria-expanded={expanded}
      >
        <span
          className="chat-history-folder-chevron"
          aria-hidden="true"
        >
          <svg
            className="chat-history-folder-chevron-icon"
            viewBox="0 0 16 16"
            width="12"
            height="12"
            focusable="false"
          >
            <path
              d="M6.2 3.4a.75.75 0 0 1 1.06 0l4.2 4.2a.75.75 0 0 1 0 1.06l-4.2 4.2a.75.75 0 1 1-1.06-1.06L9.84 8 6.2 4.46a.75.75 0 0 1 0-1.06Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span
          className={`chat-history-folder-swatch chat-history-folder-swatch-${node.folder.color}`}
          aria-hidden="true"
        />
        <span className="chat-history-folder-name">{node.folder.name}</span>
        <span className="sr-only">{toggleHint}</span>
        {!isRenaming ? (
          <ActionsMenu
            menuKey={folderMenuKey}
            openMenuKey={openMenuKey}
            setOpenMenuKey={setOpenMenuKey}
            disabled={disabled}
            label={t("histFolderActions")}
            onSummaryClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            {canCreateSubfolder ? (
              <button
                type="button"
                className="chat-history-menu-item"
                role="menuitem"
                disabled={disabled}
                onClick={() => onCreateSubfolder(node.folder)}
              >
                {t("histCreateSubfolder")}
              </button>
            ) : null}
            <button
              type="button"
              className="chat-history-menu-item"
              role="menuitem"
              disabled={disabled}
              onClick={() => onStartRenameFolder(node.folder)}
            >
              {t("histRenameFolder")}
            </button>
            <button
              type="button"
              className="chat-history-menu-item chat-history-menu-item-danger"
              role="menuitem"
              disabled={disabled}
              onClick={() => onDeleteFolder(node.folder.id)}
            >
              {t("histDeleteFolder")}
            </button>
          </ActionsMenu>
        ) : null}
      </summary>
      {isRenaming ? (
        <form className="chat-history-rename" onSubmit={onRenameFolderSubmit}>
          <label className="sr-only" htmlFor={`chat-history-rename-${node.folder.id}`}>
            {t("histRenameFolder")}
          </label>
          <input
            ref={folderRenameInputRef}
            id={`chat-history-rename-${node.folder.id}`}
            className="chat-history-input"
            type="text"
            value={folderRenameDraft}
            maxLength={CHAT_HISTORY_NAME_MAX_CHARS}
            disabled={disabled}
            onChange={(event) => setFolderRenameDraft(event.target.value)}
            onKeyDown={onFolderRenameKeyDown}
          />
          <FolderColorPicker
            idPrefix={`chat-history-rename-color-${node.folder.id}`}
            value={folderRenameColor}
            disabled={disabled}
            onChange={setFolderRenameColor}
          />
          {showParentSelect ? (
            <>
              <label className="sr-only" htmlFor={`chat-history-rename-parent-${node.folder.id}`}>
                {t("histFolderParent")}
              </label>
              <select
                id={`chat-history-rename-parent-${node.folder.id}`}
                className="chat-history-input"
                disabled={disabled}
                value={folderRenameParent}
                aria-label={t("histFolderParent")}
                onChange={(event) => setFolderRenameParent(event.target.value)}
              >
                <option value="">{t("histFolderParentNone")}</option>
                {parentOptions.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          {nameError !== null ? (
            <p className="chat-history-error" role="alert">
              {nameError}
            </p>
          ) : null}
          <div className="chat-history-inline-actions">
            <button type="submit" className="chat-history-secondary" disabled={disabled}>
              {t("histRenameFolder")}
            </button>
            <button
              type="button"
              className="chat-history-text-btn"
              disabled={disabled}
              onClick={onCancelRenameFolder}
            >
              {t("histCancel")}
            </button>
          </div>
        </form>
      ) : null}
      <div className="chat-history-folder-body">
        {emptyFolder ? (
          <p className="chat-history-empty">{t("histEmptyFolder")}</p>
        ) : null}
        {node.conversations.length > 0 ? (
          <ul className="chat-history-thread-list chat-history-thread-list-nested">
            {node.conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                folders={folders}
                active={conversation.id === activeConversationId}
                disabled={disabled}
                openMenuKey={openMenuKey}
                setOpenMenuKey={setOpenMenuKey}
                onSelectConversation={onSelectConversation}
                onMoveToFolder={onMoveToFolder}
                onRenameConversation={onRenameConversation}
                onDeleteConversation={onDeleteConversation}
              />
            ))}
          </ul>
        ) : null}
        {node.children.map((child) => (
          <FolderTreeBlock
            key={child.folder.id}
            node={child}
            depth={depth + 1}
            folders={folders}
            activeConversationId={activeConversationId}
            disabled={disabled}
            renamingFolderId={renamingFolderId}
            folderRenameDraft={folderRenameDraft}
            folderRenameColor={folderRenameColor}
            folderRenameParent={folderRenameParent}
            nameError={nameError}
            folderRenameInputRef={folderRenameInputRef}
            openMenuKey={openMenuKey}
            setOpenMenuKey={setOpenMenuKey}
            setFolderRenameDraft={setFolderRenameDraft}
            setFolderRenameColor={setFolderRenameColor}
            setFolderRenameParent={setFolderRenameParent}
            onStartRenameFolder={onStartRenameFolder}
            onCreateSubfolder={onCreateSubfolder}
            onCancelRenameFolder={onCancelRenameFolder}
            onRenameFolderSubmit={onRenameFolderSubmit}
            onFolderRenameKeyDown={onFolderRenameKeyDown}
            onDeleteFolder={onDeleteFolder}
            onSelectConversation={onSelectConversation}
            onMoveToFolder={onMoveToFolder}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
          />
        ))}
      </div>
    </details>
  );
}

type ConversationRowProps = {
  conversation: ChatConversationSummary;
  folders: ChatFolderDto[];
  active: boolean;
  disabled: boolean;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  onSelectConversation: (conversationId: string) => void;
  onMoveToFolder: (conversationId: string, folderId: string | null) => void;
  onRenameConversation: (conversationId: string, title: string) => void;
  onDeleteConversation: (conversationId: string) => void;
};

/**
 * One thread row: open, or use the ⋯ menu for rename, delete, and move.
 */
function ConversationRow({
  conversation,
  folders,
  active,
  disabled,
  openMenuKey,
  setOpenMenuKey,
  onSelectConversation,
  onMoveToFolder,
  onRenameConversation,
  onDeleteConversation,
}: ConversationRowProps) {
  const { t, locale } = useI18n();
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(conversation.title);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const menuKey: string = `chat:${conversation.id}`;
  const moveFolders: ChatFolderDto[] = listFoldersForMove(folders);
  const updatedLabel: string = formatRelativeUpdatedAt(conversation.updatedAt, locale);
  const toolLabel: string = resolveToolLabel(conversation.moduleId, locale);
  const metaLabel: string =
    toolLabel.length > 0 ? `${toolLabel}, ${updatedLabel}` : updatedLabel;

  useEffect(() => {
    if (!isRenaming) {
      return;
    }
    const input: HTMLInputElement | null = renameInputRef.current;
    if (input === null) {
      return;
    }
    input.focus();
    input.select();
  }, [isRenaming]);

  useEffect(() => {
    if (openMenuKey !== menuKey) {
      setMoveOpen(false);
    }
  }, [openMenuKey, menuKey]);

  /**
   * Opens inline rename with the current title.
   */
  function startRename(): void {
    setOpenMenuKey(null);
    setMoveOpen(false);
    setRenameDraft(conversation.title);
    setRenameError(null);
    setIsRenaming(true);
  }

  /**
   * Leaves rename mode without saving.
   */
  function cancelRename(): void {
    setIsRenaming(false);
    setRenameDraft(conversation.title);
    setRenameError(null);
  }

  /**
   * Saves a trimmed title via the parent PATCH handler.
   */
  function handleRenameSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const title: string = renameDraft.trim();
    if (title.length === 0) {
      setRenameError(t("histChatTitleRequired"));
      return;
    }
    setRenameError(null);
    setIsRenaming(false);
    if (title !== conversation.title) {
      onRenameConversation(conversation.id, title);
    }
  }

  /**
   * Escape cancels rename; Enter is handled by the form submit.
   */
  function handleRenameKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    cancelRename();
  }

  /**
   * Soft-deletes after a confirm dialog.
   */
  function handleDelete(): void {
    setOpenMenuKey(null);
    setMoveOpen(false);
    const confirmed: boolean = window.confirm(t("histDeleteChatConfirm"));
    if (!confirmed) {
      return;
    }
    onDeleteConversation(conversation.id);
  }

  /**
   * Moves this chat into a folder, or null for Ungrouped.
   */
  function handleMove(folderId: string | null): void {
    setOpenMenuKey(null);
    setMoveOpen(false);
    const current: string | null = conversation.folderId;
    if (current === folderId) {
      return;
    }
    onMoveToFolder(conversation.id, folderId);
  }

  return (
    <li className={active ? "chat-history-thread chat-history-thread-active" : "chat-history-thread"}>
      {isRenaming ? (
        <form className="chat-history-rename" onSubmit={handleRenameSubmit}>
          <label className="sr-only" htmlFor={`chat-history-chat-rename-${conversation.id}`}>
            {t("histRenameChat")}
          </label>
          <input
            ref={renameInputRef}
            id={`chat-history-chat-rename-${conversation.id}`}
            className="chat-history-input"
            type="text"
            value={renameDraft}
            maxLength={CHAT_HISTORY_NAME_MAX_CHARS}
            disabled={disabled}
            placeholder={t("histChatTitlePlaceholder")}
            onChange={(event) => {
              setRenameDraft(event.target.value);
              if (renameError !== null) {
                setRenameError(null);
              }
            }}
            onKeyDown={handleRenameKeyDown}
          />
          {renameError !== null ? (
            <p className="chat-history-error" role="alert">
              {renameError}
            </p>
          ) : null}
          <div className="chat-history-inline-actions">
            <button type="submit" className="chat-history-secondary" disabled={disabled}>
              {t("histRenameChat")}
            </button>
            <button
              type="button"
              className="chat-history-text-btn"
              disabled={disabled}
              onClick={cancelRename}
            >
              {t("histCancel")}
            </button>
          </div>
        </form>
      ) : (
        <div className="chat-history-thread-row">
          <button
            type="button"
            className="chat-history-thread-open"
            disabled={disabled}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <span className="chat-history-thread-title">{conversation.title}</span>
            <span className="chat-history-thread-meta">{metaLabel}</span>
          </button>
          <ActionsMenu
            menuKey={menuKey}
            openMenuKey={openMenuKey}
            setOpenMenuKey={setOpenMenuKey}
            disabled={disabled}
            label={t("histChatActions")}
          >
            <button
              type="button"
              className="chat-history-menu-item"
              role="menuitem"
              disabled={disabled}
              onClick={startRename}
            >
              {t("histRenameChat")}
            </button>
            <button
              type="button"
              className="chat-history-menu-item chat-history-menu-item-danger"
              role="menuitem"
              disabled={disabled}
              onClick={handleDelete}
            >
              {t("histDeleteChat")}
            </button>
            <div className="chat-history-menu-section" role="none">
              <button
                type="button"
                className="chat-history-menu-item"
                role="menuitem"
                aria-expanded={moveOpen}
                disabled={disabled}
                onClick={() => setMoveOpen((prev) => !prev)}
              >
                {t("histMoveToFolder")}
              </button>
              {moveOpen ? (
                <div className="chat-history-menu-submenu" role="group" aria-label={t("histMoveToFolder")}>
                  <button
                    type="button"
                    className={
                      conversation.folderId === null
                        ? "chat-history-menu-item chat-history-menu-item-active"
                        : "chat-history-menu-item"
                    }
                    role="menuitem"
                    disabled={disabled}
                    onClick={() => handleMove(null)}
                  >
                    {t("histUngrouped")}
                  </button>
                  {moveFolders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      className={
                        conversation.folderId === folder.id
                          ? "chat-history-menu-item chat-history-menu-item-active"
                          : "chat-history-menu-item"
                      }
                      role="menuitem"
                      disabled={disabled}
                      onClick={() => handleMove(folder.id)}
                    >
                      {folderMoveOptionLabel(folder)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </ActionsMenu>
        </div>
      )}
    </li>
  );
}

type ActionsMenuProps = {
  menuKey: string;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
  /** Stops summary toggle when the trigger lives inside a folder <summary>. */
  onSummaryClick?: (event: ReactMouseEvent<HTMLDivElement>) => void;
};

/**
 * Compact ⋯ trigger with a dropdown. Escape and outside click close it; page focus is not trapped.
 */
function ActionsMenu({
  menuKey,
  openMenuKey,
  setOpenMenuKey,
  disabled,
  label,
  children,
  onSummaryClick,
}: ActionsMenuProps) {
  const isOpen: boolean = openMenuKey === menuKey;
  const menuId: string = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /**
     * Closes the menu when the pointer lands outside its root.
     */
    function handlePointerDown(event: PointerEvent): void {
      const root: HTMLDivElement | null = rootRef.current;
      const target = event.target;
      if (root === null || !(target instanceof Node)) {
        return;
      }
      if (!root.contains(target)) {
        setOpenMenuKey(null);
      }
    }

    /**
     * Escape closes this menu without trapping keyboard focus on the page.
     */
    function handleKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpenMenuKey(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setOpenMenuKey]);

  return (
    <div
      ref={rootRef}
      className={isOpen ? "chat-history-actions open" : "chat-history-actions"}
      onClick={onSummaryClick}
      onKeyDown={(event) => {
        if (onSummaryClick === undefined) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.stopPropagation();
        }
      }}
    >
      <button
        type="button"
        className="chat-history-more"
        disabled={disabled}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpenMenuKey(isOpen ? null : menuKey);
        }}
      >
        <span aria-hidden="true">⋯</span>
      </button>
      {isOpen ? (
        <div id={menuId} className="chat-history-menu" role="menu" aria-label={label}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compact relative time for sidebar rows (en/zh), no dash punctuation.
 */
function formatRelativeUpdatedAt(iso: string, locale: Locale): string {
  const thenMs: number = Date.parse(iso);
  if (Number.isNaN(thenMs)) {
    return "";
  }
  const deltaSec: number = Math.round((thenMs - Date.now()) / 1000);
  const absSec: number = Math.abs(deltaSec);
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });
  if (absSec < 60) {
    return rtf.format(deltaSec, "second");
  }
  const deltaMin: number = Math.round(deltaSec / 60);
  if (Math.abs(deltaMin) < 60) {
    return rtf.format(deltaMin, "minute");
  }
  const deltaHour: number = Math.round(deltaSec / 3600);
  if (Math.abs(deltaHour) < 48) {
    return rtf.format(deltaHour, "hour");
  }
  const deltaDay: number = Math.round(deltaSec / 86_400);
  if (Math.abs(deltaDay) < 30) {
    return rtf.format(deltaDay, "day");
  }
  const deltaMonth: number = Math.round(deltaSec / 2_592_000);
  return rtf.format(deltaMonth, "month");
}

/**
 * Locale tool title for a conversation row, or empty when the module id is unknown.
 */
function resolveToolLabel(moduleId: string, locale: Locale): string {
  const catalogModule = getModuleById(moduleId);
  if (catalogModule === undefined) {
    return "";
  }
  return getModuleDisplay(catalogModule, locale).title;
}
