import React, { useState, useEffect, useRef } from 'react';
import { TIMINGS, COORDINATES, MEMBER_DATA, RESPONDER_DATA } from './config/constants';
import { syncManager } from './utils/sync';
import { audioManager } from './utils/audio';

import LoginScreen from './components/LoginScreen';
import RoleSwitcher from './components/RoleSwitcher';
import GuardianDashboard from './components/GuardianDashboard';
import ResponderDashboard from './components/ResponderDashboard';
import MemberScreen from './components/MemberScreen';

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState(() => {
    try {
      return localStorage.getItem('rescue_help_current_role') || null;
    } catch {
      return null;
    }
  });

  const [incidentState, setIncidentState] = useState(() => syncManager.getState());
  const timerRef = useRef(null);
  const telemetryRef = useRef(null);

  // Sync listener across tabs via BroadcastChannel & localStorage
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newState) => {
      setIncidentState(newState);
    });
    return () => unsubscribe();
  }, []);

  const getEffectiveDuration = (seconds, multiplier) => {
    return Math.max(1, Math.round(seconds / (multiplier || 1)));
  };

  const addTimelineEvent = (message, status = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp,
      message,
      status
    };
    syncManager.updateState((prev) => ({
      ...prev,
      timeline: [event, ...prev.timeline]
    }));
  };

  // Login handler
  const handleLoginSuccess = (role) => {
    setCurrentUserRole(role);
    try {
      localStorage.setItem('rescue_help_current_role', role);
      localStorage.removeItem('rescue_help_user_phone');
    } catch {
      // Ignored
    }
  };

  const handleRoleChange = (newRole) => {
    setCurrentUserRole(newRole);
    try {
      localStorage.setItem('rescue_help_current_role', newRole);
    } catch {
      // Ignored
    }
  };

  // 3x Fast Speed Toggle
  const handleToggleSpeed = () => {
    const newMultiplier = incidentState.speedMultiplier === 1 ? 3 : 1;
    syncManager.updateState((prev) => ({
      ...prev,
      speedMultiplier: newMultiplier
    }));
  };

  // Reset Demo Scenario
  const handleResetDemo = () => {
    audioManager.stopAll();
    clearInterval(timerRef.current);
    clearInterval(telemetryRef.current);
    const reset = syncManager.resetState();
    setIncidentState(reset);
  };

  // Fall Alert Triggered on Member screen
  const handleTriggerFall = () => {
    audioManager.stopAll();
    const duration = getEffectiveDuration(TIMINGS.loudAlarm, incidentState.speedMultiplier);

    addTimelineEvent('Fall impact detected at the simulated residence (Bedroom sensor)', 'alert');
    addTimelineEvent(`Initiated 30s buffer. First half: Loud siren sounding on member phone (${duration}s)`, 'alert');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'buffer_loud',
      activeStep: 'loudAlarm',
      fallTriggeredAt: Date.now(),
      stepRemainingSeconds: duration
    }));
  };

  // Cancel fall (Member tapped "I'm OK" or false alarm)
  const handleCancelFall = () => {
    audioManager.stopAll();
    clearInterval(timerRef.current);
    addTimelineEvent("Member tapped 'I am OK'. Emergency alarm cancelled. Member confirmed safe.", 'success');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'cancelled',
      activeStep: null,
      stepRemainingSeconds: 0
    }));
  };

  // Guardian answers incoming call
  const handleAnswerGuardianCall = () => {
    audioManager.stopPhoneRinging();
    clearInterval(timerRef.current);
    addTimelineEvent(`${MEMBER_DATA.contacts.guardian.name} answered the simulated guardian call. Alarm simulation cancelled.`, 'success');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'cancelled',
      guardianCallState: 'answered',
      activeStep: null,
      stepRemainingSeconds: 0
    }));
  };

  // Responder accepts dispatch
  const handleAcceptDispatch = () => {
    audioManager.stopAll();
    addTimelineEvent(`${RESPONDER_DATA.name} accepted the simulated dispatch.`, 'alert');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'responder_enroute',
      responderAccepted: true,
      activeStep: 'responder'
    }));
  };

  // Responder arrived on scene
  const handleArrivedAtScene = () => {
    addTimelineEvent(`${RESPONDER_DATA.name} arrived at the simulated residence.`, 'info');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'responder_arrived',
      responderArrived: true,
      responderDistanceMeters: 0,
      responderEtaSeconds: 0,
      responderCoords: COORDINATES.member
    }));
  };

  // Simulate demo ambulance dispatch.
  const handleCallAmbulance = () => {
    addTimelineEvent('Demo ambulance dispatched from the simulated response hub.', 'alert');

    syncManager.updateState((prev) => ({
      ...prev,
      status: 'ambulance_dispatched',
      ambulanceDispatched: true,
      ambulanceDistanceMeters: 2200,
      ambulanceEtaSeconds: 360,
      handoverOtp: String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0'),
      handoverCompleted: false
    }));
  };

  // Submit Handover OTP
  const handleSubmitHandoverOtp = (submittedOtp) => {
    if (!/^\d{6}$/.test(submittedOtp)) return false;

    let verified = false;
    syncManager.updateState((prev) => {
      if (prev.status !== 'handover_pending' || submittedOtp !== prev.handoverOtp) {
        return prev;
      }

      verified = true;
      const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false });
      const events = [
        {
          id: `evt-${Date.now()}-handover`,
          timestamp,
          message: 'Demo ambulance team verified the handover code.',
          status: 'success'
        },
        {
          id: `evt-${Date.now()}-resolved`,
          timestamp,
          message: 'Demo rescue mission completed successfully.',
          status: 'success'
        }
      ];

      return {
        ...prev,
        status: 'resolved',
        handoverCompleted: true,
        timeline: [...events, ...prev.timeline]
      };
    });
    return verified;
  };

  // Responder marks tablets located
  const handleMarkTabletsLocated = () => {
    addTimelineEvent(`${RESPONDER_DATA.name} located the sample medicine storage.`, 'success');
    syncManager.updateState((prev) => ({
      ...prev,
      tabletsLocated: true
    }));
  };

  // Escalation State Machine Ticker
  useEffect(() => {
    const isEscalating = ['buffer_loud', 'buffer_wait', 'guardian_call', 'live_call'].includes(incidentState.status);

    if (isEscalating) {
      timerRef.current = setInterval(() => {
        setIncidentState((current) => {
          const nextSec = current.stepRemainingSeconds - 1;

          if (nextSec > 0) {
            const updated = { ...current, stepRemainingSeconds: nextSec };
            syncManager.saveState(updated);
            return updated;
          }

          // Step timer reached 0 -> transition to next step
          clearInterval(timerRef.current);
          let nextStatus = current.status;
          let nextStep = current.activeStep;
          let nextDuration = 0;

          if (current.status === 'buffer_loud') {
            // Move to buffer_wait (2nd half of 30s)
            nextStatus = 'buffer_wait';
            nextStep = 'memberWait';
            nextDuration = getEffectiveDuration(TIMINGS.memberWait, current.speedMultiplier);
            addTimelineEvent(`Member did not respond to initial siren. Second buffer wait active (${nextDuration}s)`, 'alert');
          } else if (current.status === 'buffer_wait') {
            // Buffer expired -> Call Guardian
            audioManager.stopEmergencySiren();
            audioManager.startPhoneRinging();
            nextStatus = 'guardian_call';
            nextStep = 'guardianCall';
            nextDuration = getEffectiveDuration(TIMINGS.guardianCall, current.speedMultiplier);
            addTimelineEvent(`Member buffer expired. ${MEMBER_DATA.contacts.guardian.name} call stage simulated (${nextDuration}s)`, 'alert');
          } else if (current.status === 'guardian_call') {
            // Guardian did not answer -> Live Talk Channel
            audioManager.stopPhoneRinging();
            nextStatus = 'live_call';
            nextStep = 'liveCall';
            nextDuration = getEffectiveDuration(TIMINGS.liveCall, current.speedMultiplier);
            addTimelineEvent(`${MEMBER_DATA.contacts.guardian.name} call stage timed out. Live talk simulation started (${nextDuration}s)`, 'alert');
          } else if (current.status === 'live_call') {
            // Live call unanswered -> Urgent Responder dispatch + Ambulance alert
            audioManager.playAlertChime();
            nextStatus = 'responder_alerted';
            nextStep = 'responder';
            nextDuration = 0;
            addTimelineEvent(`Live call timed out. ${RESPONDER_DATA.name} notified and demo ambulance alert simulated.`, 'alert');
          }

          const advancedState = {
            ...current,
            status: nextStatus,
            activeStep: nextStep,
            stepRemainingSeconds: nextDuration
          };
          syncManager.saveState(advancedState);
          return advancedState;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [incidentState.status, incidentState.speedMultiplier]);

  // Telemetry Interpolation for Responder & Ambulance
  useEffect(() => {
    const isEnroute = incidentState.status === 'responder_enroute';
    const isAmbulanceEnroute = ['ambulance_dispatched'].includes(incidentState.status);

    if (isEnroute || isAmbulanceEnroute) {
      telemetryRef.current = setInterval(() => {
        syncManager.updateState((prev) => {
          let updated = { ...prev };

          // Move the simulated responder to the demo residence.
          if (prev.status === 'responder_enroute') {
            const currentRCoords = prev.responderCoords;
            const target = COORDINATES.member;
            const dLat = (target[0] - currentRCoords[0]) * 0.15;
            const dLng = (target[1] - currentRCoords[1]) * 0.15;
            const newDist = Math.max(0, prev.responderDistanceMeters - 95);
            const newEta = Math.max(0, prev.responderEtaSeconds - 15);

            if (newDist <= 40) {
              updated = {
                ...updated,
                status: 'responder_arrived',
                responderArrived: true,
                responderCoords: target,
                responderDistanceMeters: 0,
                responderEtaSeconds: 0
              };
              addTimelineEvent(`${RESPONDER_DATA.name} arrived at the simulated residence.`, 'info');
            } else {
              updated = {
                ...updated,
                responderCoords: [currentRCoords[0] + dLat, currentRCoords[1] + dLng],
                responderDistanceMeters: newDist,
                responderEtaSeconds: newEta
              };
            }
          }

          // Move the simulated ambulance to the demo residence.
          if (prev.status === 'ambulance_dispatched') {
            const currentACoords = prev.ambulanceCoords;
            const target = COORDINATES.member;
            const dLat = (target[0] - currentACoords[0]) * 0.1;
            const dLng = (target[1] - currentACoords[1]) * 0.1;
            const newDist = Math.max(0, prev.ambulanceDistanceMeters - 120);
            const newEta = Math.max(0, prev.ambulanceEtaSeconds - 18);

            if (newDist <= 60) {
              updated = {
                ...updated,
                status: 'handover_pending',
                ambulanceArrived: true,
                ambulanceCoords: target,
                ambulanceDistanceMeters: 0,
                ambulanceEtaSeconds: 0
              };
              addTimelineEvent('Demo ambulance reached the simulated residence. Ready for handover verification.', 'info');
            } else {
              updated = {
                ...updated,
                ambulanceCoords: [currentACoords[0] + dLat, currentACoords[1] + dLng],
                ambulanceDistanceMeters: newDist,
                ambulanceEtaSeconds: newEta
              };
            }
          }

          return updated;
        });
      }, 1500);
    }

    return () => clearInterval(telemetryRef.current);
  }, [incidentState.status]);

  // If user has not selected role yet, render Login Screen
  if (!currentUserRole) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans selection:bg-tealbrand-100 selection:text-tealbrand-900">
      {/* Role Switcher & Controls Top Bar */}
      <RoleSwitcher
        currentRole={currentUserRole}
        onRoleChange={handleRoleChange}
        incidentStatus={incidentState.status}
        speedMultiplier={incidentState.speedMultiplier}
        onToggleSpeed={handleToggleSpeed}
        onResetDemo={handleResetDemo}
      />

      {/* Role Specific Screens */}
      <main className="flex-1">
        {currentUserRole === 'guardian' && (
          <GuardianDashboard
            incidentState={incidentState}
            onAnswerGuardianCall={handleAnswerGuardianCall}
          />
        )}

        {currentUserRole === 'responder' && (
          <ResponderDashboard
            incidentState={incidentState}
            onAcceptDispatch={handleAcceptDispatch}
            onArrivedAtScene={handleArrivedAtScene}
            onCallAmbulance={handleCallAmbulance}
            onSubmitHandoverOtp={handleSubmitHandoverOtp}
            onMarkTabletsLocated={handleMarkTabletsLocated}
            onResetDemo={handleResetDemo}
          />
        )}

        {currentUserRole === 'member' && (
          <MemberScreen
            incidentState={incidentState}
            onTriggerFall={handleTriggerFall}
            onCancelFall={handleCancelFall}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Clean Mobile-first Footer */}
      <footer className="bg-white border-t border-stone-200 py-3 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>ResQ &bull; Public Demo — simulated data only</span>
          <span className="text-[11px] text-stone-400 font-mono">
            Cross-Tab Real-time BroadcastChannel Sync Active
          </span>
        </div>
      </footer>
    </div>
  );
}
