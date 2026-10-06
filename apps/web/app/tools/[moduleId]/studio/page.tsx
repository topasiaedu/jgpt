import { redirect } from "next/navigation";

type LegacyStudioPageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

/**
 * Legacy nested Studio path. Batch UI removed; bounce to tool chat.
 * Hook Formula ids land on `/tools/scroll-stop-hook`.
 */
export default async function LegacyHookStudioRedirect({
  params,
}: LegacyStudioPageProps): Promise<never> {
  const { moduleId } = await params;
  if (moduleId === "scroll-stop-hook") {
    redirect("/tools/scroll-stop-hook");
  }
  redirect(`/tools/${moduleId}`);
}
