import { BellOff, CalendarX2, MessageSquareX } from "lucide-react";

const pains = [
  {
    icon: MessageSquareX,
    title: "50 DM par jour",
    text: "« Tu fais combien pour un avant-bras ? » — répété, copié-collé, puis oublié au fond de la boîte de réception.",
  },
  {
    icon: CalendarX2,
    title: "Des no-shows",
    text: "Pas d'acompte, pas d'engagement. Un créneau bloqué pour quelqu'un qui ne viendra pas.",
  },
  {
    icon: BellOff,
    title: "Rappels à la main",
    text: "Relancer chaque client la veille, un par un, quand vous y pensez — entre deux séances.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-line/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-ink">Le problème</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-semibold sm:text-5xl">
            Instagram n&apos;a jamais été un logiciel de réservation.
          </h2>
          <p className="mt-4 text-lg text-bone-dim">
            Et pourtant, c&apos;est là que passe toute votre gestion. Résultat :
            du temps perdu, des trous dans le planning, et de la charge mentale.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {pains.map((p) => (
            <div key={p.title} className="rounded-2xl border border-line bg-noir/40 p-6">
              <p.icon className="h-6 w-6 text-ink" />
              <h3 className="mt-4 font-serif text-xl text-bone">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bone-dim">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
