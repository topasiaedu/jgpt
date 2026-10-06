import { redirect } from "next/navigation";

/**
 * Legacy Hook Studio URL. Batch UI removed; send users to Hook Formula chat.
 */
export default function StudioPage(): never {
  redirect("/tools/scroll-stop-hook");
}
