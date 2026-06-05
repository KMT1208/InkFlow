"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export function SignUpForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    undefined,
  );

  // Après inscription (si confirmation email activée), on affiche un message.
  if (state?.message) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4 text-sm text-bone-dim">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="displayName">Nom / blaze</Label>
        <Input id="displayName" name="displayName" required placeholder="Alex Ink" />
        <FieldError messages={state?.fieldErrors?.displayName} />
      </div>

      <div>
        <Label htmlFor="slug">Votre lien public</Label>
        <div className="flex items-center rounded-lg border border-line bg-surface focus-within:border-ink">
          <span className="pl-3 text-sm text-bone-dim">inkflow.app/</span>
          <input
            id="slug"
            name="slug"
            required
            placeholder="alex-ink"
            className="h-11 w-full rounded-r-lg bg-transparent pl-1 pr-3 text-sm text-bone outline-none placeholder:text-bone-dim/50"
          />
        </div>
        <FieldError messages={state?.fieldErrors?.slug} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        <FieldError messages={state?.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={state?.fieldErrors?.password} />
      </div>

      {state?.error && <p className="text-sm text-ink">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Création…" : "Créer mon studio"}
      </Button>
    </form>
  );
}
