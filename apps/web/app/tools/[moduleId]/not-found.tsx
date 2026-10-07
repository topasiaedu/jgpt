import Link from "next/link";

/**
 * Unknown module id or missing route.
 */
export default function NotFound() {
  return (
    <div className="shell shell-studio">
      <header className="header header-create">
        <h1 className="studio-title">Tool not found</h1>
        <p className="studio-subtitle">That module id is not in the Jeff IP tools catalog.</p>
      </header>
      <main className="studio-main">
        <p>
          <Link href="/tools" className="tools-back-link">
            Back to All Tools
          </Link>
        </p>
      </main>
    </div>
  );
}
