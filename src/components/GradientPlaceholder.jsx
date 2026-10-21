import React from 'react';

const gradients = {
  hero: 'from-tealbrand-900 via-slate-900 to-indigo-950',
  member: 'from-rose-100 via-orange-100 to-amber-200',
  guardian: 'from-teal-100 via-cyan-100 to-blue-200',
  responder: 'from-amber-100 via-orange-100 to-rose-200'
};

export default function GradientPlaceholder({ label, filename, variant = 'hero', className = '' }) {
  return (
    <div
      role="img"
      aria-label={`${label} placeholder, planned asset ${filename}`}
      data-placeholder-filename={filename}
      className={`relative isolate overflow-hidden rounded-xl bg-gradient-to-br ${gradients[variant] || gradients.hero} ${className}`}
    >
      <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -bottom-14 left-1/4 h-36 w-36 rounded-full bg-teal-300/20 blur-2xl" />
      <div className={`absolute inset-0 flex flex-col justify-between p-4 ${variant === 'hero' ? 'text-white' : 'text-slate-900'}`}>
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
        <span className="self-end rounded bg-black/10 px-2 py-1 font-mono text-[10px] backdrop-blur-sm">
          {filename}
        </span>
      </div>
    </div>
  );
}
