import { AD_VS_ASSET_CHECKER_PACK } from "@/lib/modules/packs/ad-vs-asset-checker";
import { ADVICE_VS_EGO_COACH_PACK } from "@/lib/modules/packs/advice-vs-ego-coach";
import { AUTHORITY_RELATABLE_MIXER_PACK } from "@/lib/modules/packs/authority-relatable-mixer";
import { BIANHAO_COACH_PACK } from "@/lib/modules/packs/bianhao-coach";
import { BOSS_BRAND_BRIEF_PACK } from "@/lib/modules/packs/boss-brand-brief";
import { BULLET_CAPTION_PACK } from "@/lib/modules/packs/bullet-caption-pack";
import { COMMENT_TO_CONTENT_PACK } from "@/lib/modules/packs/comment-to-content";
import { CONTENT_ASSET_PLANNER_PACK } from "@/lib/modules/packs/content-asset-planner";
import { CONTENT_IDEATION_IP_PACK } from "@/lib/modules/packs/content-ideation-ip";
import { CRITICISM_ARMOR_PACK } from "@/lib/modules/packs/criticism-armor";
import { DIRECTION_FIXER_PACK } from "@/lib/modules/packs/direction-fixer";
import { DM_COMMENT_CLOSER_PACK } from "@/lib/modules/packs/dm-comment-closer";
import { DONT_OUTSOURCE_JUDGMENT_PACK } from "@/lib/modules/packs/dont-outsource-judgment";
import { FAQ_CONTENT_BANK_PACK } from "@/lib/modules/packs/faq-content-bank";
import { FIRST_IMPRESSION_SCRIPT_PACK } from "@/lib/modules/packs/first-impression-script";
import { HIGH_TICKET_CAUTION_PACK } from "@/lib/modules/packs/high-ticket-caution";
import { HOOK_REWRITER_PACK } from "@/lib/modules/packs/hook-rewriter";
import { HOT_TAKE_SCRIPT_PACK } from "@/lib/modules/packs/hot-take-script";
import { IG_REEL_SCRIPT_PACK } from "@/lib/modules/packs/ig-reel-script";
import { IP_PILLARS_PACK } from "@/lib/modules/packs/ip-pillars";
import { IP_STAGE_CHECK_PACK } from "@/lib/modules/packs/ip-stage-check";
import { LEAN_IP_SETUP_PACK } from "@/lib/modules/packs/lean-ip-setup";
import { LEARNING_JOURNEY_SERIES_PACK } from "@/lib/modules/packs/learning-journey-series";
import { LONG_VIDEO_TRUST_SCRIPT_PACK } from "@/lib/modules/packs/long-video-trust-script";
import { OFFER_EXPLANATION_SIMPLE_PACK } from "@/lib/modules/packs/offer-explanation-simple";
import { PLATFORM_ADAPTER_PACK } from "@/lib/modules/packs/platform-adapter";
import { PROCESS_PROOF_REEL_PACK } from "@/lib/modules/packs/process-proof-reel";
import { REVISION_SHARPEN_PACK } from "@/lib/modules/packs/revision-sharpen";
import { SCRIPT_HUMANIZER_PACK } from "@/lib/modules/packs/script-humanizer";
import { SCROLL_STOP_HOOK_PACK } from "@/lib/modules/packs/scroll-stop-hook";
import { SHORT_VS_LONG_PLANNER_PACK } from "@/lib/modules/packs/short-vs-long-planner";
import { SOFT_CTA_CLOSER_PACK } from "@/lib/modules/packs/soft-cta-closer";
import { SOUNDBITE_ONE_LINER_PACK } from "@/lib/modules/packs/soundbite-one-liner";
import { STANDPOINT_BUILDER_PACK } from "@/lib/modules/packs/standpoint-builder";
import { STORY_TRUST_SCRIPT_PACK } from "@/lib/modules/packs/story-trust-script";
import { TRUST_OFFER_BRIDGE_PACK } from "@/lib/modules/packs/trust-offer-bridge";
import { VALUE_CONVERT_LADDER_PACK } from "@/lib/modules/packs/value-convert-ladder";
import { VALUE_TEACHING_REEL_PACK } from "@/lib/modules/packs/value-teaching-reel";
import { WHO_I_SERVE_PACK } from "@/lib/modules/packs/who-i-serve";
import type { ModulePack } from "@/lib/modules/types";

/**
 * Registered module packs keyed by catalog module id.
 * Full proposed set shipped ready for stakeholder cut.
 */
