import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/Sidebar";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { AuthRedirect } from "@/components/ui/AuthRedirect";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Client-side redirect instead of server redirect so that
  // crawlers (Twitter, Facebook, etc.) still receive the HTML
  // response with <head> metadata and OG images from child pages.
  if (!session?.user) return <AuthRedirect />;

  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "miel-dark";

  return (
    <div className="min-h-screen">
      <Sidebar user={session.user} theme={theme} />
      <CommandPalette />
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
