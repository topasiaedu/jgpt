import { redirect } from "next/navigation";

type LegacyStudioPageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

/**
 * Legacy path: `/tools/scroll-stop-hook/studio` → `/studio`.
 * Other module ids bounce back to that tool's chat.
 */
export default async function LegacyHookStudioRedirect({
  params,
}: LegacyStudioPageProps) {
  const { moduleId } = await params;
  if (moduleId === "scroll-stop-hook") {
    redirect("/studio");
  }
  redirect(`/tools/${moduleId}`);
}
