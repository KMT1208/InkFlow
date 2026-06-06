import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { buttonClass } from "@/components/ui/button";

const links = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-noir/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Wordmark />
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-bone-dim transition-colors hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/connexion" className={buttonClass("ghost", "hidden h-10 px-4 sm:inline-flex")}>
            Se connecter
          </Link>
          <Link href="/inscription" className={buttonClass("primary", "h-10 px-5")}>
            Créer mon studio
          </Link>
        </div>
      </nav>
    </header>
  );
}
