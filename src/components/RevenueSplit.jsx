import { REVENUE_SPLIT } from '../config/businessModel';

export default function RevenueSplit() {
  return (
    <section aria-labelledby="revenue-split-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="revenue-split-title" className="text-sm font-bold">How your ₹4500 is used</h3>
        <span className="text-[11px] text-tealbrand-100">Estimated figures for demo</span>
      </div>
      <div className="flex h-3 overflow-hidden rounded border border-white/20" aria-label="Revenue split: 60 percent ResQ, 25 percent hospital, 10 percent delivery partner, 5 percent riders">
        {REVENUE_SPLIT.map(({ name, percentage, color }) => (
          <span key={name} className={color} style={{ width: `${percentage}%` }} />
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
        {REVENUE_SPLIT.map(({ name, percentage, amount }) => (
          <li key={name} className="flex items-center justify-between gap-2 border-b border-white/15 py-1.5">
            <span>{name} <span className="text-tealbrand-100">({percentage}%)</span></span>
            <strong>₹{amount}</strong>
          </li>
        ))}
      </ul>
      <p className="flex justify-between border-t border-white/25 pt-2 text-xs font-bold">
        <span>Total (100%)</span>
        <span>₹4500</span>
      </p>
    </section>
  );
}
