/**
 * Groups a conversation list under owner folders, including nested subfolders.
 */

import type {
  ChatConversationSummary,
  ChatFolderDto,
} from "@/lib/chatHistory/types";

export type ChatFolderGroup = {
  folder: ChatFolderDto;
  conversations: ChatConversationSummary[];
};

/** One folder node with optional nested children (max depth 2 in practice). */
export type ChatFolderTreeNode = {
  folder: ChatFolderDto;
  conversations: ChatConversationSummary[];
  children: ChatFolderTreeNode[];
};

/**
 * Places each conversation under its folder. Unknown folder ids join Ungrouped.
 * Empty folders stay in the result so the student can rename, delete, or move into them.
 */
export function groupConversationsByFolder(
  conversations: ChatConversationSummary[],
  folders: ChatFolderDto[],
): {
  folderGroups: ChatFolderGroup[];
  ungrouped: ChatConversationSummary[];
} {
  const knownFolderIds: Set<string> = new Set(
    folders.map((folder) => folder.id),
  );
  const byFolder: Map<string, ChatConversationSummary[]> = new Map();
  const ungrouped: ChatConversationSummary[] = [];

  for (const conversation of conversations) {
    const folderId: string | null = conversation.folderId;
    if (folderId === null || !knownFolderIds.has(folderId)) {
      ungrouped.push(conversation);
      continue;
    }
    const existing: ChatConversationSummary[] | undefined = byFolder.get(folderId);
    if (existing === undefined) {
      byFolder.set(folderId, [conversation]);
    } else {
      existing.push(conversation);
    }
  }

  const folderGroups: ChatFolderGroup[] = folders.map((folder) => {
    const grouped: ChatConversationSummary[] | undefined = byFolder.get(folder.id);
    return {
      folder,
      conversations: grouped === undefined ? [] : grouped,
    };
  });

  return { folderGroups, ungrouped };
}

/**
 * Builds a nestable folder tree (roots + one child level) from a flat folder list.
 * Orphaned children (missing parent) render as roots. Preserves input folder order.
 * Sidebar consumers must render `roots` first, then `ungrouped` (never the reverse).
 */
export function buildFolderConversationTree(
  conversations: ChatConversationSummary[],
  folders: ChatFolderDto[],
): {
  roots: ChatFolderTreeNode[];
  ungrouped: ChatConversationSummary[];
} {
  const { folderGroups, ungrouped } = groupConversationsByFolder(
    conversations,
    folders,
  );

  const nodesById: Map<string, ChatFolderTreeNode> = new Map();
  for (const group of folderGroups) {
    nodesById.set(group.folder.id, {
      folder: group.folder,
      conversations: group.conversations,
      children: [],
    });
  }

  const roots: ChatFolderTreeNode[] = [];
  const attachedChildIds: Set<string> = new Set();

  for (const group of folderGroups) {
    const parentId: string | null = group.folder.parentFolderId;
    if (parentId === null) {
      continue;
    }
    const parentNode: ChatFolderTreeNode | undefined = nodesById.get(parentId);
    const childNode: ChatFolderTreeNode | undefined = nodesById.get(group.folder.id);
    if (parentNode === undefined || childNode === undefined) {
      continue;
    }
    if (parentNode.folder.parentFolderId !== null) {
      continue;
    }
    parentNode.children.push(childNode);
    attachedChildIds.add(group.folder.id);
  }

  for (const group of folderGroups) {
    if (attachedChildIds.has(group.folder.id)) {
      continue;
    }
    const node: ChatFolderTreeNode | undefined = nodesById.get(group.folder.id);
    if (node !== undefined) {
      roots.push(node);
    }
  }

  return { roots, ungrouped };
}

/** One sidebar block: a folder tree root, or the trailing no-folder chat list. */
export type ChatHistorySidebarSection =
  | { kind: "folder"; node: ChatFolderTreeNode }
  | { kind: "ungrouped"; conversations: ChatConversationSummary[] };

/**
 * Sidebar list order source of truth: every folder root (nested children on the node),
 * then chats with no folder_id last. Does not invent an "Ungrouped" title.
 */
export function listChatHistorySidebarSections(
  conversations: ChatConversationSummary[],
  folders: ChatFolderDto[],
): ChatHistorySidebarSection[] {
  const { roots, ungrouped } = buildFolderConversationTree(
    conversations,
    folders,
  );
  const sections: ChatHistorySidebarSection[] = [];
  for (const node of roots) {
    sections.push({ kind: "folder", node });
  }
  sections.push({ kind: "ungrouped", conversations: ungrouped });
  return sections;
}

/**
 * Collects a folder id plus every descendant id (for delete local state cleanup).
 */
export function collectFolderAndDescendantIds(
  folders: ChatFolderDto[],
  rootFolderId: string,
): Set<string> {
  const ids: Set<string> = new Set([rootFolderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const folder of folders) {
      if (folder.parentFolderId === null) {
        continue;
      }
      if (ids.has(folder.parentFolderId) && !ids.has(folder.id)) {
        ids.add(folder.id);
        grew = true;
      }
    }
  }
  return ids;
}

/**
 * Root folders only (valid parents for a new subfolder).
 */
export function listRootFolders(folders: ChatFolderDto[]): ChatFolderDto[] {
  return folders.filter((folder) => folder.parentFolderId === null);
}

/**
 * Folders that may parent `folderId`: other roots, excluding self.
 * Empty when the folder already has children (cannot nest a parent).
 */
export function listValidParentsForFolder(
  folders: ChatFolderDto[],
  folderId: string,
): ChatFolderDto[] {
  const hasChildren: boolean = folders.some((folder) => {
    return folder.parentFolderId === folderId;
  });
  if (hasChildren) {
    return [];
  }
  return folders.filter((folder) => {
    return folder.parentFolderId === null && folder.id !== folderId;
  });
}

/**
 * Move-menu order: each root, then its children, then any leftover rows.
 */
export function listFoldersForMove(folders: ChatFolderDto[]): ChatFolderDto[] {
  const listed: ChatFolderDto[] = [];
  const listedIds: Set<string> = new Set();
  for (const root of listRootFolders(folders)) {
    listed.push(root);
    listedIds.add(root.id);
    for (const folder of folders) {
      if (folder.parentFolderId !== root.id) {
        continue;
      }
      listed.push(folder);
      listedIds.add(folder.id);
    }
  }
  for (const folder of folders) {
    if (listedIds.has(folder.id)) {
      continue;
    }
    listed.push(folder);
  }
  return listed;
}

/**
 * Label for move-to-folder options, with a light nest prefix for subfolders.
 */
export function folderMoveOptionLabel(folder: ChatFolderDto): string {
  if (folder.parentFolderId === null) {
    return folder.name;
  }
  return `  ${folder.name}`;
}

/**
 * Moves a conversation to the front of the list (latest updated first).
 */
export function upsertConversationSummary(
  conversations: ChatConversationSummary[],
  next: ChatConversationSummary,
): ChatConversationSummary[] {
  const without: ChatConversationSummary[] = conversations.filter((row) => {
    return row.id !== next.id;
  });
  return [next, ...without];
}

/**
 * Inserts or replaces a folder by id (keeps relative order; new folders append).
 */
export function upsertFolderDto(
  folders: ChatFolderDto[],
  next: ChatFolderDto,
): ChatFolderDto[] {
  const index: number = folders.findIndex((folder) => folder.id === next.id);
  if (index < 0) {
    return [...folders, next];
  }
  return folders.map((folder, folderIndex) => {
    return folderIndex === index ? next : folder;
  });
}
