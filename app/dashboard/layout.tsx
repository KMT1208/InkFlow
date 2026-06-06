import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { DashboardNav } from "@/components/dashboard/nav";
import { getDashboardArtist } from "@/lib/dashboard";
import { signOut } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { artist, demo } = await getDashboardArtist();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-line bg-surface/30 lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Wordmark href="/dashboard" />
        </div>
        <div className="flex-1 px-3">
          <DashboardNav />
        </div>
        <div className="border-t border-line p-3">
          <Link
            href={`/${artist.slug}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone"
          >
            <ExternalLink className="h-4 w-4" /> Voir ma page
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-bone">
              {artist.display_name}
            </p>
            <p className="truncate text-xs text-bone-dim">
              inkflow.app/{artist.slug}
            </p>
          </div>
          <form action={signOut}>
            <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </form>
        </header>

        {demo && (
          <div className="bg-ink/10 px-5 py-2 text-center text-xs text-bone-dim">
            Tableau de bord en mode démonstration · branchez Supabase pour vos
            vraies données
          </div>
        )}

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
