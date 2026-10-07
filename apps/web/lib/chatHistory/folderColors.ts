/**
 * Constrained palette for chat folder color dots (groups and subfolders).
 */

/** Named colors stored in chat_folders.color. */
export const CHAT_FOLDER_COLORS = [
  "coral",
  "amber",
  "lime",
  "teal",
  "sky",
  "violet",
  "rose",
  "slate",
] as const;

export type ChatFolderColor = (typeof CHAT_FOLDER_COLORS)[number];

/** Default when the client omits color on create. */
export const DEFAULT_CHAT_FOLDER_COLOR: ChatFolderColor = "coral";

/**
 * True when value is one of the allowed folder color names.
 */
export function isChatFolderColor(value: string): value is ChatFolderColor {
  for (const color of CHAT_FOLDER_COLORS) {
    if (color === value) {
      return true;
    }
  }
  return false;
}

/**
 * Parses a color string from API/DB input. Invalid values return null.
 */
export function parseChatFolderColor(value: unknown): ChatFolderColor | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed: string = value.trim().toLowerCase();
  if (!isChatFolderColor(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Stable palette pick from a brand profile id (same profile → same color).
 */
export function pickFolderColorForProfileId(brandProfileId: string): ChatFolderColor {
  const id: string = brandProfileId.trim().toLowerCase();
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  const colorIndex: number = hash % CHAT_FOLDER_COLORS.length;
  const color: ChatFolderColor | undefined = CHAT_FOLDER_COLORS[colorIndex];
  if (color === undefined) {
    return DEFAULT_CHAT_FOLDER_COLOR;
  }
  return color;
}
