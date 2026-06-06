import { DEMO_FLASH } from "@/lib/demo";
import { FlashManager } from "@/components/dashboard/flash-manager";

export default function FlashPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Flashs</h1>
          <p className="mt-1 text-sm text-bone-dim">
            Votre galerie, réservable en un clic par vos clients.
          </p>
        </div>
        <span className="text-sm text-bone-dim">{DEMO_FLASH.length} flashs</span>
      </div>

      <FlashManager flash={DEMO_FLASH} />
    </div>
  );
}
