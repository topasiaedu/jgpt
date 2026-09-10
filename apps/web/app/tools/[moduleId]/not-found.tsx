import Link from "next/link";

/**
 * Unknown module id or missing route.
 */
export default function NotFound() {
  return (
    <div className="shell">
      <header className="header">
        <h1 className="title">Tool not found</h1>
        <p className="subtitle">That module id is not in the Jeff IP tools catalog.</p>
      </header>
      <p>
        <Link href="/tools" className="tools-back-link">
          Back to All Tools
        </Link>
      </p>
    </div>
  );
}
