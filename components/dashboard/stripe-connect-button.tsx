"use client";

import { CreditCard } from "lucide-react";
import { connectStripeAccount } from "@/lib/actions/connect";
import { Button } from "@/components/ui/button";

// Bouton qui lance l'onboarding Stripe Connect (Server Action → redirection
// vers Stripe). À utiliser en mode réel (Supabase + Stripe configurés).
export function StripeConnectButton() {
  return (
    <form action={connectStripeAccount}>
      <Button type="submit">
        <CreditCard className="mr-1.5 h-4 w-4" /> Connecter mon compte Stripe
      </Button>
    </form>
  );
}
