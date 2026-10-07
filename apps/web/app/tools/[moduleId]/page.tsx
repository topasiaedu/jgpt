import { notFound, redirect } from "next/navigation";

import ModuleWorkspace from "@/components/tools/ModuleWorkspace";
import { resolveToolBrandProfile } from "@/lib/brandProfile/resolveToolBrandProfile";
import { getModuleById } from "@/lib/modules/catalog";
import { buildAuthHref, buildToolReturnPath } from "@/lib/modules/homeHandoff";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
  searchParams: Promise<{
    from?: string | string[];
    q?: string | string[];
    profile?: string | string[];
    c?: string | string[];
  }>;
};

/**
 * Per-module route: validates catalog id, then lands in module chat.
 * Optional `?from=home&q=` carries prior home intent (length-capped in workspace).
 * Optional `?profile=<uuid>` selects an owned Brand profile. Omitted means continue without.
 */
export default async function ModulePage({ params, searchParams }: ModulePageProps) {
  const { moduleId } = await params;
  const resolvedSearch = await searchParams;
  const definition = getModuleById(moduleId);
  if (definition === undefined) {
    notFound();
  }

  const profileResolution = await resolveToolBrandProfile({
    profile: resolvedSearch.profile,
  });
  if (!profileResolution.ok) {
    redirect(buildAuthHref(buildToolReturnPath(moduleId, resolvedSearch)));
  }

  return (
    <ModuleWorkspace
      module={definition}
      brandProfileId={profileResolution.profileId}
      searchParams={{
        from: resolvedSearch.from,
        q: resolvedSearch.q,
        profile: resolvedSearch.profile,
        c: resolvedSearch.c,
      }}
    />
  );
}
