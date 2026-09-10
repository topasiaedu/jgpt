import type { KeyboardEvent } from "react";

type ComposerKeyDownOptions = {
  /** True while a send is in flight; Enter must not re-submit. */
  isSending: boolean;
  /** Same path as the send button / form submit. */
  onSubmit: () => void;
};

/**
 * Enter sends; Shift+Enter inserts a newline.
 * Skips Enter while IME is composing (Chinese/Japanese/Korean input).
 */
export function handleComposerKeyDown(
  event: KeyboardEvent<HTMLTextAreaElement>,
  options: ComposerKeyDownOptions,
): void {
  if (event.key !== "Enter") {
    return;
  }

  // IME composition: isComposing on the native event; keyCode 229 is the legacy signal.
  const nativeEvent = event.nativeEvent;
  const isImeComposing: boolean =
    nativeEvent.isComposing || nativeEvent.keyCode === 229;

  if (isImeComposing) {
    return;
  }

  if (event.shiftKey) {
    // Allow default newline insertion.
    return;
  }

  if (options.isSending) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  options.onSubmit();
}
