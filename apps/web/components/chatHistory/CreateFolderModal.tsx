"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import FolderColorPicker from "@/components/chatHistory/FolderColorPicker";
import {
  CHAT_HISTORY_NAME_MAX_CHARS,
  DEFAULT_CHAT_FOLDER_COLOR,
  type ChatFolderColor,
  type ChatFolderCreateInput,
  type ChatFolderDto,
} from "@/lib/chatHistory/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type CreateFolderModalProps = {
  open: boolean;
  disabled: boolean;
  /**
   * When set, create a subfolder under this parent (read-only context).
   * When null, create a top-level folder only.
   */
  parentFolder: ChatFolderDto | null;
  onClose: () => void;
  onCreate: (input: ChatFolderCreateInput) => void;
};

/**
 * Studio dark dialog to create a chat folder: top-level from +, or a subfolder
 * pre-bound to a root folder from that folder's ⋯ menu.
 * Escape and backdrop click cancel without creating.
 */
export default function CreateFolderModal({
  open,
  disabled,
  parentFolder,
  onClose,
  onCreate,
}: CreateFolderModalProps): ReactNode {
  const { t } = useI18n();
  const titleId = useId();
  const nameId = useId();
  const parentContextId = useId();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [colorDraft, setColorDraft] = useState<ChatFolderColor>(
    DEFAULT_CHAT_FOLDER_COLOR,
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const isSubfolder: boolean = parentFolder !== null;

  useEffect(() => {
    if (!open) {
      return;
    }
    setNameDraft("");
    setColorDraft(DEFAULT_CHAT_FOLDER_COLOR);
    setNameError(null);
  }, [open]);

  useEffect(() => {
    const dialog: HTMLDialogElement | null = dialogRef.current;
    if (dialog === null) {
      return;
    }
    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const input: HTMLInputElement | null = nameInputRef.current;
      if (input !== null) {
        input.focus();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  /**
   * Validates name then creates via the parent callback and closes.
   * Top-level always sends null parent; subfolder sends the bound parent id.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const name: string = nameDraft.trim();
    if (name.length === 0) {
      setNameError(t("histFolderNameRequired"));
      const input: HTMLInputElement | null = nameInputRef.current;
      if (input !== null) {
        input.focus();
      }
      return;
    }
    const parentFolderId: string | null =
      parentFolder === null ? null : parentFolder.id;
    onCreate({
      name,
      color: colorDraft,
      parentFolderId,
    });
    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className="chat-folder-create-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <form className="chat-folder-create-panel" onSubmit={handleSubmit}>
        <div className="chat-folder-create-top">
          <h2 id={titleId} className="chat-folder-create-title">
            {isSubfolder
              ? t("histCreateSubfolderTitle")
              : t("histCreateFolderTitle")}
          </h2>
          <button
            type="button"
            className="chat-folder-create-close"
            onClick={onClose}
            aria-label={t("histCancel")}
          >
            {t("histCancel")}
          </button>
        </div>

        {parentFolder !== null ? (
          <div className="chat-folder-create-field">
            <p className="chat-history-field-label" id={parentContextId}>
              {t("histFolderParent")}
            </p>
            <p
              className="chat-folder-create-parent"
              aria-labelledby={parentContextId}
            >
              {parentFolder.name}
            </p>
          </div>
        ) : null}

        <div className="chat-folder-create-field">
          <label className="chat-history-field-label" htmlFor={nameId}>
            {t("histFolderNamePlaceholder")}
          </label>
          <input
            ref={nameInputRef}
            id={nameId}
            className="chat-history-input chat-folder-create-input"
            type="text"
            value={nameDraft}
            maxLength={CHAT_HISTORY_NAME_MAX_CHARS}
            disabled={disabled}
            placeholder={t("histFolderNamePlaceholder")}
            autoComplete="off"
            onChange={(event) => {
              setNameDraft(event.target.value);
              if (nameError !== null) {
                setNameError(null);
              }
            }}
          />
          {nameError !== null ? (
            <p className="chat-history-error" role="alert">
              {nameError}
            </p>
          ) : null}
        </div>

        <div className="chat-folder-create-field">
          <FolderColorPicker
            idPrefix="chat-folder-create-color"
            value={colorDraft}
            disabled={disabled}
            showLegend
            onChange={setColorDraft}
          />
        </div>

        <div className="chat-folder-create-actions">
          <button
            type="submit"
            className="chat-folder-create-submit"
            disabled={disabled}
          >
            {t("histCreateFolderSubmit")}
          </button>
          <button
            type="button"
            className="chat-folder-create-cancel"
            disabled={disabled}
            onClick={onClose}
          >
            {t("histCancel")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
