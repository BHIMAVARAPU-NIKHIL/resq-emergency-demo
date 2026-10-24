import { useState } from 'react';
import { CalendarDays, FileText } from 'lucide-react';

const HOSPITALS = [
  'City Care Hospital (sample)',
  'Community Health Centre (sample)'
];
const MIN_BOOKING_DATE = new Date().toLocaleDateString('en-CA');

function formatAppointment(date, time) {
  if (!date || !time) return '';
  const dateLabel = new Date(`${date}T${time}`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeLabel = new Date(`${date}T${time}`).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit'
  });
  return `${dateLabel} at ${timeLabel}`;
}

export default function HealthCheckupCard({ checkups, onBook, canBook = true, bookingForMember = false }) {
  const [isBooking, setIsBooking] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [error, setError] = useState('');
  const isAtLimit = checkups.usedCount >= 3;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!date || !time || !hospital) {
      setError('Choose a date, time, and partner hospital.');
      return;
    }

    if (!onBook({ date, time, hospital })) {
      setError('All 3 check-ups have already been used this year.');
      return;
    }
    setDate('');
    setTime('');
    setError('');
    setIsBooking(false);
  };

  return (
    <section className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5" aria-labelledby="health-checkups-title">
      <div className="flex flex-col gap-3 border-b border-stone-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-tealbrand-700" aria-hidden="true" />
            <h3 id="health-checkups-title" className="text-sm font-bold text-stone-900">Health check-ups</h3>
          </div>
          <p className="mt-1 text-xs font-semibold text-tealbrand-800">{checkups.usedCount} of 3 used this year</p>
        </div>
        {canBook && (
          <button
            type="button"
            onClick={() => setIsBooking((open) => !open)}
            disabled={isAtLimit}
            className="rounded bg-tealbrand-700 px-3 py-2 text-xs font-bold text-white hover:bg-tealbrand-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {isAtLimit ? 'Yearly check-ups used' : isBooking ? 'Close booking' : 'Book a check-up'}
          </button>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
        <div className="rounded border border-stone-100 bg-stone-50 p-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Next check-up date</dt>
          <dd className="mt-1 font-semibold text-stone-800">
            {checkups.nextDate ? formatAppointment(checkups.nextDate, checkups.nextTime) : 'Not scheduled'}
          </dd>
        </div>
        <div className="rounded border border-stone-100 bg-stone-50 p-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Partner hospital</dt>
          <dd className="mt-1 font-semibold text-stone-800">{checkups.hospital || HOSPITALS[0]}</dd>
        </div>
        <div className="rounded border border-stone-100 bg-stone-50 p-3">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Care included</dt>
          <dd className="mt-1 font-semibold text-stone-800">Doctor consult included</dd>
        </div>
      </dl>

      {bookingForMember && (
        <p className="rounded border border-tealbrand-100 bg-tealbrand-50 p-2.5 text-xs text-tealbrand-900">
          You can book this check-up remotely on {checkups.memberName || 'the Member'}’s behalf.
        </p>
      )}

      {checkups.reminder && (
        <p role="status" className="rounded border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
          Reminder set: {checkups.reminder}
        </p>
      )}

      {isBooking && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 rounded border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-stone-700">
            Date
            <input
              type="date"
              required
              min={MIN_BOOKING_DATE}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2.5 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Time
            <input
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2.5 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
            Partner hospital
            <select
              value={hospital}
              onChange={(event) => setHospital(event.target.value)}
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2.5 py-2 text-sm"
            >
              {HOSPITALS.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>
          {error && <p role="alert" className="text-xs text-emergency-700 sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
            <span className="text-[11px] text-stone-500">Mock booking only; no appointment is sent.</span>
            <button type="submit" className="rounded bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800">
              Confirm check-up
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-xs font-bold text-stone-800">
          <FileText className="h-4 w-4 text-stone-500" aria-hidden="true" />
          Reports
        </h4>
        {checkups.reports.length === 0 ? (
          <p className="rounded border border-dashed border-stone-300 p-3 text-xs text-stone-500">No reports yet.</p>
        ) : (
          <ul className="space-y-1">
            {checkups.reports.map((report) => <li key={report.id} className="text-xs text-stone-700">{report.title}</li>)}
          </ul>
        )}
      </div>
      <p className="text-[11px] text-stone-500">Check-up reports are shared only with your consent.</p>
    </section>
  );
}
