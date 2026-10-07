"use client";

import {
  CHAT_FOLDER_COLORS,
  type ChatFolderColor,
} from "@/lib/chatHistory/types";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/messages";

type FolderColorPickerProps = {
  idPrefix: string;
  value: ChatFolderColor;
  disabled: boolean;
  onChange: (color: ChatFolderColor) => void;
  /** When true, show a visible Color legend instead of sr-only. */
  showLegend?: boolean;
};

/**
 * Compact 8-swatch palette for folder create/edit.
 */
export default function FolderColorPicker({
  idPrefix,
  value,
  disabled,
  onChange,
  showLegend = false,
}: FolderColorPickerProps) {
  const { t } = useI18n();
  return (
    <fieldset className="chat-history-color-picker" disabled={disabled}>
      <legend className={showLegend ? "chat-history-field-label" : "sr-only"}>
        {t("histFolderColor")}
      </legend>
      <div
        className="chat-history-color-swatches"
        role="radiogroup"
        aria-label={t("histFolderColor")}
      >
        {CHAT_FOLDER_COLORS.map((color) => {
          const selected: boolean = color === value;
          const inputId: string = `${idPrefix}-${color}`;
          return (
            <label
              key={color}
              htmlFor={inputId}
              className={
                selected
                  ? "chat-history-color-option chat-history-color-option-selected"
                  : "chat-history-color-option"
              }
              title={t(folderColorMessageKey(color))}
            >
              <input
                id={inputId}
                className="sr-only"
                type="radio"
                name={idPrefix}
                value={color}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(color)}
              />
              <span
                className={`chat-history-folder-swatch chat-history-folder-swatch-${color}`}
                aria-hidden="true"
              />
              <span className="sr-only">{t(folderColorMessageKey(color))}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * i18n key for a palette color name.
 */
export function folderColorMessageKey(color: ChatFolderColor): MessageKey {
  switch (color) {
    case "coral":
      return "histFolderColorCoral";
    case "amber":
      return "histFolderColorAmber";
    case "lime":
      return "histFolderColorLime";
    case "teal":
      return "histFolderColorTeal";
    case "sky":
      return "histFolderColorSky";
    case "violet":
      return "histFolderColorViolet";
    case "rose":
      return "histFolderColorRose";
    case "slate":
      return "histFolderColorSlate";
  }
}
