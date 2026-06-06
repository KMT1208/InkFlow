const steps = [
  {
    n: "01",
    title: "Le client réserve",
    text: "Il décrit son projet, joint ses références et choisit un créneau sur votre mini-site.",
  },
  {
    n: "02",
    title: "Il paie l'acompte",
    text: "Stripe encaisse l'acompte. La demande n'est confirmée qu'une fois le paiement reçu.",
  },
  {
    n: "03",
    title: "Vous tatouez",
    text: "Le RDV est dans votre calendrier, les rappels partent seuls. Vous n'ouvrez plus Instagram pour ça.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line/60 bg-surface/30">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-ink">
            Comment ça marche
          </span>
          <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Trois étapes, zéro friction.
          </h2>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n}>
              <span className="font-serif text-5xl text-ink/40">{s.n}</span>
              <h3 className="mt-3 font-serif text-2xl text-bone">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bone-dim">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
