import PartnerOverview from './PartnerOverview';
import RevenueSplit from './RevenueSplit';

const BENEFICIARIES = [
  ['Member', 'Receives emergency monitoring and included health check-ups.'],
  ['Hospital', 'Receives scheduled check-up visits and doctor consultations.'],
  ['Delivery partner', 'Can support the nearby response network.'],
  ['Riders', 'Receive response and standby fees.'],
  ['ResQ', 'Coordinates the service and guardian dashboard.']
];

export default function BusinessModelPage() {
  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 font-sans sm:py-10">
      <div className="mx-auto max-w-3xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-tealbrand-700">ResQ · Public information</p>
            <h1 className="mt-1 text-xl font-bold text-stone-900 sm:text-2xl">Business model</h1>
          </div>
          <a href="/" className="rounded border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50">
            Back to ResQ
          </a>
        </header>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <p className="text-xs font-semibold text-stone-500">One annual plan</p>
          <h2 className="mt-1 text-lg font-bold text-stone-900">ResQ Safe + Health</h2>
          <p className="mt-1 text-sm text-stone-700">₹4500 per year</p>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">
            Includes fall and emergency detection, nearest-rider dispatch, helpline check-in call, live caretaker dashboard, and 3 health check-ups per year, each with a doctor consult.
          </p>
        </section>

        <section className="rounded-lg border border-stone-200 bg-tealbrand-900 p-4 text-white shadow-xs sm:p-5">
          <RevenueSplit />
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
          <h2 className="text-sm font-bold text-stone-900">Who benefits</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {BENEFICIARIES.map(([name, description]) => (
              <li key={name} className="rounded border border-stone-100 bg-stone-50 p-3">
                <strong className="block text-xs text-stone-800">{name}</strong>
                <span className="mt-1 block text-xs text-stone-600">{description}</span>
              </li>
            ))}
          </ul>
        </section>

        <PartnerOverview />
        <p className="text-center text-xs text-stone-500">All figures and partner information are illustrative. Payment and partner services are not enabled.</p>
      </div>
    </main>
  );
}
