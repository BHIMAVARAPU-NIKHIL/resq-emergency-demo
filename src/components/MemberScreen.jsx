import React, { useEffect } from 'react';
import SatelliteMap from './SatelliteMap';
import {
  MEMBER_DATA,
  RESPONDER_DATA,
  COORDINATES
} from '../config/constants';
import { audioManager } from '../utils/audio';
import GradientPlaceholder from './GradientPlaceholder';
import IncidentTimeline from './IncidentTimeline';
import {
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  RefreshCw
} from 'lucide-react';

export default function MemberScreen({
  incidentState,
  onTriggerFall,
  onToggleMonitoring,
  onCancelFall,
  onResetDemo
}) {
  const isBufferLoud = incidentState.status === 'buffer_loud';
  const isBufferWait = incidentState.status === 'buffer_wait';
  const isAlarmActive = isBufferLoud || isBufferWait;
  const isPhoneCallActive = ['guardian_call', 'live_call'].includes(incidentState.status);
  const isResponderComing = ['responder_enroute', 'responder_arrived', 'ambulance_dispatched', 'handover_pending', 'resolved'].includes(incidentState.status);
  const isTerminal = ['cancelled', 'resolved'].includes(incidentState.status);
  const canManageMonitoring = ['idle', 'cancelled', 'resolved'].includes(incidentState.status);
  const canTriggerFall = incidentState.monitoringEnabled && incidentState.status === 'idle' && !isAlarmActive;
  const incidentStatus = {
    idle: 'Standing by — no active demo incident',
    buffer_loud: 'Fall alert — loud alarm buffer',
    buffer_wait: 'Fall alert — member response window',
    guardian_call: 'Guardian notification simulation',
    live_call: 'Live call simulation',
    responder_alerted: 'Responder dispatch available',
    responder_enroute: 'Responder en route',
    responder_arrived: 'Responder on scene',
    ambulance_dispatched: 'Ambulance simulation en route',
    handover_pending: 'Handover verification pending',
    resolved: 'Demo incident complete',
    cancelled: 'Demo alert cancelled'
  }[incidentState.status] || 'Demo incident status unavailable';

  // Sound manager for the emergency siren during the first 15 seconds
  useEffect(() => {
    if (isBufferLoud) {
      audioManager.startEmergencySiren();
    } else {
      audioManager.stopEmergencySiren();
    }
    return () => audioManager.stopEmergencySiren();
  }, [isBufferLoud]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">
      <GradientPlaceholder label="Member care overview" filename="member-home.webp" variant="member" className="h-24 sm:h-28" />
      {/* Demo alarm overlay (simulated escalation buffer) */}
      {isAlarmActive && (
        <div className="fixed inset-0 z-50 bg-emergency-700 text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fadeIn">
          {/* Top Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-emergency-800/80 px-3 py-1.5 rounded-full border border-emergency-500">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider">
                {isBufferLoud ? 'Loud Emergency Siren (15s)' : 'Pulsing Buffer Wait (15s)'}
              </span>
            </div>
            <span className="text-xs font-mono text-emergency-200">
              Simulated residence sensor
            </span>
          </div>

          {/* Center High-Urgency Content */}
          <div className="text-center space-y-4 max-w-lg mx-auto">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white/10 border-4 border-white flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-12 h-12 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Fall Detected!
            </h1>

            <p className="text-sm sm:text-base text-emergency-100 leading-relaxed">
              {isBufferLoud
                ? 'High-volume siren sounding on your device. If you are safe, tap the button below immediately.'
                : `Second buffer active. ${MEMBER_DATA.contacts.guardian.name} and responder escalation will be simulated if not cancelled.`}
            </p>

            {/* Big Countdown Number */}
            <div className="py-2">
              <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter">
                {incidentState.stepRemainingSeconds}s
              </div>
              <span className="text-xs uppercase tracking-wider text-emergency-200 font-semibold block mt-1">
                Remaining before escalation to Guardian
              </span>
            </div>
          </div>

          {/* Big "I'm OK" Button */}
          <div className="max-w-md w-full mx-auto space-y-3">
            <button
              onClick={onCancelFall}
              className="w-full bg-white hover:bg-stone-100 text-emergency-800 font-extrabold text-xl sm:text-2xl py-4 sm:py-5 rounded-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3 border-2 border-stone-200"
            >
              <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
              <span>I'm OK (Cancel Alarm)</span>
            </button>
            <p className="text-center text-xs text-emergency-200 font-medium">
              Tapping this instantly stops the alarm and logs you as safe.
            </p>
          </div>
        </div>
      )}

      {/* Incoming emergency call animation */}
      {isPhoneCallActive && (
        <div className="bg-rose-700 text-white p-4 rounded-lg shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full bg-white text-rose-700 flex items-center justify-center font-bold">
              <span className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-60"></span>
              <PhoneCall className="relative w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-200 block">
                {incidentState.status === 'guardian_call' ? 'Incoming emergency call' : 'Emergency live-call stage'}
              </span>
              <h3 className="text-sm font-bold">
                {incidentState.status === 'guardian_call' ? `Calling ${MEMBER_DATA.contacts.guardian.name} (simulated)` : 'ResQ demo emergency support is calling'}
              </h3>
              <p className="text-xs text-rose-100">
                {incidentState.status === 'guardian_call'
                  ? 'Your guardian is being contacted about the fall alert.'
                  : 'The emergency call stage is active. If you are safe, cancel the alarm below.'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancelFall}
            className="px-3 py-1.5 bg-white text-rose-800 rounded text-xs font-bold hover:bg-stone-100 flex-shrink-0"
          >
            I'm OK
          </button>
        </div>
      )}

      {/* Normal Member Screen Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-emergency-50 border border-emergency-200 flex items-center justify-center text-emergency-700 flex-shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900">{MEMBER_DATA.name}</h2>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.2 rounded border border-stone-200">
                Age {MEMBER_DATA.age} &bull; Demo account
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {MEMBER_DATA.address}
            </p>
          </div>
        </div>

        {/* Member Action: Simulate Fall */}
        <div className="flex items-center space-x-2">
          {canTriggerFall && (
            <button
              onClick={onTriggerFall}
              className="px-4 py-2 bg-emergency-600 hover:bg-emergency-700 text-white rounded text-xs font-bold shadow-xs flex items-center space-x-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-200" />
              <span>Simulate Fall</span>
            </button>
          )}

          {(isResponderComing || isTerminal) && (
            <button
              onClick={onResetDemo}
              className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded text-xs font-semibold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo status banner */}
      <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-stone-800">
            {isTerminal
              ? incidentState.status === 'resolved' ? 'Demo incident complete' : 'Demo alert cancelled'
              : incidentState.status === 'idle'
                ? incidentState.monitoringEnabled ? 'Demo monitoring active' : 'Demo monitoring paused'
                : 'Demo incident active &bull; No evidence is recorded'}
          </span>
        </div>
        <span className="text-[11px] text-stone-500 font-mono">
          {isResponderComing ? 'Simulated route' : 'Standby'}
        </span>
      </div>

      <section className="rounded-xl border border-tealbrand-200 bg-tealbrand-50 p-4" aria-live="polite" aria-label="Shared incident status">
        <span className="text-[10px] font-bold uppercase tracking-wider text-tealbrand-800">Shared incident status</span>
        <p className="mt-1 text-sm font-bold text-tealbrand-950">{incidentStatus}</p>
        {incidentState.stepRemainingSeconds > 0 && (
          <p className="mt-1 text-xs text-tealbrand-800">Next simulated step in {incidentState.stepRemainingSeconds} seconds.</p>
        )}
      </section>

      <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" aria-label="Simulated monitoring controls">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Member monitoring</h3>
          <p className="text-xs text-stone-500 mt-1">
            {incidentState.monitoringEnabled
              ? 'Illustrative demo sensors are on. No real sensors or medical readings are connected.'
              : 'Monitoring is paused. Start the simulation before using the fall-alert control.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleMonitoring}
          disabled={!canManageMonitoring}
          aria-pressed={incidentState.monitoringEnabled}
          className="px-4 py-2 rounded text-xs font-bold bg-tealbrand-700 text-white hover:bg-tealbrand-800 disabled:bg-stone-300 disabled:text-stone-600 disabled:cursor-not-allowed"
        >
          {incidentState.monitoringEnabled ? 'Pause demo monitoring' : 'Start demo monitoring'}
        </button>
      </section>

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3" aria-label="Member sensor and CSI sample data">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Sample sensor readings</h3>
            <p className="text-[11px] text-stone-500 mt-1">Illustrative values only; not measured and not medical advice.</p>
          </div>
          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
            Demo only
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            ['Blood pressure', MEMBER_DATA.vitals.bloodPressure],
            ['Heart rate', MEMBER_DATA.vitals.heartRate],
            ['Oxygen saturation', MEMBER_DATA.vitals.oxygenSat]
          ].map(([label, value]) => (
            <div key={label} className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">{label}</span>
              <span className="text-sm font-bold text-stone-900">{value}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3 bg-gradient-to-r from-tealbrand-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold">Wi-Fi CSI illustration</span>
            <span className="text-[10px] text-tealbrand-200">No signal is measured</span>
          </div>
          <div className="h-12 mt-2 rounded bg-slate-950/70 overflow-hidden relative" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 border-t border-teal-300/80 -translate-y-1/2" />
            <div className="absolute inset-0 opacity-70 bg-[linear-gradient(110deg,transparent_0%,rgba(45,212,191,0.35)_25%,transparent_45%,rgba(129,140,248,0.45)_62%,transparent_80%)] animate-pulse" />
          </div>
        </div>
      </section>

      {/* Satellite Map with Live Responders */}
      <section aria-label="Responder Satellite Map">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Demo map &bull; Simulated responder route
          </h3>
          <span className="text-xs text-stone-500">
            {isResponderComing ? 'Simulated route active' : 'Standby'}
          </span>
        </div>
        <SatelliteMap
          memberCoords={COORDINATES.member}
          responderCoords={incidentState.responderCoords}
          ambulanceCoords={incidentState.ambulanceCoords}
          showResponder={isResponderComing}
          showAmbulance={incidentState.ambulanceDispatched}
          statusMessage={
            isResponderComing
              ? `${RESPONDER_DATA.name} is on the way &bull; Reaching in ~${Math.ceil(incidentState.responderEtaSeconds / 60)} mins`
              : 'Your residence is monitored by the simulated demo hub'
          }
          responderDistance={incidentState.responderDistanceMeters}
          responderEta={incidentState.responderEtaSeconds}
          ambulanceDistance={incidentState.ambulanceDistanceMeters}
          ambulanceEta={incidentState.ambulanceEtaSeconds}
        />
      </section>

      <IncidentTimeline timeline={incidentState.timeline} title="Member incident timeline" />

      {/* Sample medicine storage reminder */}
      <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
          Sample medicine storage
        </span>
        <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded border border-stone-200">
          <strong>Sample data only: </strong>
          {MEMBER_DATA.tabletLocation}
        </p>
      </section>
    </div>
  );
}
