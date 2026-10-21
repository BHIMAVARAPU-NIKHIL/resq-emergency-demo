import React from 'react';
import { FileText } from 'lucide-react';

const EVENT_STYLES = {
  alert: 'bg-emergency-50 text-emergency-700 border-emergency-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  info: 'bg-stone-100 text-stone-600 border-stone-200'
};

export default function IncidentTimeline({ timeline = [], title = 'Shared demo timeline' }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:p-5" aria-label={title}>
      <div className="mb-3 flex items-center justify-between border-b border-stone-100 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-tealbrand-700" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">{title}</h3>
        </div>
        <span className="text-[11px] text-stone-500">Shared across demo roles</span>
      </div>
      {timeline.length === 0 ? (
        <p className="py-3 text-xs text-stone-500">No events have been recorded in this demo yet.</p>
      ) : (
        <ol className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {timeline.slice(0, 12).map((item) => (
            <li key={item.id} className="flex items-start gap-2.5 border-b border-stone-100 py-2 last:border-none">
              <time className="mt-0.5 shrink-0 font-mono text-[11px] text-stone-400">{item.timestamp}</time>
              <span className="min-w-0 flex-1 text-xs font-medium text-stone-800">{item.message}</span>
              <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${EVENT_STYLES[item.status] || EVENT_STYLES.info}`}>
                {item.status || 'info'}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