const MODULE_PACKS: Record<string, ModulePack> = {
  [IP_STAGE_CHECK_PACK.moduleId]: IP_STAGE_CHECK_PACK,
  [STANDPOINT_BUILDER_PACK.moduleId]: STANDPOINT_BUILDER_PACK,
  [BOSS_BRAND_BRIEF_PACK.moduleId]: BOSS_BRAND_BRIEF_PACK,
  [LEAN_IP_SETUP_PACK.moduleId]: LEAN_IP_SETUP_PACK,
  [WHO_I_SERVE_PACK.moduleId]: WHO_I_SERVE_PACK,
  [IP_PILLARS_PACK.moduleId]: IP_PILLARS_PACK,
  [IG_REEL_SCRIPT_PACK.moduleId]: IG_REEL_SCRIPT_PACK,
  [SCROLL_STOP_HOOK_PACK.moduleId]: SCROLL_STOP_HOOK_PACK,
  [VALUE_TEACHING_REEL_PACK.moduleId]: VALUE_TEACHING_REEL_PACK,
  [HOT_TAKE_SCRIPT_PACK.moduleId]: HOT_TAKE_SCRIPT_PACK,
  [PROCESS_PROOF_REEL_PACK.moduleId]: PROCESS_PROOF_REEL_PACK,
  [FIRST_IMPRESSION_SCRIPT_PACK.moduleId]: FIRST_IMPRESSION_SCRIPT_PACK,
  [SHORT_VS_LONG_PLANNER_PACK.moduleId]: SHORT_VS_LONG_PLANNER_PACK,
  [LONG_VIDEO_TRUST_SCRIPT_PACK.moduleId]: LONG_VIDEO_TRUST_SCRIPT_PACK,
  [STORY_TRUST_SCRIPT_PACK.moduleId]: STORY_TRUST_SCRIPT_PACK,
  [AUTHORITY_RELATABLE_MIXER_PACK.moduleId]: AUTHORITY_RELATABLE_MIXER_PACK,
  [FAQ_CONTENT_BANK_PACK.moduleId]: FAQ_CONTENT_BANK_PACK,
  [LEARNING_JOURNEY_SERIES_PACK.moduleId]: LEARNING_JOURNEY_SERIES_PACK,
  [SOUNDBITE_ONE_LINER_PACK.moduleId]: SOUNDBITE_ONE_LINER_PACK,
  [CONTENT_ASSET_PLANNER_PACK.moduleId]: CONTENT_ASSET_PLANNER_PACK,
  [DIRECTION_FIXER_PACK.moduleId]: DIRECTION_FIXER_PACK,
  [VALUE_CONVERT_LADDER_PACK.moduleId]: VALUE_CONVERT_LADDER_PACK,
  [AD_VS_ASSET_CHECKER_PACK.moduleId]: AD_VS_ASSET_CHECKER_PACK,
  [COMMENT_TO_CONTENT_PACK.moduleId]: COMMENT_TO_CONTENT_PACK,
  [CONTENT_IDEATION_IP_PACK.moduleId]: CONTENT_IDEATION_IP_PACK,
  [ADVICE_VS_EGO_COACH_PACK.moduleId]: ADVICE_VS_EGO_COACH_PACK,
  [CRITICISM_ARMOR_PACK.moduleId]: CRITICISM_ARMOR_PACK,
  [BIANHAO_COACH_PACK.moduleId]: BIANHAO_COACH_PACK,
  [HIGH_TICKET_CAUTION_PACK.moduleId]: HIGH_TICKET_CAUTION_PACK,
  [DONT_OUTSOURCE_JUDGMENT_PACK.moduleId]: DONT_OUTSOURCE_JUDGMENT_PACK,
  [SOFT_CTA_CLOSER_PACK.moduleId]: SOFT_CTA_CLOSER_PACK,
  [TRUST_OFFER_BRIDGE_PACK.moduleId]: TRUST_OFFER_BRIDGE_PACK,
  [DM_COMMENT_CLOSER_PACK.moduleId]: DM_COMMENT_CLOSER_PACK,
  [OFFER_EXPLANATION_SIMPLE_PACK.moduleId]: OFFER_EXPLANATION_SIMPLE_PACK,
  [SCRIPT_HUMANIZER_PACK.moduleId]: SCRIPT_HUMANIZER_PACK,
  [REVISION_SHARPEN_PACK.moduleId]: REVISION_SHARPEN_PACK,
  [HOOK_REWRITER_PACK.moduleId]: HOOK_REWRITER_PACK,
  [PLATFORM_ADAPTER_PACK.moduleId]: PLATFORM_ADAPTER_PACK,
  [BULLET_CAPTION_PACK.moduleId]: BULLET_CAPTION_PACK,
};

/**
 * Looks up a runtime pack by module id. Returns undefined when not registered yet.
 */
export function getModulePack(moduleId: string): ModulePack | undefined {
  return MODULE_PACKS[moduleId];
}

/**
 * Returns true when a pack exists for this module id.
 */
export function hasModulePack(moduleId: string): boolean {
  return getModulePack(moduleId) !== undefined;
}
