/**
 * Renders assistant reply text as short paragraphs, lists, and light Markdown.
 * Keeps formatting readable without a full markdown dependency.
 * XSS-safe: model text stays in React text nodes (never HTML strings).
 */

import { Fragment } from "react";
import type { CSSProperties, ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3;

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[]; start: number }
  | { kind: "hr" }
  | { kind: "heading"; level: HeadingLevel; text: string };

type AssistantMessageProps = {
  content: string;
};

type OrderedItem = {
  n: number;
  text: string;
};

/** True when a trimmed line is a Markdown horizontal rule. */
function isHorizontalRule(trimmed: string): boolean {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);
}

/** True when a trimmed line is a markdown heading (# through ###). */
function isHeadingLine(trimmed: string): boolean {
  return /^(#{1,3})\s+\S/.test(trimmed);
}

/**
 * Parses a markdown unordered list item.
 * @param trimmed - One trimmed source line
 * @returns Item text, or null when the line is not a ul marker
 */
function parseUnorderedItem(trimmed: string): string | null {
  const match: RegExpMatchArray | null = trimmed.match(/^[-*•]\s+(.+)$/);
  if (match === null || match[1] === undefined) {
    return null;
  }
  return match[1].trim();
}

/**
 * Parses a markdown ordered list item, keeping the explicit number.
 * @param trimmed - One trimmed source line
 * @returns Number plus item text, or null when the line is not an ol marker
 */
function parseOrderedItem(trimmed: string): OrderedItem | null {
  const match: RegExpMatchArray | null = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
  if (match === null || match[1] === undefined || match[2] === undefined) {
    return null;
  }
  const n: number = Number.parseInt(match[1], 10);
  if (!Number.isFinite(n) || n < 1) {
    return null;
  }
  return { n, text: match[2].trim() };
}

/**
 * Looks ahead to see whether another item of the same list kind still follows.
 * Unlabeled lines and nested other-kind markers in between do not end the list
 * when another same-kind item appears before a heading or rule.
 * @param lines - Full source lines
 * @param fromExclusive - Index of the current line
 * @param kind - Open list kind
 */
function sameListContinuesAfter(
  lines: string[],
  fromExclusive: number,
  kind: "ul" | "ol",
): boolean {
  for (let index = fromExclusive + 1; index < lines.length; index += 1) {
    const raw: string | undefined = lines[index];
    if (raw === undefined) {
      return false;
    }
    const trimmed: string = raw.trim();
    if (trimmed.length === 0) {
      continue;
    }
    if (isHorizontalRule(trimmed) || isHeadingLine(trimmed)) {
      return false;
    }
    const ulText: string | null = parseUnorderedItem(trimmed);
    const olItem: OrderedItem | null = parseOrderedItem(trimmed);
    if (kind === "ol") {
      if (olItem !== null) {
        return true;
      }
      continue;
    }
    if (ulText !== null) {
      return true;
    }
    if (olItem !== null) {
      return false;
    }
  }
  return false;
}

/**
 * Appends a continuation line onto the last list item (blank-separated details).
 * @param items - Mutable item texts
 * @param extra - Continuation text, including original markers when nested
 */
function appendContinuation(items: string[], extra: string): void {
  const lastIndex: number = items.length - 1;
  const last: string | undefined = items[lastIndex];
  if (last === undefined) {
    items.push(extra);
    return;
  }
  items[lastIndex] = [last, extra].join("\n");
}

/**
 * Parses inline **bold**, __bold__, *italic*, _italic_, and `code` into React nodes.
 * Bold forms are matched before italic so **labels** stay intact.
 */
function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern: RegExp =
    /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const starBold: string | undefined = match[1];
    const underscoreBold: string | undefined = match[2];
    const starItalic: string | undefined = match[3];
    const underscoreItalic: string | undefined = match[4];
    const codeText: string | undefined = match[5];

    if (starBold !== undefined) {
      nodes.push(<strong key={`b-${key}`}>{starBold}</strong>);
    } else if (underscoreBold !== undefined) {
      nodes.push(<strong key={`b-${key}`}>{underscoreBold}</strong>);
    } else if (starItalic !== undefined) {
      nodes.push(<em key={`i-${key}`}>{starItalic}</em>);
    } else if (underscoreItalic !== undefined) {
      nodes.push(<em key={`i-${key}`}>{underscoreItalic}</em>);
    } else if (codeText !== undefined) {
      nodes.push(
        <code key={`c-${key}`} className="assistant-code">
          {codeText}
        </code>,
      );
    }

    key += 1;
    lastIndex = match.index + match[0].length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (nodes.length === 0) {
    return text;
  }

  return nodes;
}

/**
 * Renders one or more paragraph lines, preserving single newlines as breaks.
 */
