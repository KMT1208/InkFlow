import { WeekCalendar } from "@/components/dashboard/week-calendar";

export default function CalendrierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Calendrier</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Vos rendez-vous et vos disponibilités, semaine par semaine.
        </p>
      </div>
      <WeekCalendar />
    </div>
  );
}
