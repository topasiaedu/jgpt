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

const headingBlocks = parseBlocks("## Hook\n\n**Pain** is the stop.");
assert(headingBlocks[0]?.kind === "heading", "expected a heading block");
if (headingBlocks[0]?.kind === "heading") {
  assert(headingBlocks[0].level === 2, "expected h2 hashes to be level 2");
  assert(headingBlocks[0].text === "Hook", `heading text: ${headingBlocks[0].text}`);
}

const screenshotShape: string = [
  "So tell me:",
  "",
  "- Who exactly is this video for?",
  "- What's the biggest pain or frustration they have around coffee or your offer?",
].join("\n");
const screenshotBlocks = parseBlocks(screenshotShape);
const screenshotUl = screenshotBlocks.filter((block) => block.kind === "ul");
assert(screenshotUl.length === 1, `screenshot shape expected one ul, got ${screenshotUl.length}`);
assert(screenshotUl[0]?.kind === "ul" && screenshotUl[0].items.length === 2, "screenshot shape should keep 2 bullets");

const starUl = parseBlocks("* first\n* second").filter((block) => block.kind === "ul");
assert(starUl.length === 1 && starUl[0]?.kind === "ul" && starUl[0].items.length === 2, "star bullets should parse as ul");

const restartOnes: string = [
  "Got it. Hook Formula for Demo Coffee Co:",
  "",
  "1. Busy KL coffee lovers tired of guessing grind size?",
  "",
  "对象: Busy KL coffee lovers",
  "痛点: Guessing grind size wastes beans",
  "",
  "1. Professionals in Penang frustrated by mystery blends?",
  "",
  "对象: Professionals in Penang",
  "痛点: Mystery blends disappoint",
  "",
  "1. Want cafe-quality coffee at home but hate queues?",
  "",
  "对象: Home brewers wanting cafe quality",
  "",
  "Pick one to film first?",
].join("\n");
const restartBlocks = parseBlocks(restartOnes);
const restartOl = restartBlocks.filter((block) => block.kind === "ol");
assert(restartOl.length === 1, `hook-style 1. 1. 1. should be one ol, got ${restartOl.length}`);
assert(restartOl[0]?.kind === "ol" && restartOl[0].items.length === 3, "hook-style should keep 3 numbered items");
assert(restartOl[0]?.kind === "ol" && restartOl[0].start === 1, "explicit start should be 1");
const lastRestart = restartBlocks[restartBlocks.length - 1];
assert(lastRestart?.kind === "paragraph", "closing ask should stay a paragraph");
if (lastRestart?.kind === "paragraph") {
  assert(lastRestart.lines[0] === "Pick one to film first?", `closing ask: ${lastRestart.lines[0]}`);
}

const offsetOl = parseBlocks("3. Later\n4. Next").filter((block) => block.kind === "ol");
assert(offsetOl.length === 1 && offsetOl[0]?.kind === "ol" && offsetOl[0].start === 3, "explicit start should parse 3");

const optionHeadings = parseBlocks("## KL coffee lovers\n\nBusy KL coffee lovers tired of guessing?\n\n- 对象: Busy KL coffee lovers\n- 痛点: Guessing grind size");
assert(optionHeadings[0]?.kind === "heading" && optionHeadings[0].level === 2, "option ## should be heading 2");
const optionUl = optionHeadings.filter((block) => block.kind === "ul");
assert(optionUl.length === 1 && optionUl[0]?.kind === "ul" && optionUl[0].items.length === 2, "legs under a heading should be one ul");

console.log("test-assistant-message-lists: ok");
