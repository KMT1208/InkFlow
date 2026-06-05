import { Wordmark } from "@/components/wordmark";

// Mise en page commune des écrans d'authentification : carte centrée, sobre.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Wordmark />
        </div>
        <div className="rounded-2xl border border-line bg-surface/40 p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
