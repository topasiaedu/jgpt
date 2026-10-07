import ChatShell from "@/components/ChatShell";

/**
 * Home: Influence Engine Coach create landing.
 * Unsigned users are redirected to /auth by ChatShell, not shown a sign-in panel.
 */
export default function HomePage() {
  return <ChatShell />;
}
