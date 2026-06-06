"use client";

import {
  openBillingPortal,
  startSubscriptionCheckout,
} from "@/lib/actions/subscription";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

export function SubscribePanel() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <form action={startSubscriptionCheckout.bind(null, "solo")}>
          <Button type="submit" variant="outline">
            S&apos;abonner — Solo ({PLANS.solo.priceLabel})
          </Button>
        </form>
        <form action={startSubscriptionCheckout.bind(null, "studio")}>
          <Button type="submit">
            S&apos;abonner — Studio ({PLANS.studio.priceLabel})
          </Button>
        </form>
      </div>
      <form action={openBillingPortal}>
        <button
          type="submit"
          className="text-sm text-bone-dim transition-colors hover:text-bone"
        >
          Gérer mon abonnement →
        </button>
      </form>
    </div>
  );
}
