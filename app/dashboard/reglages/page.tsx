import { SettingsForm } from "@/components/dashboard/settings-form";

export default function ReglagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Réglages</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre profil, votre mini-site, vos acomptes et vos disponibilités.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