function renderParagraphLines(lines: string[]): ReactNode {
  return lines.map((line, index) => (
    <Fragment key={`line-${index}`}>
      {index > 0 ? <br /> : null}
      {renderInline(line)}
    </Fragment>
  ));
}

/**
 * Renders a list item that may include continuation lines (对象 / 痛点, nested bullets).
 */
function renderListItemText(item: string): ReactNode {
  if (!item.includes("\n")) {
    return renderInline(item);
  }
  return renderParagraphLines(item.split("\n"));
}

/**
 * Splits raw assistant text into paragraph, list, heading, and rule blocks.
 * Blank lines do not split an open list. Unlabeled lines between numbered items
 * stay on the previous item so CSS counters can run 1. 2. 3. in one <ol>.
 */
export function parseBlocks(content: string): Block[] {
  const lines: string[] = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let orderedStart: number = 1;

  const flushParagraph = (): void => {
    if (paragraphLines.length === 0) {
      return;
    }
    blocks.push({ kind: "paragraph", lines: paragraphLines });
    paragraphLines = [];
  };

  const flushList = (): void => {
    if (listKind === null || listItems.length === 0) {
      listKind = null;
      listItems = [];
      orderedStart = 1;
      return;
    }
    if (listKind === "ol") {
      blocks.push({ kind: "ol", items: listItems, start: orderedStart });
    } else {
      blocks.push({ kind: "ul", items: listItems });
    }
    listKind = null;
    listItems = [];
    orderedStart = 1;
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine: string | undefined = lines[lineIndex];
    if (rawLine === undefined) {
      continue;
    }
    const line: string = rawLine.trimEnd();
    const trimmed: string = line.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      continue;
    }

    if (isHorizontalRule(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "hr" });
      continue;
    }

    const headingMatch: RegExpMatchArray | null = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch !== null && headingMatch[1] !== undefined && headingMatch[2] !== undefined) {
      flushParagraph();
      flushList();
      const hashCount: number = headingMatch[1].length;
      const level: HeadingLevel = hashCount === 3 ? 3 : hashCount === 2 ? 2 : 1;
      blocks.push({ kind: "heading", level, text: headingMatch[2].trim() });
      continue;
    }

    const ulText: string | null = parseUnorderedItem(trimmed);
    const olItem: OrderedItem | null = parseOrderedItem(trimmed);

    if (ulText !== null) {
      if (listKind === "ol" && sameListContinuesAfter(lines, lineIndex, "ol")) {
        appendContinuation(listItems, trimmed);
        continue;
      }
      flushParagraph();
      if (listKind !== "ul") {
        flushList();
        listKind = "ul";
      }
      listItems.push(ulText);
      continue;
    }

    if (olItem !== null) {
      flushParagraph();
      if (listKind !== "ol") {
        flushList();
        listKind = "ol";
        orderedStart = olItem.n;
      }
      listItems.push(olItem.text);
      continue;
    }

    if (listKind !== null && listItems.length > 0 && sameListContinuesAfter(lines, lineIndex, listKind)) {
      appendContinuation(listItems, trimmed);
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  if (blocks.length === 0 && content.trim().length > 0) {
    return [{ kind: "paragraph", lines: [content.trim()] }];
  }

  return blocks;
}

/**
 * Formats one assistant message for stakeholder readability.
 */
export default function AssistantMessage({ content }: AssistantMessageProps) {
  const blocks: Block[] = parseBlocks(content);

  return (
    <div className="message-body message-body-assistant">
      {blocks.map((block, index) => {
        if (block.kind === "hr") {
          return <hr key={`hr-${index}`} className="assistant-hr" />;
        }
        if (block.kind === "heading") {
          const headingClass = `assistant-heading assistant-heading-${block.level}`;
          const headingText: ReactNode = renderInline(block.text);
          if (block.level === 1) {
            return (
              <h2 key={`h-${index}`} className={headingClass}>
                {headingText}
              </h2>
            );
          }
          if (block.level === 2) {
            return (
              <h2 key={`h-${index}`} className={headingClass}>
                {headingText}
              </h2>
            );
          }
          return (
            <h3 key={`h-${index}`} className={headingClass}>
              {headingText}
            </h3>
          );
        }
        if (block.kind === "paragraph") {
          return (
            <p key={`p-${index}`} className="assistant-p">
              {renderParagraphLines(block.lines)}
            </p>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={`ul-${index}`} className="assistant-ul">
              {block.items.map((item, itemIndex) => (
                <li key={`uli-${itemIndex}`}>{renderListItemText(item)}</li>
              ))}
            </ul>
          );
        }
        const olStyle: CSSProperties = {
          "--assistant-ol-start": block.start - 1,
        };
        return (
          <ol
            key={`ol-${index}`}
            className="assistant-ol"
            start={block.start}
            style={olStyle}
          >
            {block.items.map((item, itemIndex) => (
              <li key={`oli-${itemIndex}`}>{renderListItemText(item)}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
