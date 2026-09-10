import { notFound } from "next/navigation";

import ModuleWorkspace from "@/components/tools/ModuleWorkspace";
import { getModuleById } from "@/lib/modules/catalog";

type ModulePageProps = {
  params: Promise<{
    moduleId: string;
  }>;
  searchParams: Promise<{
    from?: string | string[];
    q?: string | string[];
  }>;
};

/**
 * Per-module route: validates catalog id, then lands in fresh module chat.
 * Optional `?from=home&q=` carries prior home intent (length-capped in workspace).
 */
export default async function ModulePage({ params, searchParams }: ModulePageProps) {
  const { moduleId } = await params;
  const resolvedSearch = await searchParams;
  const definition = getModuleById(moduleId);
  if (definition === undefined) {
    notFound();
  }

  return (
    <ModuleWorkspace
      module={definition}
      searchParams={{
        from: resolvedSearch.from,
        q: resolvedSearch.q,
      }}
    />
  );
}
