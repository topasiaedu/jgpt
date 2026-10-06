/**
 * Unit checks for AssistantMessage list parsing.
 * Blank lines between numbered items must stay one ordered list (1. 2. 3.).
 * Run from apps/web: npx tsx scripts/test-assistant-message-lists.ts
 */

import { parseBlocks } from "../components/AssistantMessage";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const spacedOrdered: string = [
  "Start here.",
  "",
  "1. First move",
  "",
  "2. Second move",
  "",
  "3. Third move",
  "",
  "Which of those three is missing?",
].join("\n");

const spacedBlocks = parseBlocks(spacedOrdered);
const orderedBlocks = spacedBlocks.filter((block) => block.kind === "ol");

assert(orderedBlocks.length === 1, `expected one <ol>, got ${orderedBlocks.length}`);
const onlyOl = orderedBlocks[0];
assert(onlyOl !== undefined && onlyOl.kind === "ol", "ordered block missing");
assert(onlyOl.items.length === 3, `expected 3 items, got ${onlyOl.items.length}`);
assert(onlyOl.items[0] === "First move", `item 0: ${onlyOl.items[0]}`);
assert(onlyOl.items[1] === "Second move", `item 1: ${onlyOl.items[1]}`);
assert(onlyOl.items[2] === "Third move", `item 2: ${onlyOl.items[2]}`);

const spacedUnordered: string = ["- alpha", "", "- beta", "", "- gamma"].join("\n");
const ulBlocks = parseBlocks(spacedUnordered).filter((block) => block.kind === "ul");
assert(ulBlocks.length === 1, `expected one <ul>, got ${ulBlocks.length}`);
const onlyUl = ulBlocks[0];
assert(onlyUl !== undefined && onlyUl.kind === "ul", "unordered block missing");
assert(onlyUl.items.length === 3, `expected 3 ul items, got ${onlyUl.items.length}`);

const contiguous: string = "1. a\n2. b\n3. c";
const contiguousOl = parseBlocks(contiguous).filter((block) => block.kind === "ol");
assert(contiguousOl.length === 1, "contiguous list should be one ol");
assert(contiguousOl[0]?.items.length === 3, "contiguous list should keep 3 items");

console.log("test-assistant-message-lists: ok");
