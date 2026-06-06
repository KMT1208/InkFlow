import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="grain relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[40vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/20 blur-[130px]" />
      </div>
      <div className="mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
        <h2 className="text-balance font-serif text-4xl font-semibold sm:text-6xl">
          Reprenez vos soirées.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-bone-dim">
          Lancez votre page de réservation aujourd&apos;hui. Vos clients réservent,
          paient et se souviennent — sans vous.
        </p>
        <div className="mt-9 flex justify-center">
          <Link
            href="/inscription"
            className={buttonClass("primary", "group h-12 px-8 text-base")}
          >
            Créer mon studio gratuitement
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
