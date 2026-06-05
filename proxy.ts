import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 : ce qu'on appelait « middleware » se nomme désormais « proxy »
// (fichier proxy.ts à la racine). Son rôle ici : maintenir la session Supabase
// fraîche sur chaque requête, pour que les pages serveur connaissent l'utilisateur.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // S'exécute sur toutes les routes SAUF les fichiers statiques et images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
