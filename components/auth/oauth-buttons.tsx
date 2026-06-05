import { signInWithGoogle } from "@/lib/actions/auth";

// Bouton « Continuer avec Google ». Un simple <form> qui appelle l'action
// serveur signInWithGoogle (laquelle redirige vers l'écran de consentement).
export function OAuthButtons() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-full border border-line bg-surface text-sm font-medium text-bone transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>
    </form>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.21 7.21 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.26A11.99 11.99 0 0 0 0 12c0 1.93.46 3.76 1.26 5.38l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.26 6.62l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
