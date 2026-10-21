import React, { useState, useEffect, useRef } from 'react';
import SatelliteMap from './SatelliteMap';
import { useLiveMedia } from '../utils/liveMedia';
import {
  MEMBER_DATA,
  RESPONDER_DATA,
  AMBULANCE_DATA,
  COORDINATES
} from '../config/constants';
import { audioManager } from '../utils/audio';
import GradientPlaceholder from './GradientPlaceholder';
import IncidentTimeline from './IncidentTimeline';
import {
  Bike,
  Mic,
  Camera,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  FolderLock,
  KeyRound,
  RefreshCw,
  Power,
  Pill,
  Box,
  MapPin,
  CheckSquare
} from 'lucide-react';

export default function ResponderDashboard({
  incidentState,
  onAcceptDispatch,
  onArrivedAtScene,
  onCallAmbulance,
  onSubmitHandoverOtp,
  onMarkTabletsLocated,
  onResetScenario
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'granted' | 'denied' | 'pending'
  const [isLiveSharing, setIsLiveSharing] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { connectionStatus } = useLiveMedia(
    'responder',
    Boolean(incidentState.responderAccepted && isLiveSharing && cameraStream),
    cameraStream
  );

  const isDispatchActive = ['responder_alerted', 'responder_enroute', 'responder_arrived', 'ambulance_dispatched', 'handover_pending'].includes(incidentState.status);
  const isEnroute = ['responder_enroute'].includes(incidentState.status);
  const isArrived = ['responder_arrived', 'ambulance_dispatched', 'handover_pending'].includes(incidentState.status);
  const isAmbulanceCalled = ['ambulance_dispatched', 'handover_pending'].includes(incidentState.status);
  const isHandoverReady = incidentState.status === 'handover_pending';
  const isResolved = incidentState.status === 'resolved';
  const routeDirection = (() => {
    const [latitude, longitude] = incidentState.responderCoords;
    const [targetLatitude, targetLongitude] = COORDINATES.member;
    const radians = Math.PI / 180;
    const deltaLongitude = (targetLongitude - longitude) * radians;
    const originLatitude = latitude * radians;
    const destinationLatitude = targetLatitude * radians;
    const north = Math.sin(deltaLongitude) * Math.cos(destinationLatitude);
    const east = Math.cos(originLatitude) * Math.sin(destinationLatitude)
      - Math.sin(originLatitude) * Math.cos(destinationLatitude) * Math.cos(deltaLongitude);
    const bearing = (Math.atan2(north, east) * 180 / Math.PI + 360) % 360;
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(bearing / 45) % 8];
  })();

  // Request browser permissions when going online
  const handleToggleOnline = async () => {
    if (!isOnline) {
      setShowPermissionModal(true);
    } else {
      setIsOnline(false);
      stopCamera();
    }
  };

  const grantPermissions = () => {
    setShowPermissionModal(false);
    setIsOnline(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { },
        () => { },
        { enableHighAccuracy: true, timeout: 3000 }
      );
    }
  };

  const stopCamera = () => {
    setIsLiveSharing(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraPermission('pending');
  };

  const startLiveSharing = async () => {
    setMediaError('');
    try {
      let stream = cameraStream;
      if (!stream) {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera and microphone access are not supported by this browser.');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCameraStream(stream);
        setCameraPermission('granted');
      }
      setIsLiveSharing(true);
    } catch (error) {
      setCameraPermission('denied');
      setMediaError(error instanceof Error ? error.message : 'Camera and microphone permission was not granted.');
    }
  };

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
    return () => {
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream]);

  // Simulated animated video canvas fallback if camera is denied
  useEffect(() => {
    if (cameraPermission !== 'granted' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let frameId;
      let angle = 0;

      const drawSimulatedFeed = () => {
        angle += 0.04;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Animated crosshairs
        const cx = canvas.width / 2 + Math.sin(angle) * 20;
        const cy = canvas.height / 2 + Math.cos(angle) * 10;
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 45, cy);
        ctx.lineTo(cx + 45, cy);
        ctx.moveTo(cx, cy - 45);
        ctx.lineTo(cx, cy + 45);
        ctx.stroke();

        // Timestamp overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.fillText('RESQ RESPONDER CAMERA', 12, 20);
        ctx.fillText('GPS: simulated location only', 12, 36);
        ctx.fillText(`SIMULATED ${new Date().toLocaleTimeString('en-IN')}`, 12, 52);

        frameId = requestAnimationFrame(drawSimulatedFeed);
      };

      drawSimulatedFeed();
      return () => cancelAnimationFrame(frameId);
    }
  }, [cameraPermission]);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(enteredOtp) || !onSubmitHandoverOtp(enteredOtp)) {
      setOtpError('That handover code does not match. Please verify the code with the Guardian.');
      return;
    }

    setOtpError('');
    setEnteredOtp('');
    audioManager.playSuccessChime();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 font-sans">
      <GradientPlaceholder label="Responder field workflow" filename="responder-field.webp" variant="responder" className="h-24 sm:h-28" />
      {/* Responder Top Bar & Online Switch */}
      <div className="border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-900">{RESPONDER_DATA.name}</h2>
              <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.2 rounded border border-stone-200">
                {RESPONDER_DATA.vehicle}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {RESPONDER_DATA.certifications} &bull; Simulated area
            </p>
          </div>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-stone-300'}`}></span>
            <span className="text-xs font-semibold text-stone-800">
              {isOnline ? 'Online & Available' : 'Offline'}
            </span>
          </div>

          <button
            onClick={handleToggleOnline}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center space-x-1.5 ${isOnline
                ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                : 'bg-tealbrand-700 hover:bg-tealbrand-800 text-white'
              }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>
      </div>

      {!incidentState.responderAccepted && incidentState.status !== 'responder_alerted' && (
        <section className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs" aria-label="Responder standby status">
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`}></div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {isResolved ? 'Rescue completed' : incidentState.status === 'cancelled' ? 'No active dispatch' : isOnline ? 'You’re on standby' : 'You’re offline'}
              </h3>
              <p className="text-sm text-stone-600 mt-1">
                {isResolved
                  ? 'The last incident simulation has been handed over. Reset the scenario to wait for another request.'
                  : incidentState.status === 'cancelled'
                    ? 'The alert was cancelled. Reset the scenario or switch to Member to simulate another fall.'
                    : isOnline
                      ? 'No emergency requests right now. When a dispatch arrives, accept it to see the member’s live location and essential care details.'
                      : 'Go online to receive the next simulated emergency request.'}
              </p>
              <p className="text-xs text-stone-500 mt-3">
                To try the simulation, switch to Member, tap <strong>Simulate Fall</strong>, then return here after the alert escalates.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Permission Request Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-stone-300 max-w-sm w-full p-5 shadow-lg space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
              <Camera className="w-5 h-5 text-tealbrand-700" />
              <h3 className="text-sm font-bold text-stone-900">Responder Device Permissions</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Going online enables responder availability. Camera and microphone are requested only after you accept an emergency and choose to start a live feed.
            </p>
            <ul className="text-xs text-stone-700 space-y-1 list-disc list-inside">
              <li><strong>Location:</strong> Browser location permission for the responder map.</li>
              <li><strong>Camera &amp; Microphone:</strong> Optional; requested when you start a live feed.</li>
            </ul>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="px-3 py-1.5 rounded text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={grantPermissions}
                className="px-4 py-1.5 rounded text-xs font-bold bg-tealbrand-700 hover:bg-tealbrand-800 text-white"
              >
                Go Online
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URGENT DISPATCH INCOMING BANNER (Section 4 requirement) */}
      {incidentState.status === 'responder_alerted' && (
        <div className="bg-emergency-600 text-white rounded-lg p-5 shadow-lg space-y-4 animate-pulse">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 bg-emergency-800/90 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>URGENT &bull; GO FAST, IMMEDIATELY</span>
            </span>
            <span className="text-xs font-mono text-emergency-200">Simulated route</span>
          </div>

          <div>
            <h3 className="text-xl font-bold">Fall alert: {MEMBER_DATA.name} ({MEMBER_DATA.age} yrs)</h3>
            <p className="text-xs text-emergency-100 mt-1">
              Member and guardian call simulations timed out. A simulated dispatch was triggered.
            </p>
          </div>

          <div className="bg-white/10 rounded p-3 text-xs space-y-2 border border-white/20">
            <span className="text-emergency-100 block">Approximate distance: {incidentState.responderDistanceMeters >= 1000 ? `${(incidentState.responderDistanceMeters / 1000).toFixed(1)} km` : `${incidentState.responderDistanceMeters} m`}</span>
            <span className="text-emergency-100 block">Accept the request to see the member's exact location and emergency profile.</span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-emergency-100">Exact location and care details unlock after acceptance.</span>
            <button
              onClick={onAcceptDispatch}
              className="px-6 py-3 bg-white text-emergency-800 hover:bg-stone-100 rounded-lg text-sm font-extrabold shadow-md flex items-center space-x-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Accept &amp; Start Route</span>
            </button>
          </div>
        </div>
      )}

      {incidentState.responderAccepted && (
        <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3" aria-label="Accepted sample member details">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">Sample member profile</h3>
            <span className="text-xs font-mono text-stone-500">
              {incidentState.responderDistanceMeters >= 1000 ? `${(incidentState.responderDistanceMeters / 1000).toFixed(1)} km away` : `${incidentState.responderDistanceMeters} m away`}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Member &amp; age</span>
              <strong className="text-sm text-stone-900">{MEMBER_DATA.name}, {MEMBER_DATA.age} yrs</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Simulated location</span>
              <strong className="text-stone-800">{MEMBER_DATA.address}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Sample health data</span>
              <strong className="text-stone-800">{MEMBER_DATA.healthProblems.join(', ')}</strong>
              <span className="text-stone-600 block mt-1">Medicines: {MEMBER_DATA.medicines.join(', ')}</span>
            </div>
          </div>
        </section>
      )}

      {/* CRITICAL FIRST RESPONDER DIRECTIVE: TABLETS LOCATION */}
      {isArrived && <section
        aria-label="Critical Tablets Directive"
        className={`rounded-lg border-2 p-4 sm:p-5 shadow-xs transition-all ${
          incidentState.tabletsLocated
            ? 'bg-emerald-50 border-emerald-400'
            : isDispatchActive
            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
            : 'bg-white border-stone-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 pb-3">
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs ${
                incidentState.tabletsLocated ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold uppercase tracking-tight text-stone-900">
                  Critical Responder Task: Emergency Tablets
                </h3>
                {incidentState.tabletsLocated ? (
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    Tablets in Hand
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 animate-pulse">
                    Locate First Upon Entry
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {RESPONDER_DATA.name} is approaching &bull; Member: {MEMBER_DATA.name} ({MEMBER_DATA.age} yrs)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-stone-700 bg-white px-2.5 py-1 rounded border border-stone-200">
            <MapPin className="w-3.5 h-3.5 text-emergency-600" />
            <span>Simulated residence</span>
          </div>
        </div>

        {/* Visual Breadcrumb Location */}
        <div className="my-3 p-3 bg-white rounded border border-stone-200 space-y-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Exact Location In House (Step-by-Step Navigation):
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-stone-800">
            <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200">1. Main Entrance (Passcode {MEMBER_DATA.entryAccessCode})</span>
            <span className="text-stone-400">&rarr;</span>
            <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200">2. Kitchen</span>
            <span className="text-stone-400">&rarr;</span>
            <span className="px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">3. Sample storage</span>
            <span className="text-stone-400">&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emergency-600 text-white font-extrabold shadow-xs">
              4. Sample box
            </span>
          </div>
          <p className="text-xs text-stone-700 font-medium pt-1">
            <strong className="text-stone-900">Registered Storage Note: </strong>
            "{MEMBER_DATA.tabletLocation}"
          </p>
        </div>

        {/* Prescription Details & Why This Matters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 bg-white rounded border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Sample medication 1</span>
            <span className="font-bold text-stone-900 text-sm">Sample medication A</span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Placeholder only. No real medical advice or treatment information.
            </span>
          </div>

          <div className="p-2.5 bg-white rounded border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Sample medication 2</span>
            <span className="font-bold text-stone-900 text-sm">Sample medication B</span>
            <span className="text-[11px] text-stone-500 block mt-0.5">
              Placeholder only. No real medical advice or treatment information.
            </span>
          </div>
        </div>

        {/* Action Button: Mark Tablets Located */}
        <div className="mt-3 pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-600">
            {incidentState.tabletsLocated ? (
              <span className="text-emerald-800 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified: Sample medication is ready for the simulated handover.</span>
              </span>
            ) : (
              <span>Once inside, check the sample storage location and confirm below:</span>
            )}
          </div>

          {!incidentState.tabletsLocated ? (
            <button
              onClick={onMarkTabletsLocated}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded shadow-xs flex items-center justify-center space-x-2 transition-colors flex-shrink-0"
            >
              <Box className="w-4 h-4" />
              <span>I Have Located the Sample Box</span>
            </button>
          ) : (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded flex items-center space-x-1.5 flex-shrink-0">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sample medication secured for simulated handover</span>
            </span>
          )}
        </div>
      </section>}

      {incidentState.responderAccepted && (
        <section className="rounded-xl border border-tealbrand-200 bg-tealbrand-50 p-4" aria-label="Simulated route guidance">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tealbrand-800" aria-hidden="true" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-tealbrand-900">Simulated navigation</h3>
              <p className="mt-1 text-sm font-semibold text-stone-900">
                {isEnroute
                  ? `Head ${routeDirection} toward the simulated residence.`
                  : isArrived
                    ? 'You are at the simulated residence.'
                    : 'Simulated route guidance is standing by.'}
              </p>
              <p className="mt-1 text-[11px] text-stone-600">Straight-line guidance only; no live GPS or road directions are used.</p>
            </div>
          </div>
        </section>
      )}

      {/* SATELLITE MAP */}
      {incidentState.responderAccepted && <section aria-label="Route Satellite Map">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Simulated Route &amp; Destination Map
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {isEnroute ? 'En Route &bull; Speed 28 km/h' : isArrived ? 'On Scene' : 'Standby'}
          </span>
        </div>
        <SatelliteMap
          memberCoords={COORDINATES.member}
          responderCoords={incidentState.responderCoords}
          ambulanceCoords={incidentState.ambulanceCoords}
          showResponder={incidentState.responderAccepted}
          showAmbulance={isAmbulanceCalled}
          statusMessage={
            isEnroute
              ? `Travelling to the simulated residence &bull; ETA ~${Math.ceil(incidentState.responderEtaSeconds / 60)} mins`
              : isArrived
                ? 'Arrived at the simulated residence. Checking sample member status.'
                : 'Standby at the simulated response hub'
          }
          responderDistance={incidentState.responderDistanceMeters}
          responderEta={incidentState.responderEtaSeconds}
          ambulanceDistance={incidentState.ambulanceDistanceMeters}
          ambulanceEta={incidentState.ambulanceEtaSeconds}
        />
      </section>}

      {/* LIVE PROOF ON SCREEN: CAMERA PREVIEW, AUDIO WAVEFORM, EVIDENCE LIST (Section 7 requirement) */}
      {incidentState.responderAccepted && (
        <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'}`}></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Responder Camera &amp; Microphone
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-semibold">
                {connectionStatus === 'connected' ? 'Connected to Guardian' : isLiveSharing ? 'Connecting...' : 'Not streaming'}
              </span>
              <button
                onClick={isLiveSharing ? stopCamera : startLiveSharing}
                className={`text-xs font-semibold rounded px-3 py-1.5 ${isLiveSharing ? 'bg-stone-200 text-stone-800 hover:bg-stone-300' : 'bg-tealbrand-700 text-white hover:bg-tealbrand-800'}`}
              >
                {isLiveSharing ? 'Stop live feed' : 'Start live video + voice'}
              </button>
            </div>
          </div>

          {mediaError && (
            <p role="alert" className="text-xs text-emergency-800 bg-emergency-50 border border-emergency-200 rounded p-2">
              {mediaError}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Camera Feed with Red REC Indicator */}
            <div className="relative aspect-video bg-stone-900 rounded overflow-hidden flex flex-col justify-between p-3 border border-stone-700">
              {/* Red REC Indicator */}
              <div className="flex items-center justify-between text-xs text-white z-10">
                <span className="flex items-center space-x-1.5 bg-emergency-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>{isLiveSharing ? 'LIVE' : 'PREVIEW'}</span>
                </span>
                <span className="font-mono text-[10px] text-stone-300 bg-black/60 px-2 py-0.5 rounded">
                  {cameraPermission === 'granted' ? 'Camera preview' : 'Simulated preview only'}
                </span>
              </div>

              {/* Actual Video Element or Canvas Fallback */}
              {cameraPermission === 'granted' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={180}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="flex items-center justify-between text-[11px] text-stone-200 bg-black/70 p-1.5 rounded z-10 font-mono">
                <span>{isLiveSharing ? 'Live camera permission granted' : 'No video is being shared'}</span>
                <span>{connectionStatus === 'connected' ? 'Guardian connected' : 'Waiting for Guardian tab'}</span>
              </div>
            </div>

            {/* Voice Waveform & Saved to Evidence List */}
            <div className="space-y-3 flex flex-col justify-between">
              {/* Voice recording waveform */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 flex items-center space-x-1">
                    <Mic className="w-3.5 h-3.5 text-tealbrand-700" />
                    <span>Microphone stream</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {isLiveSharing ? 'Microphone enabled' : 'Starts with live feed'}
                  </span>
                </div>

                <div className="h-8 flex items-center space-x-1 px-1 bg-white rounded border border-stone-200 overflow-hidden">
                  {[20, 45, 70, 50, 90, 60, 40, 85, 95, 30, 60, 80, 45, 75, 55, 30, 65, 90, 40, 60].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-emergency-600 rounded-full animate-pulse"
                      style={{ height: `${h}%`, animationDelay: `${i * 60}ms` }}
                    />
                  ))}
                </div>
              </div>

              {/* Media status */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 flex items-center space-x-1">
                    <FolderLock className="w-3.5 h-3.5 text-stone-700" />
                    <span>Evidence capture status</span>
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold">No evidence saved</span>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-stone-600">
                  <div className="flex items-center justify-between py-0.5 border-b border-stone-200">
                    <span>Camera preview simulation</span>
                    <span className="text-stone-500 font-bold">Not recorded</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-stone-200">
                    <span>Audio indicator simulation</span>
                    <span className="text-stone-500 font-bold">Not recorded</span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <span>Simulated route data</span>
                    <span className="text-stone-500 font-bold">Not recorded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Arrived at Scene Action */}
      {isEnroute && (
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-stone-900">Approaching the simulated residence</h4>
            <p className="text-xs text-stone-500">
              Confirm arrival to proceed with the simulated care steps.
            </p>
          </div>
          <button
            onClick={onArrivedAtScene}
            className="px-4 py-2 bg-tealbrand-700 hover:bg-tealbrand-800 text-white rounded text-xs font-bold shadow-xs flex-shrink-0"
          >
            Confirm Arrived at Scene
          </button>
        </div>
      )}

      {/* 4-step responder guide */}
      {isArrived && (
        <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 pb-2">
            <HeartPulse className="w-4 h-4 text-emergency-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Response simulation sequence (not medical advice)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block">Step 1: Responder arrives</span>
              <p className="text-stone-600 leading-relaxed">
                This is a simulated step. No real responder is being dispatched.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block">Step 2: Review simulation notice</span>
              <p className="text-stone-600 leading-relaxed">
                This screen provides no medical guidance. Follow qualified emergency professionals in a real emergency.
              </p>
            </div>

            <div
              className={`p-3 rounded space-y-1 border-2 transition-all ${
                incidentState.tabletsLocated
                  ? 'bg-emerald-50 border-emerald-400'
                  : 'bg-amber-50 border-amber-400 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-stone-900 block flex items-center space-x-1">
                  <Pill className="w-3.5 h-3.5 text-amber-700" />
                  <span>Step 3: Review sample storage</span>
                </span>
                {incidentState.tabletsLocated ? (
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded">
                    Secured in Hand
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded animate-pulse">
                    Sample only
                  </span>
                )}
              </div>
              <p className="text-stone-700 leading-relaxed">
                Check the <strong>sample medicine storage location</strong> for the sample medication. No real medical instructions are provided.
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-1">
              <span className="font-bold text-stone-900 block">Step 4: Complete simulated handover</span>
              <p className="text-stone-600 leading-relaxed">
                Maintain continuous visual and verbal contact until the simulated handover is complete.
              </p>
            </div>
          </div>

          {/* Call Ambulance Action */}
          {!isAmbulanceCalled && (
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500">Dispatch emergency transport</span>
              <button
                onClick={onCallAmbulance}
                className="px-4 py-2 bg-emergency-600 hover:bg-emergency-700 text-white rounded text-xs font-bold shadow-xs flex items-center space-x-1.5"
              >
                <HeartPulse className="w-4 h-4" />
                <span>Simulate ambulance dispatch</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* AMBULANCE HANDOVER OTP STEP (Section 7 requirement) */}
      {isHandoverReady && (
        <section className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-lg p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <KeyRound className="w-4 h-4" />
              <span>Ambulance Arrived &bull; Handover Verification</span>
            </span>
            <span className="text-xs font-mono text-stone-300">Unit: {AMBULANCE_DATA.vehicleId}</span>
          </div>

          <div>
            <h3 className="text-base font-bold">Enter Handover OTP with Ambulance Crew</h3>
            <p className="text-xs text-stone-300 mt-1">
              Emergency transport is on scene. Complete the simulated member handover using the verification code.
            </p>
          </div>

          {/* Form to submit OTP */}
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-200 block mb-1">
                Enter 6-digit Handover Code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Code from Guardian"
                className="w-full text-center text-lg tracking-widest font-mono py-2 rounded bg-stone-950 text-white border border-stone-700 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {otpError && (
              <span className="text-xs text-rose-400 block">{otpError}</span>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Handover &amp; Complete Rescue</span>
            </button>
          </form>
        </section>
      )}

      {/* FINAL INCIDENT SUMMARY (Section 7 requirement) */}
      {isResolved && (
        <section className="bg-white border-2 border-emerald-500 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold">Ambulance Has Taken Over the Member</h3>
              <p className="text-xs text-stone-600">
                Response simulation complete. The sample member handover was simulated.
              </p>
            </div>
          </div>

          {/* Final Incident Summary Timeline */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 block">
              Final Incident Summary &bull; Audit Trail
            </span>
            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between border-b border-stone-100 pb-1">
                <span>Member:</span>
                <strong className="text-stone-900">{MEMBER_DATA.name} ({MEMBER_DATA.age} yrs)</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1">
                <span>Location:</span>
                <span className="font-mono text-stone-800">Simulated residence</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1">
                <span>First Responder:</span>
                <strong className="text-stone-900">{RESPONDER_DATA.name} (Bike)</strong>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1">
                <span>Ambulance Unit:</span>
                <span className="font-mono text-stone-800">{AMBULANCE_DATA.vehicleId}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 pb-1">
                <span>Handover Verification:</span>
                <span className="font-mono text-emerald-700 font-bold">Verification code {incidentState.handoverOtp} confirmed</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span>Evidence Package:</span>
                <span className="text-stone-600">Not saved &bull; Simulation only</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onResetScenario}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset scenario</span>
            </button>
          </div>
        </section>
      )}

      {/* Medication reference */}
      {isArrived && <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-tealbrand-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Sample member reference &bull; Incident summary
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono">Simulated response hub</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Resident</span>
            <strong className="text-stone-900 text-sm">{MEMBER_DATA.name} ({MEMBER_DATA.age} yrs)</strong>
            <span className="text-stone-500 block mt-0.5">{MEMBER_DATA.address}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Sample health data</span>
            <span className="font-semibold text-stone-800">{MEMBER_DATA.healthProblems.join(', ')}</span>
            <span className="text-stone-500 block mt-0.5">Sample data only</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Emergency Tablet Storage</span>
            <span className="font-semibold text-stone-800">{MEMBER_DATA.medicines.join(' & ')}</span>
            <span className="text-amber-800 font-bold block mt-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Sample storage location
            </span>
          </div>
        </div>
      </section>}
      <IncidentTimeline timeline={incidentState.timeline} title="Responder incident timeline" />
    </div>
  );
}
