import { getCalendarAppointments } from "@/lib/dashboard-data";
import { WeekCalendar } from "@/components/dashboard/week-calendar";

export default async function CalendrierPage() {
  const { appointments } = await getCalendarAppointments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Calendrier</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Vos rendez-vous, semaine par semaine.
        </p>
      </div>
      <WeekCalendar appointments={appointments} />
    </div>
  );
}
