/**
 * Renders assistant reply text as short paragraphs, lists, and light Markdown.
 * Keeps formatting readable without a full markdown dependency.
 * XSS-safe: model text stays in React text nodes (never HTML strings).
 */

import { Fragment } from "react";
import type { ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3;

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "hr" }
  | { kind: "heading"; level: HeadingLevel; text: string };

type AssistantMessageProps = {
  content: string;
};

/** True when a trimmed line is a Markdown horizontal rule. */
function isHorizontalRule(trimmed: string): boolean {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);
}

/**
 * Parses inline **bold**, *italic*, and `code` into React nodes.
 * Bold is matched before italic so **labels** stay intact.
 */
function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern: RegExp = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const boldText: string | undefined = match[1];
    const italicText: string | undefined = match[2];
    const codeText: string | undefined = match[3];

    if (boldText !== undefined) {
      nodes.push(<strong key={`b-${key}`}>{boldText}</strong>);
    } else if (italicText !== undefined) {
      nodes.push(<em key={`i-${key}`}>{italicText}</em>);
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
 * Splits raw assistant text into paragraph, list, heading, and rule blocks.
 * Blank lines separate paragraph beats, but do not split an open list
 * (so CSS counters stay 1. 2. 3. when the model blanks between items).
 */
export function parseBlocks(content: string): Block[] {
  const lines: string[] = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];

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
      return;
    }
    blocks.push({ kind: listKind, items: listItems });
    listKind = null;
    listItems = [];
  };

  for (const rawLine of lines) {
    const line: string = rawLine.trimEnd();
    const trimmed: string = line.trim();

    if (trimmed.length === 0) {
      // Blank lines breathe between paragraphs, but must not flush a list:
      // each flush would start a new <ol> and CSS counters restart at 1.
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

    const ulMatch: RegExpMatchArray | null = trimmed.match(/^[-*•]\s+(.+)$/);
    const olMatch: RegExpMatchArray | null = trimmed.match(/^\d+[.)]\s+(.+)$/);

    if (ulMatch !== null && ulMatch[1] !== undefined) {
      flushParagraph();
      if (listKind !== "ul") {
        flushList();
        listKind = "ul";
      }
      listItems.push(ulMatch[1].trim());
      continue;
    }

    if (olMatch !== null && olMatch[1] !== undefined) {
      flushParagraph();
      if (listKind !== "ol") {
        flushList();
        listKind = "ol";
      }
      listItems.push(olMatch[1].trim());
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
          if (block.level === 1) {
            return (
              <h3 key={`h-${index}`} className={headingClass}>
                {renderInline(block.text)}
              </h3>
            );
          }
          if (block.level === 2) {
            return (
              <h4 key={`h-${index}`} className={headingClass}>
                {renderInline(block.text)}
              </h4>
            );
          }
          return (
            <h5 key={`h-${index}`} className={headingClass}>
              {renderInline(block.text)}
            </h5>
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
                <li key={`uli-${itemIndex}`}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={`ol-${index}`} className="assistant-ol">
            {block.items.map((item, itemIndex) => (
              <li key={`oli-${itemIndex}`}>{renderInline(item)}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
