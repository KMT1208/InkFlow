const faqs = [
  {
    q: "Faut-il une carte bancaire pour l'essai ?",
    a: "Non. Les 14 jours d'essai sont sans carte et sans engagement.",
  },
  {
    q: "Comment fonctionne l'acompte ?",
    a: "Vous fixez un montant ou un pourcentage. Le client le règle via Stripe avant que le rendez-vous soit confirmé. Pas d'acompte, pas de créneau.",
  },
  {
    q: "Mes clients doivent-ils créer un compte ?",
    a: "Non. Ils réservent depuis votre mini-site en quelques clics, sans inscription.",
  },
  {
    q: "Et la protection des données ?",
    a: "Hébergement en Europe, conforme RGPD. Vos données et celles de vos clients vous appartiennent — export et suppression à tout moment.",
  },
  {
    q: "Je peux garder mon style ?",
    a: "Oui. Votre mini-site est sombre, élégant et à votre image : logo, bio, galerie de flash.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line/60">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-ink">FAQ</span>
          <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Les questions qu&apos;on nous pose.
          </h2>
        </div>

        <div className="mt-12 divide-y divide-line">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-bone">
                {f.q}
                <span className="text-xl text-ink transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-bone-dim">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
