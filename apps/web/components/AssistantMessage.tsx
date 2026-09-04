/**
 * Renders assistant reply text as short paragraphs and simple lists.
 * Keeps formatting readable without a full markdown dependency.
 */

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

type AssistantMessageProps = {
  content: string;
};

/**
 * Splits raw assistant text into paragraph and list blocks.
 * Blank lines become separate beats so \n\n spacing shows in the UI.
 */
function parseBlocks(content: string): Block[] {
  const lines: string[] = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraphLines: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = (): void => {
    if (paragraphLines.length === 0) {
      return;
    }
    const text: string = paragraphLines.join(" ").trim();
    if (text.length > 0) {
      blocks.push({ kind: "paragraph", text });
    }
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
      flushParagraph();
      flushList();
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
    return [{ kind: "paragraph", text: content.trim() }];
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
        if (block.kind === "paragraph") {
          return (
            <p key={`p-${index}`} className="assistant-p">
              {block.text}
            </p>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={`ul-${index}`} className="assistant-ul">
              {block.items.map((item, itemIndex) => (
                <li key={`uli-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={`ol-${index}`} className="assistant-ol">
            {block.items.map((item, itemIndex) => (
              <li key={`oli-${itemIndex}`}>{item}</li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
