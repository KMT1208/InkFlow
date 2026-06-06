import {
  CalendarClock,
  CreditCard,
  Images,
  Inbox,
  MessageSquareShare,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Inbox,
    title: "Boîte de réception",
    text: "Toutes les demandes au même endroit, avec les images de référence. Fini les DM perdus.",
  },
  {
    icon: CreditCard,
    title: "Acompte obligatoire",
    text: "Pas d'acompte, pas de RDV. Stripe encaisse avant la confirmation — zéro no-show.",
  },
  {
    icon: Images,
    title: "Galerie de flash",
    text: "Vos flashs réservables en un clic, avec prix, taille et emplacement.",
  },
  {
    icon: CalendarClock,
    title: "Calendrier & dispos",
    text: "Vos créneaux, vos blocages, votre rythme. Le client ne voit que ce qui est libre.",
  },
  {
    icon: Sparkles,
    title: "Mini-site élégant",
    text: "Votre page perso (inkflow.app/votre-nom), à votre image, prête en 2 minutes.",
  },
  {
    icon: MessageSquareShare,
    title: "Rappels automatiques",
    text: "SMS et email à J-7, J-2 et le jour J. Envoyés tout seuls, à votre place.",
  },
];

export function Features() {
  return (
    <section id="fonctionnalites" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="max-w-2xl">
          <span className="text-xs uppercase tracking-[0.3em] text-ink">La solution</span>
          <h2 className="mt-4 text-balance font-serif text-4xl font-semibold sm:text-5xl">
            Un seul lien. Tout votre flux de réservation.
          </h2>
          <p className="mt-4 text-lg text-bone-dim">
            De la première demande au rappel de la veille, InkFlow automatise ce
            qui vous prend des heures.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-line bg-surface/40 p-6 transition-colors hover:border-ink/40 hover:bg-surface"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink/10 text-ink transition-colors group-hover:bg-ink group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl text-bone">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-bone-dim">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
