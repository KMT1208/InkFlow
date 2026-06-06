import type { DemoBookingStatus } from "@/lib/demo";

const MAP: Record<DemoBookingStatus, { label: string; cls: string }> = {
  nouvelle: { label: "Nouvelle", cls: "bg-sky-500/15 text-sky-400" },
  devis_envoye: { label: "Devis envoyé", cls: "bg-amber-500/15 text-amber-400" },
  acompte_paye: { label: "Acompte payé", cls: "bg-emerald-500/15 text-emerald-400" },
  confirmee: { label: "Confirmé", cls: "bg-ink/15 text-ink" },
};

export function StatusBadge({ status }: { status: DemoBookingStatus }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
