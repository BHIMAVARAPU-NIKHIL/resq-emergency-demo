const PARTNERS = [
  ['Hospitals', 'Check-ups, doctors, and emergency wards'],
  ['Delivery partners', 'Delivery partner app support'],
  ['Ambulance (108)', 'Emergency transport coordination'],
  ['Helpline operators', 'Check-in call support'],
  ['Apartment security guards', 'Local access support']
];

export default function PartnerOverview() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5" aria-labelledby="partner-network-title">
      <h2 id="partner-network-title" className="text-sm font-bold text-stone-900">Partner network</h2>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {PARTNERS.map(([name, description], index) => (
          <li key={name} className="flex gap-3 rounded border border-stone-100 bg-stone-50 p-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tealbrand-50 text-xs font-bold text-tealbrand-800">
              {index + 1}
            </span>
            <span>
              <strong className="block text-xs text-stone-800">{name}</strong>
              <span className="mt-0.5 block text-xs text-stone-500">{description}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-3 border-t border-stone-100 pt-3 text-xs text-stone-600">
        In emergencies the ambulance takes the patient to the nearest suitable hospital. Partner hospitals are only for scheduled check-ups.
      </p>
    </section>
  );
}
