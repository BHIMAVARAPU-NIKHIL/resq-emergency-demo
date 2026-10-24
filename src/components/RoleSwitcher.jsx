import React, { useState } from 'react';
import { ShieldCheck, Bike, HeartHandshake, Zap, RotateCcw, Info, X } from 'lucide-react';
import PartnerOverview from './PartnerOverview';

export default function RoleSwitcher({
  currentRole,
  onRoleChange,
  incidentStatus,
  speedMultiplier,
  onToggleSpeed,
  onResetScenario
}) {
  const [showAboutModal, setShowAboutModal] = useState(false);

  const getStatusBadge = () => {
    switch (incidentStatus) {
      case 'idle':
        return { text: 'Monitoring & Standby', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'buffer_loud':
      case 'buffer_wait':
        return { text: 'Fall Alarm (30s Buffer)', color: 'bg-emergency-50 text-emergency-700 border-emergency-200 animate-pulse' };
      case 'guardian_call':
        return { text: 'Calling Guardian (15s)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'live_call':
        return { text: 'Live Talk Auto-Channel (15s)', color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'responder_alerted':
      case 'responder_enroute':
        return { text: 'Responder En Route (Bike)', color: 'bg-tealbrand-50 text-tealbrand-800 border-tealbrand-200' };
      case 'responder_arrived':
        return { text: 'Responder on Scene', color: 'bg-tealbrand-100 text-tealbrand-900 border-tealbrand-300' };
      case 'ambulance_dispatched':
        return { text: 'Emergency transport en route', color: 'bg-emergency-100 text-emergency-800 border-emergency-300' };
      case 'handover_pending':
        return { text: 'Ambulance Handover OTP', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'resolved':
        return { text: 'Incident Resolved', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'cancelled':
        return { text: 'Alarm Cancelled (I am OK)', color: 'bg-stone-100 text-stone-700 border-stone-200' };
      default:
        return { text: 'Standby', color: 'bg-stone-50 text-stone-700 border-stone-200' };
    }
  };

  const badge = getStatusBadge();

  return (
    <>
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Brand & Incident Badge */}
          <div className="flex items-center justify-between lg:justify-start gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center space-x-2">
              <img src="/resq-logo.svg" alt="ResQ logo" className="w-8 h-8 object-contain" />
              <div>
                <span className="text-sm font-bold text-stone-900 tracking-tight leading-none block">
                  ResQ
                </span>
                <span className="text-[10px] text-stone-500">Simulation only • no real emergency response</span>
              </div>
            </div>

            <div className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-semibold border flex items-center gap-1.5 max-w-[58%] lg:max-w-none ${badge.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span className="truncate">{badge.text}</span>
            </div>
          </div>

          {/* Role Navigation Tabs */}
          <nav aria-label="Role Navigation" className="hidden lg:flex lg:w-auto items-center gap-1 bg-stone-100 p-1 rounded border border-stone-200">
            <button
              type="button"
              aria-pressed={currentRole === 'guardian'}
              onClick={() => onRoleChange('guardian')}
              className={`flex-1 lg:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-3 py-2 lg:py-1 rounded text-[11px] sm:text-xs font-medium transition-colors ${
                currentRole === 'guardian'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-700" />
              <span>Guardian</span>
            </button>

            <button
              type="button"
              aria-pressed={currentRole === 'responder'}
              onClick={() => onRoleChange('responder')}
              className={`flex-1 lg:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-3 py-2 lg:py-1 rounded text-[11px] sm:text-xs font-medium transition-colors ${
                currentRole === 'responder'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-amber-700" />
              <span>Responder</span>
            </button>

            <button
              type="button"
              aria-pressed={currentRole === 'member'}
              onClick={() => onRoleChange('member')}
              className={`flex-1 lg:flex-none justify-center flex items-center gap-1.5 px-2 sm:px-3 py-2 lg:py-1 rounded text-[11px] sm:text-xs font-medium transition-colors ${
                currentRole === 'member'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-emergency-700" />
              <span>Member</span>
            </button>
          </nav>

          {/* Quick Controls: 3x Speed, Reset, Info */}
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={onToggleSpeed}
              title="Fast simulation: runs 15s timers at 3x speed (5s)"
              className={`px-2 py-1 rounded text-xs font-medium border flex items-center space-x-1 transition-colors ${
                speedMultiplier > 1
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Zap className={`w-3 h-3 ${speedMultiplier > 1 ? 'text-amber-700' : 'text-stone-400'}`} />
              <span>{speedMultiplier > 1 ? '3x Fast' : '1x Speed'}</span>
            </button>

            <button
              onClick={onResetScenario}
              title="Reset entire incident scenario"
              className="px-2 py-1 rounded text-xs font-medium bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 text-stone-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={() => setShowAboutModal(true)}
              title="Simulation details & APIs"
              className="p-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-100"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* About / simulation modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-h-[90vh] max-w-md w-full overflow-y-auto bg-white rounded-lg border border-stone-300 p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-tealbrand-700" />
                <h3 className="text-sm font-bold text-stone-900">ResQ &bull; Simulation details</h3>
              </div>
              <button
                onClick={() => setShowAboutModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-2.5">
              <p className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900">
                <strong>Simulation only:</strong> ResQ does not contact emergency services, dispatch real responders, place calls, or provide medical advice. Do not use it for a real emergency.
              </p>
              <p>
                <strong>Multi-Tab Sync:</strong> The app uses the native <code className="bg-stone-100 px-1 py-0.5 rounded">BroadcastChannel</code> API with <code className="bg-stone-100 px-1 py-0.5 rounded">localStorage</code> fallback. You can open separate browser tabs for Guardian, Responder, and Member to watch them interact live.
              </p>
              <p>
                <strong>Real Browser APIs Used:</strong> Leaflet Esri satellite imagery tiles, Web Audio API synthesizer (for sirens and dial tones), Vibration API, Geolocation, and MediaRecorder/getUserMedia camera feeds with simulated fallback.
              </p>
              <p>
                <strong>Illustrative only:</strong> Background OS phone call interception, Wi-Fi CSI radio reflection wave model, and automated digital door lock unlocking.
              </p>
              <p>
                <strong>Escalation Timing:</strong> Normal is 15s per stage. Toggle <strong>3x Fast</strong> to accelerate stages to 5 seconds each.
              </p>
            </div>

            <PartnerOverview />

            <a href="/business-model" className="block rounded border border-stone-200 bg-stone-50 p-3 text-xs font-semibold text-tealbrand-800 hover:bg-stone-100">
              View ResQ Safe + Health plan and revenue split
            </a>

            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
