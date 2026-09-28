import HookStudioWorkspace from "@/components/tools/HookStudioWorkspace";
import { getModuleById } from "@/lib/modules/catalog";
import { notFound } from "next/navigation";

/** Hook Formula pack powers Hook Studio generation. */
const HOOK_STUDIO_MODULE_ID = "scroll-stop-hook";

/**
 * Top-nav Hook Studio page: batch opens only (not merged with chat).
 */
export default function StudioPage() {
  const definition = getModuleById(HOOK_STUDIO_MODULE_ID);
  if (definition === undefined) {
    notFound();
  }

  return <HookStudioWorkspace module={definition} />;
}
