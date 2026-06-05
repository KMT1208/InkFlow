"use client";

import { useActionState } from "react";
import { signInWithMagicLink, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

// Demande d'un lien de connexion par email (passwordless).
export function MagicLinkForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signInWithMagicLink,
    undefined,
  );

  if (state?.message) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4 text-sm text-bone-dim">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div>
        <Label htmlFor="magic-email">Recevoir un lien de connexion</Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@studio.com"
          required
        />
        <FieldError messages={state?.fieldErrors?.email} />
      </div>

      {state?.error && <p className="text-sm text-ink">{state.error}</p>}

      <Button type="submit" variant="outline" disabled={pending} className="w-full">
        {pending ? "Envoi…" : "M'envoyer un lien magique"}
      </Button>
    </form>
  );
}
