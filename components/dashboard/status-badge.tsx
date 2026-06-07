import type { DemoBookingStatus } from "@/lib/demo";

const MAP: Record<DemoBookingStatus, { label: string; cls: string }> = {
  nouvelle: { label: "Nouvelle", cls: "bg-sky-500/15 text-sky-400" },
  devis_envoye: { label: "Devis envoyé", cls: "bg-amber-500/15 text-amber-400" },
  acompte_attendu: { label: "Acompte attendu", cls: "bg-amber-500/15 text-amber-400" },
  acompte_paye: { label: "Acompte payé", cls: "bg-emerald-500/15 text-emerald-400" },
  confirmee: { label: "Confirmé", cls: "bg-ink/15 text-ink" },
  terminee: { label: "Terminé", cls: "bg-bone/10 text-bone-dim" },
  annulee: { label: "Annulé", cls: "bg-surface-2 text-bone-dim" },
  refusee: { label: "Refusé", cls: "bg-surface-2 text-bone-dim" },
};

export function StatusBadge({ status }: { status: DemoBookingStatus }) {
  const s = MAP[status] ?? { label: status, cls: "bg-surface-2 text-bone-dim" };
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
