/**
 * Smoke checks for folder grouping and nested folder trees.
 */

import {
  buildFolderConversationTree,
  collectFolderAndDescendantIds,
  groupConversationsByFolder,
  listChatHistorySidebarSections,
  listFoldersForMove,
  listValidParentsForFolder,
  upsertFolderDto,
} from "../lib/chatHistory/group";
import type {
  ChatConversationSummary,
  ChatFolderDto,
} from "../lib/chatHistory/types";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function sampleConversation(
  id: string,
  folderId: string | null,
): ChatConversationSummary {
  return {
    id,
    moduleId: "ig-reel-script",
    brandProfileId: null,
    folderId,
    title: id,
    createdAt: "2026-10-06T00:00:00.000Z",
    updatedAt: "2026-10-06T00:00:00.000Z",
  };
}

function sampleFolder(
  id: string,
  name: string,
  parentFolderId: string | null = null,
): ChatFolderDto {
  return {
    id,
    name,
    color: "coral",
    parentFolderId,
    brandProfileId: null,
    createdAt: "2026-10-06T00:00:00.000Z",
    updatedAt: "2026-10-06T00:00:00.000Z",
  };
}

const folderA = sampleFolder("fa", "Launch");
const folderB = sampleFolder("fb", "Empty");
const grouped = groupConversationsByFolder(
  [
    sampleConversation("c1", "fa"),
    sampleConversation("c2", null),
    sampleConversation("c3", "missing"),
  ],
  [folderA, folderB],
);

assert(grouped.folderGroups.length === 2, "expected both folders, including empty");
assert(grouped.folderGroups[0]?.conversations.length === 1, "folder A should hold c1");
assert(grouped.folderGroups[1]?.conversations.length === 0, "empty folders stay visible");
assert(grouped.ungrouped.length === 2, "null and unknown folder ids are Ungrouped");

const root = sampleFolder("root", "Root");
const child = sampleFolder("child", "Child", "root");
const orphan = sampleFolder("orphan", "Orphan", "gone");
const tree = buildFolderConversationTree(
  [
    sampleConversation("in-root", "root"),
    sampleConversation("in-child", "child"),
    sampleConversation("loose", null),
  ],
  [root, child, orphan],
);

assert(tree.roots.length === 2, "root + orphaned child become roots");
const rootNode = tree.roots.find((node) => node.folder.id === "root");
assert(rootNode !== undefined, "root node present");
if (rootNode !== undefined) {
  assert(rootNode.children.length === 1, "child nests under root");
  assert(rootNode.children[0]?.folder.id === "child", "nested child id");
  assert(rootNode.conversations.length === 1, "root keeps its chats");
}
assert(tree.ungrouped.length === 1, "ungrouped stays ungrouped");

const sections = listChatHistorySidebarSections(
  [
    sampleConversation("in-root", "root"),
    sampleConversation("in-child", "child"),
    sampleConversation("loose", null),
  ],
  [root, child, orphan],
);
assert(sections.length === 3, "two folder roots then one ungrouped section");
assert(sections[0]?.kind === "folder", "folders render before ungrouped");
assert(sections[1]?.kind === "folder", "second folder root still before ungrouped");
assert(sections[2]?.kind === "ungrouped", "ungrouped section is last");
if (sections[2]?.kind === "ungrouped") {
  assert(sections[2].conversations.length === 1, "loose chat stays in trailing bucket");
  assert(sections[2].conversations[0]?.id === "loose", "trailing bucket holds null folder_id");
}
const folderKindsBeforeUngrouped: boolean = sections.every((section, index) => {
  if (section.kind === "ungrouped") {
    return index === sections.length - 1;
  }
  return true;
});
assert(folderKindsBeforeUngrouped, "no ungrouped section may precede a folder");

const removed = collectFolderAndDescendantIds([root, child, orphan], "root");
assert(removed.has("root") && removed.has("child"), "delete collects descendants");
assert(!removed.has("orphan"), "unrelated folders stay");

const moveOrder = listFoldersForMove([child, orphan, root]);
assert(moveOrder[0]?.id === "root", "move list starts with roots");
assert(moveOrder[1]?.id === "child", "child follows its parent in move list");
assert(moveOrder[2]?.id === "orphan", "orphans still appear in move list");

const parentsForChild = listValidParentsForFolder([root, child], "child");
assert(
  parentsForChild.length === 1 && parentsForChild[0]?.id === "root",
  "child may nest under root",
);
const parentsForRoot = listValidParentsForFolder([root, child], "root");
assert(parentsForRoot.length === 0, "folder with children cannot nest");

const withNewFolder = upsertFolderDto([root], orphan);
assert(withNewFolder.length === 2, "upsertFolderDto appends unknown folders");
assert(withNewFolder[1]?.id === "orphan", "new folder is appended");
const renamedRoot = { ...root, name: "Renamed" };
const withReplace = upsertFolderDto([root, orphan], renamedRoot);
assert(withReplace[0]?.name === "Renamed", "upsertFolderDto replaces by id");
assert(withReplace[1]?.id === "orphan", "other folders keep order");

const unknownFolderChat = sampleConversation("ghost", "missing-folder");
const ghostGrouped = groupConversationsByFolder([unknownFolderChat], [root]);
assert(
  ghostGrouped.ungrouped.some((row) => row.id === "ghost"),
  "folderId not in known folders stays Ungrouped",
);

console.log("test-chat-history-group: ok");
