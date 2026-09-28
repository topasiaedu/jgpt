/**
 * Critical vs optional slot helpers for Quality Runtime.
 * Chat-first: slots are prompt checklist only, never a form UI.
 */

import type { IntakeField, ModulePack } from "@/lib/modules/types";
import type { QualitySlot } from "@/lib/modules/qualityRuntime/types";

/**
 * True when this pack opted into Quality Runtime.
 * Undefined / false keeps legacy soft checklist behavior.
 */
export function isQualityRuntimeEnabled(pack: ModulePack): boolean {
  return pack.qualityRuntime === true;
}

/**
 * Adapts a legacy IntakeField into a QualitySlot.
 * required === true maps to critical; otherwise optional.
 */
export function qualitySlotFromIntakeField(field: IntakeField): QualitySlot {
  return {
    id: field.id,
    label: field.label,
    criticality: field.required === true ? "critical" : "optional",
    placeholder: field.placeholder,
    helpText: field.helpText,
    multiline: field.multiline,
  };
}

/**
 * Resolves typed slots for a pack.
 * Prefer pack.qualitySlots when present; else adapt intakeFields.
 */
export function resolveQualitySlots(pack: ModulePack): QualitySlot[] {
  if (pack.qualitySlots !== undefined && pack.qualitySlots.length > 0) {
    return pack.qualitySlots;
  }
  return pack.intakeFields.map(qualitySlotFromIntakeField);
}

/**
 * Critical slots only (Collect gate).
 */
export function criticalQualitySlots(pack: ModulePack): QualitySlot[] {
  return resolveQualitySlots(pack).filter((slot) => slot.criticality === "critical");
}

/**
 * Formats typed slots as an internal checklist for the system overlay.
 */
export function formatQualitySlotChecklist(slots: QualitySlot[]): string {
  if (slots.length === 0) {
    return "(no named slots; ask only what this module job requires)";
  }

  return slots
    .map((slot) => {
      const need: string =
        slot.criticality === "critical"
          ? "CRITICAL: must collect before Confirm / Deliver"
          : "optional";
      const hint: string =
        typeof slot.probeHint === "string" && slot.probeHint.trim().length > 0
          ? ` | ask hint: ${slot.probeHint.trim()}`
          : "";
      return `- ${slot.label} (${slot.id}) [${need}]${hint}`;
    })
    .join("\n");
}
