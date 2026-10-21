import React from 'react';
import { Bike, HeartHandshake, ShieldCheck } from 'lucide-react';

const ROLES = [
  { id: 'guardian', label: 'Guardian', Icon: ShieldCheck },
  { id: 'responder', label: 'Responder', Icon: Bike },
  { id: 'member', label: 'Member', Icon: HeartHandshake }
];

export default function MobileRoleNav({ currentRole, onRoleChange }) {
  return (
    <nav
      aria-label="Role navigation"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-stone-200 bg-white/95 px-2 pb-2 pt-1 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      {ROLES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={currentRole === id ? 'page' : undefined}
          onClick={() => onRoleChange(id)}
          className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold ${
            currentRole === id ? 'text-tealbrand-800' : 'text-stone-500'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
