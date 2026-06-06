"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { BookingCardMock } from "@/components/marketing/booking-card-mock";

// Le canvas 3D n'est chargé que côté client (ssr: false) et seulement quand on
// décide de l'afficher — son code (three.js) n'est donc jamais envoyé en mobile.
const Hero3D = dynamic(() => import("@/components/marketing/hero-3d"), {
  ssr: false,
  loading: () => <BlobGlow />,
});

function BlobGlow() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-40 w-40 animate-floaty rounded-full bg-ink/30 blur-3xl" />
    </div>
  );
}

const QUERY_WIDE = "(min-width: 768px)";
const QUERY_REDUCE = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const wide = window.matchMedia(QUERY_WIDE);
  const reduce = window.matchMedia(QUERY_REDUCE);
  wide.addEventListener("change", callback);
  reduce.addEventListener("change", callback);
  return () => {
    wide.removeEventListener("change", callback);
    reduce.removeEventListener("change", callback);
  };
}

// 3D uniquement sur grand écran et si l'utilisateur ne demande pas « moins
// d'animations ». Sinon — et côté serveur — on affiche la carte produit.
function getSnapshot() {
  return (
    window.matchMedia(QUERY_WIDE).matches &&
    !window.matchMedia(QUERY_REDUCE).matches
  );
}

export function HeroVisual() {
  const use3D = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!use3D) {
    return (
      <div className="flex justify-center lg:justify-end">
        <BookingCardMock />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-md lg:h-[520px]">
      <Hero3D />
    </div>
  );
}
