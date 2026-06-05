import Link from "next/link";
import { cn } from "@/lib/utils";

// Logotype texte « InkFlow » (serif). Réutilisé dans l'auth et le tableau de bord.
export function Wordmark({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-serif text-2xl font-semibold tracking-tight text-bone",
        className,
      )}
    >
      InkFlow
    </Link>
  );
}
