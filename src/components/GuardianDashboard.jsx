import React, { useState, useEffect, useRef } from 'react';
import SatelliteMap from './SatelliteMap';
import { useLiveMedia } from '../utils/liveMedia';
import {
  MEMBER_DATA,
  RESPONDER_DATA,
  AMBULANCE_DATA,
  COORDINATES
} from '../config/constants';
import {
  ShieldCheck,
  User,
  HeartPulse,
  Home,
  Wifi,
  PhoneCall,
  Mic,
  Box
} from 'lucide-react';

export default function GuardianDashboard({
  incidentState,
  onAnswerGuardianCall,
}) {
  const [csiWaveOffset, setCsiWaveOffset] = useState(0);
  const liveVideoRef = useRef(null);
  const { remoteStream, connectionStatus } = useLiveMedia('guardian', incidentState.responderAccepted);

  // Animate simulated Wi-Fi CSI wave
  useEffect(() => {
    const interval = setInterval(() => {
      setCsiWaveOffset((prev) => (prev + 1) % 100);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const isIncidentActive = !['idle', 'resolved', 'cancelled'].includes(incidentState.status);
  const isResponderEnroute = ['responder_enroute', 'responder_arrived', 'ambulance_dispatched', 'handover_pending'].includes(incidentState.status);
  const isGuardianCalling = incidentState.status === 'guardian_call';
  const incidentSummary = {
    idle: { title: 'Demo is standing by', detail: 'No real sensors or monitoring are connected.', tone: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
    cancelled: { title: 'Alert cancelled — member confirmed safe', detail: 'No active response is required.', tone: 'border-stone-200 bg-stone-50 text-stone-900' },
    resolved: { title: 'Rescue completed', detail: 'The member has been handed over to the ambulance team.', tone: 'border-blue-200 bg-blue-50 text-blue-900' }
  }[incidentState.status] || {
    title: 'Demo response simulation in progress',
    detail: 'Simulated responder and guardian updates appear here.',
    tone: 'border-emergency-200 bg-emergency-50 text-emergency-900'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">
      {/* Guardian Profile Header */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-tealbrand-50 border border-tealbrand-200 flex items-center justify-center text-tealbrand-700 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900">{MEMBER_DATA.contacts.guardian.name}</h2>
              <span className="text-[10px] font-semibold text-tealbrand-800 bg-tealbrand-50 px-2 py-0.2 rounded border border-tealbrand-200">
                Primary Guardian
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Demo profile: <strong className="text-stone-800">{MEMBER_DATA.name} ({MEMBER_DATA.age} yrs)</strong> &bull; Simulated area
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Demo sensor simulation</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{incidentState.monitoringEnabled ? 'Demo monitoring active (not connected)' : 'Demo monitoring paused'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Incoming Guardian Call Banner if active */}
      {isGuardianCalling && (
        <div className="bg-emergency-600 text-white rounded-lg p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white text-emergency-600 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emergency-100">
                Automated Fall Escalation &bull; Stage 2 Call
              </span>
              <h3 className="text-base font-bold">Fall alert for {MEMBER_DATA.name} at the simulated residence</h3>
              <p className="text-xs text-emergency-100 mt-0.5">
                Member device buffer was not answered. Please confirm if you are responding.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={onAnswerGuardianCall}
              className="px-4 py-2 bg-white text-emergency-700 rounded text-xs font-bold shadow-sm hover:bg-stone-50"
            >
              Answer &amp; Cancel Alarm
            </button>
          </div>
        </div>
      )}

      <section className={`rounded-xl border p-4 sm:p-5 shadow-xs ${incidentSummary.tone}`} aria-label="Current incident summary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Current status</span>
            <h3 className="text-base sm:text-lg font-bold mt-0.5">{incidentSummary.title}</h3>
            <p className="text-xs sm:text-sm mt-1 opacity-80">{incidentSummary.detail}</p>
          </div>
          {incidentState.responderAccepted && isResponderEnroute && (
            <div className="grid grid-cols-2 sm:flex gap-2">
              <div className="rounded-lg bg-white/80 border border-current/10 px-3 py-2 sm:min-w-28">
                <span className="block text-[10px] uppercase font-bold opacity-60">Responder ETA</span>
                <span className="block text-sm font-bold">{incidentState.responderArrived ? 'On scene' : `~${Math.ceil(incidentState.responderEtaSeconds / 60)} min`}</span>
              </div>
              {incidentState.ambulanceDispatched && (
                <div className="rounded-lg bg-white/80 border border-current/10 px-3 py-2 sm:min-w-28">
                  <span className="block text-[10px] uppercase font-bold opacity-60">Ambulance ETA</span>
                  <span className="block text-sm font-bold">{incidentState.ambulanceArrived ? 'On scene' : `~${Math.ceil(incidentState.ambulanceEtaSeconds / 60)} min`}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Satellite map with simulated routes and responding units */}
      <section aria-label="Live Satellite Map">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-700">
            Simulated location
          </h3>
          <span className="text-xs text-stone-500">Demo response hub</span>
        </div>
        <SatelliteMap
          memberCoords={COORDINATES.member}
          responderCoords={incidentState.responderCoords}
          ambulanceCoords={incidentState.ambulanceCoords}
          showResponder={isResponderEnroute}
          showAmbulance={incidentState.ambulanceDispatched}
          statusMessage={
            isResponderEnroute
              ? `${RESPONDER_DATA.name} approaching the simulated residence &bull; Demo route`
              : 'Simulated residence &bull; Responders on standby'
          }
          responderDistance={incidentState.responderDistanceMeters}
          responderEta={incidentState.responderEtaSeconds}
          ambulanceDistance={incidentState.ambulanceDistanceMeters}
          ambulanceEta={incidentState.ambulanceEtaSeconds}
        />
      </section>

      {incidentState.responderAccepted && (
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-3" aria-label="Accepted emergency contacts">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">Accepted response units</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between gap-3">
              <span>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Accepted responder</span>
                <span className="text-sm font-bold text-stone-900">{RESPONDER_DATA.name}</span>
                <span className="text-xs text-stone-600 block">Demo phone: {RESPONDER_DATA.phone} (not dialable)</span>
              </span>
            </div>
            {incidentState.ambulanceDispatched && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between gap-3">
                <span>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Dispatched ambulance</span>
                  <span className="text-sm font-bold text-stone-900">{AMBULANCE_DATA.service}</span>
                  <span className="text-xs text-stone-600 block">Demo phone: {AMBULANCE_DATA.phone} (not dialable)</span>
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {incidentState.status === 'handover_pending' && (
        <section className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-xs" aria-label="Ambulance handover code">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Share handover code with the responder</h3>
          <p className="text-xs text-amber-800 mt-1">The ambulance has arrived. Give this code to the responder to complete the handover.</p>
          <div className="font-mono text-2xl font-bold tracking-widest text-amber-950 mt-2">{incidentState.handoverOtp}</div>
        </section>
      )}

      <section className="bg-tealbrand-900 text-white rounded-lg p-4 sm:p-5 shadow-xs" aria-label="ResQ subscription plans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-tealbrand-200">ResQ Protection Plan</span>
            <h3 className="text-sm font-bold mt-1">Demo subscription plan preview</h3>
            <p className="text-xs text-tealbrand-100 mt-1">Subscription plans shown for demonstration; payment is not enabled.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-center">
              <span className="block text-base font-bold">₹210</span>
              <span className="block text-[10px] text-tealbrand-100">per month</span>
            </div>
            <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-center">
              <span className="block text-base font-bold">₹2,500</span>
              <span className="block text-[10px] text-tealbrand-100">per year</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guardian Live View (Section 5 from requirements) */}
      {isResponderEnroute && (
        <section className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emergency-600 animate-ping"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Guardian Live View: Responder Feed
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-stone-500">Calls are disabled in this demo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Camera View from Responder */}
            <div className="relative aspect-video bg-stone-900 rounded overflow-hidden flex flex-col justify-between p-3 border border-stone-700 text-white">
              <div className="flex items-center justify-between text-xs z-10">
                <span className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${connectionStatus === 'connected' ? 'bg-emergency-600/90' : 'bg-stone-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full bg-white ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></span>
                  <span>{connectionStatus === 'connected' ? `LIVE FEED • ${RESPONDER_DATA.name.toUpperCase()}` : 'RESPONDER FEED'}</span>
                </span>
                <span className="font-mono text-[10px] text-stone-300 bg-stone-800/80 px-2 py-0.5 rounded">
                  {connectionStatus === 'connected' ? 'Live video + audio' : 'Encrypted WebRTC'}
                </span>
              </div>

              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                controls
                className={`absolute inset-0 w-full h-full object-cover ${remoteStream ? '' : 'hidden'}`}
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
                  <p className="text-xs text-stone-300">
                    {connectionStatus === 'unsupported'
                      ? 'Live video is not supported in this browser.'
                      : connectionStatus === 'failed'
                        ? 'Could not connect. Check that both role tabs are open in this browser and retry the live feed.'
                        : 'Waiting for the responder to accept the dispatch and start live video.'}
                  </p>
                </div>
              )}

              <div className="relative mt-auto flex items-center justify-between text-[11px] text-stone-300 z-10 pt-4">
                <span>{connectionStatus === 'connected' ? 'Live responder camera and microphone' : 'This preview demo requires both tabs in one browser'}</span>
                <span className="font-mono">{RESPONDER_DATA.name}</span>
              </div>
            </div>

            {/* Live Voice Waveform & Telemetry */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700 flex items-center space-x-1.5">
                    <Mic className="w-3.5 h-3.5 text-tealbrand-700" />
                    <span>Responder audio status</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${connectionStatus === 'connected' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-stone-600 bg-stone-100 border-stone-200'}`}>
                    {connectionStatus === 'connected' ? 'Live audio connected' : 'Waiting for live audio'}
                  </span>
                </div>

                {/* Decorative waveform, not an audio measurement */}
                <div className="h-10 flex items-center space-x-1 px-1 bg-white rounded border border-stone-200 overflow-hidden">
                  {[18, 35, 60, 42, 80, 55, 90, 70, 30, 65, 85, 40, 25, 75, 95, 60, 35, 50, 70, 45, 30, 55, 20].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-tealbrand-600 rounded-full transition-all duration-150"
                      style={{ height: `${Math.max(15, (h * ((csiWaveOffset % 20) + 10)) % 100)}%` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-stone-500">Animated demo visualization</span>
              </div>

              {/* Responder Profile Card */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">{RESPONDER_DATA.name}</span>
                  <span className="text-[11px] text-stone-500 block">{RESPONDER_DATA.vehicle}</span>
                  <span className="text-[11px] text-tealbrand-700 font-medium block mt-0.5">
                    {RESPONDER_DATA.certifications}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-stone-800">{RESPONDER_DATA.rating}</span>
                  <span className="text-[11px] text-stone-500 block">{RESPONDER_DATA.rescuesCount} rescues</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Member Full Profile & Medicines Location (Critical requirement) */}
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Protected Member Profile
            </h3>
          </div>
          <span className="text-xs text-stone-500">ID: DEMO-001</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] uppercase font-bold text-stone-400 block">Full Name &amp; Age</span>
            <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.name}, {MEMBER_DATA.age} years</span>
            <span className="text-xs text-stone-500 block mt-0.5">Sample protected member</span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-stone-400 block">Demo location</span>
            <span className="text-xs font-medium text-stone-800 block leading-relaxed">
              {MEMBER_DATA.address}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase font-bold text-stone-400 block">Sample health data</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {MEMBER_DATA.healthProblems.map((cond, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Medicines & Storage Location Callout */}
        <div className="p-3.5 bg-stone-50 border border-stone-300 rounded space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-emergency-700" />
              <span>Sample medication &amp; storage:</span>
            </span>
            <span className="text-[11px] text-stone-500">Demo data only</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {MEMBER_DATA.medicines.map((med, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded bg-white text-stone-800 border border-stone-300"
              >
                {med}
              </span>
            ))}
          </div>

          <div className="pt-1 text-xs text-stone-800 bg-white p-2.5 rounded border border-stone-200">
            <strong className="text-emergency-700">Storage Location: </strong>
            <span>{MEMBER_DATA.tabletLocation}</span>
          </div>
        </div>

        {/* Vitals & Health Device Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Blood Pressure</span>
            <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.vitals.bloodPressure}</span>
            <span className="text-[10px] text-stone-500 block">Sample value only</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Heart Rate</span>
            <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.vitals.heartRate}</span>
            <span className="text-[10px] text-stone-500 block">Sample value only</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">SpO2 Oxygen</span>
            <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.vitals.oxygenSat}</span>
            <span className="text-[10px] text-stone-500 block">Sample value only</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Health Ring Node</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Simulated</span>
            </span>
            <span className="text-[10px] text-stone-500 block truncate">{MEMBER_DATA.vitals.deviceName}</span>
          </div>
        </div>
      </section>

      {/* Home Monitor: Situations in the House */}
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center space-x-2">
            <Home className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Home Monitor &bull; Simulated sensors
            </h3>
          </div>
          <span className="text-xs text-stone-500">{incidentState.monitoringEnabled ? '4 simulated sensors active' : '4 simulated sensors paused'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MEMBER_DATA.homeRooms.map((room, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border flex items-center justify-between ${
                room.status === 'alert' && isIncidentActive
                  ? 'bg-emergency-50 border-emergency-300'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-stone-900 block">{room.name}</span>
                <span className="text-[11px] text-stone-500 block">Last motion: {room.lastMotion}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-mono text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                  Door: {room.door}
                </span>
                {room.status === 'alert' && isIncidentActive && (
                  <span className="text-[10px] text-emergency-700 font-bold block mt-1">
                    Fall Detected Here
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Wi-Fi CSI (Coming soon) Section with 3D House Wireframe & Waves */}
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-tealbrand-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Wi-Fi CSI (Channel State Information)
            </h3>
            <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
              Coming soon &bull; Simulation
            </span>
          </div>
          <span className="text-xs font-mono text-tealbrand-800 font-semibold">Demo only</span>
        </div>

        <p className="text-xs text-stone-600">
          This animated waveform is illustrative only. It does not read Wi-Fi signals, detect falls, or monitor people.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Illustrative demo waveform */}
          <div className="p-3 bg-stone-900 text-white rounded border border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">Sub-carrier Body Motion Waveform</span>
              <span className="font-mono text-tealbrand-300">5.8 GHz OFDM</span>
            </div>

            <div className="h-20 w-full flex items-center justify-center relative overflow-hidden bg-stone-950 rounded border border-stone-800">
              {/* SVG Sine waves with phase shifts */}
              <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                <path
                  d={`M 0,40 Q 25,${40 + Math.sin(csiWaveOffset * 0.1) * 20} 50,40 T 100,40 T 150,40 T 200,40 T 250,40 T 300,40`}
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                />
                <path
                  d={`M 0,40 Q 30,${40 + Math.cos(csiWaveOffset * 0.1) * 15} 60,40 T 120,40 T 180,40 T 240,40 T 300,40`}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </svg>
              <div className="absolute bottom-1 right-2 text-[10px] font-mono text-stone-400">
                Demo visualization only
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-stone-500 block">Signal status:</span>
                <span className="font-semibold text-stone-200">Not measured</span>
              </div>
              <div>
                <span className="text-stone-500 block">Detection status:</span>
                <span className="font-semibold text-stone-200">Simulation only</span>
              </div>
            </div>
          </div>

          {/* Simple 3D Model of the House (Isometric wireframe simulation) */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
              <span className="flex items-center space-x-1">
                <Box className="w-3.5 h-3.5 text-tealbrand-700" />
                <span>Demo home &bull; Simulated layout</span>
              </span>
              <span className="text-[10px] text-stone-500">Isometric View</span>
            </div>

            {/* Wireframe isometric SVG canvas */}
            <div className="h-28 w-full bg-white rounded border border-stone-200 flex items-center justify-center relative overflow-hidden">
              <svg className="w-64 h-24" viewBox="0 0 260 100">
                {/* House Base Isometric polygon */}
                <polygon points="130,10 240,45 130,85 20,45" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Rooms Partition */}
                <line x1="130" y1="10" x2="130" y2="85" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1="75" y1="27" x2="185" y2="65" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
                {/* Labels */}
                <text x="70" y="40" fontSize="9" fill="#64748b" textAnchor="middle">Living Room</text>
                <text x="175" y="35" fontSize="9" fill="#64748b" textAnchor="middle">Kitchen</text>
                <text x="85" y="65" fontSize="9" fill="#dc2626" fontWeight="bold" textAnchor="middle">
                  Bedroom (Fall)
                </text>
                <text x="175" y="75" fontSize="9" fill="#64748b" textAnchor="middle">Entrance</text>
                {/* Fall Signal Node */}
                <circle cx="85" cy="55" r="5" fill="#dc2626" opacity="0.8">
                  <animate attributeName="r" values="3;8;3" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <span className="text-[11px] text-stone-500 block">
              Simulated room layout only; no location is detected.
            </span>
          </div>
        </div>
      </section>

      {/* Sample contacts */}
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Sample contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* (a) Guardian */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Guardian</span>
              <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.contacts.guardian.name}</span>
              <span className="text-xs text-stone-500 block">{MEMBER_DATA.contacts.guardian.relation}</span>
            </div>
            <span className="text-xs text-stone-500">Demo phone: {MEMBER_DATA.contacts.guardian.phone} (not dialable)</span>
          </div>

          {/* (b) Risk Saver */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Demo support</span>
              <span className="text-sm font-bold text-stone-900">{MEMBER_DATA.contacts.riskSaver.name}</span>
              <span className="text-xs text-stone-500 block">{MEMBER_DATA.contacts.riskSaver.role}</span>
            </div>
            <span className="text-xs text-stone-500">Demo phone: {MEMBER_DATA.contacts.riskSaver.phone} (not dialable)</span>
          </div>
        </div>
      </section>

      {/* System Status Telemetry */}
      <details className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs group">
        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-stone-700">
          <span>Demo status &amp; telemetry</span>
          <span className="text-[10px] font-medium normal-case tracking-normal text-stone-500 group-open:hidden">Show details</span>
          <span className="text-[10px] font-medium normal-case tracking-normal text-stone-500 hidden group-open:inline">Hide details</span>
        </summary>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Network Status</span>
            <span className="font-semibold text-stone-800">{MEMBER_DATA.systemStats.network}</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Avg Response Time</span>
            <span className="font-semibold text-stone-800">{MEMBER_DATA.systemStats.avgResponseTime}</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Distance Covered</span>
            <span className="font-semibold text-stone-800">{MEMBER_DATA.systemStats.totalDistanceCovered}</span>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Phone &amp; Fall History</span>
            <span className="font-semibold text-stone-800">
              {MEMBER_DATA.systemStats.deviceBattery} &bull; {MEMBER_DATA.systemStats.fallDetectionsCount}
            </span>
          </div>
        </div>
      </details>
    </div>
  );
}
