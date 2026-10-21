import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Monitor', statuses: ['idle'] },
  { label: 'Alert', statuses: ['buffer_loud', 'buffer_wait', 'guardian_call', 'live_call'] },
  { label: 'Response', statuses: ['responder_alerted', 'responder_enroute', 'responder_arrived'] },
  { label: 'Handover', statuses: ['ambulance_dispatched', 'handover_pending'] },
  { label: 'Complete', statuses: ['resolved'] }
];

export default function IncidentStepper({ status }) {
  const currentIndex = STEPS.findIndex((step) => step.statuses.includes(status));
  const isCancelled = status === 'cancelled';
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;
  const currentLabel = isCancelled ? 'Cancelled' : STEPS[activeIndex].label;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-4 py-3"
      aria-label={`Incident progress: ${currentLabel}`}
    >
      <div className="rounded-xl border border-stone-200 bg-white px-3 py-3 shadow-xs sm:px-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Response workflow simulation</span>
          <span className={`text-xs font-semibold ${isCancelled ? 'text-stone-600' : 'text-tealbrand-800'}`}>
            {currentLabel}{isCancelled ? ' — stopped' : ''}
          </span>
        </div>
        <ol className="grid grid-cols-5 gap-1" role="progressbar" aria-label="Incident progress" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={activeIndex + 1}>
          {STEPS.map((step, index) => {
            const isComplete = !isCancelled && currentIndex > index;
            const isCurrent = !isCancelled && currentIndex === index;
            return (
              <li key={step.label} aria-current={isCurrent ? 'step' : undefined} className="min-w-0">
                <div className={`mb-1 h-1.5 rounded-full ${isComplete || isCurrent ? 'bg-tealbrand-700' : 'bg-stone-200'}`} />
                <span className={`flex items-center gap-1 truncate text-[9px] font-semibold sm:text-[11px] ${isCurrent ? 'text-tealbrand-900' : isComplete ? 'text-stone-700' : 'text-stone-400'}`}>
                  {isComplete && <Check className="h-3 w-3 shrink-0" aria-hidden="true" />}
                  <span className="truncate">{step.label}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
