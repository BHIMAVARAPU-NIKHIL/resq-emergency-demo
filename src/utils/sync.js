// BroadcastChannel & localStorage Real-Time Sync between tabs

const STORAGE_KEY = 'resq_public_demo_incident_state_v2';
const CHANNEL_NAME = 'resq_public_demo_incident_channel';

export const INITIAL_INCIDENT_STATE = {
  // 'idle' | 'buffer_loud' | 'buffer_wait' | 'guardian_call' | 'live_call' | 'responder_alerted' | 'responder_enroute' | 'responder_arrived' | 'ambulance_dispatched' | 'handover_pending' | 'resolved' | 'cancelled'
  status: 'idle',
  fallTriggeredAt: null,
  activeStep: null, // 'loudAlarm' | 'memberWait' | 'guardianCall' | 'liveCall' | 'responder' | 'ambulance'
  stepRemainingSeconds: 0,
  speedMultiplier: 1, // 1 for normal, 3 for 3x fast demo
  monitoringEnabled: false,

  // Responder telemetry
  responderCoords: [17.3920, 78.4950],
  responderDistanceMeters: 1100,
  responderEtaSeconds: 180,
  responderOnline: true,
  responderAccepted: false,
  responderArrived: false,

  // Ambulance telemetry
  ambulanceDispatched: false,
  ambulanceCoords: [17.3760, 78.4780],
  ambulanceDistanceMeters: 2200,
  ambulanceEtaSeconds: 360,
  ambulanceArrived: false,

  // Handover OTP
  handoverOtp: null,
  handoverCompleted: false,

  // Guardian call state
  guardianCallState: 'idle', // 'idle' | 'calling' | 'answered' | 'missed'
  liveCallState: 'idle',     // 'idle' | 'calling' | 'connected' | 'ended'

  // Log of events
  timeline: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      message: 'Public demo online and standing by in the simulated area',
      status: 'info'
    }
  ]
};

class RealtimeSyncManager {
  constructor() {
    this.listeners = new Set();
    this.channel = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('rescue_help_incident_state_v1');
        localStorage.removeItem('rescue_help_user_phone');
      } catch (error) {
        console.error('Could not clear previous demo data from local storage:', error);
      }
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event && event.data) {
            this.notifyListeners(event.data);
          }
        };
      } catch {
        this.channel = null;
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners(parsed);
          } catch {
            // Ignored
          }
        }
      });
    }
  }

  getState() {
    if (typeof window === 'undefined') return INITIAL_INCIDENT_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...INITIAL_INCIDENT_STATE, ...JSON.parse(stored) };
      }
    } catch {
      // Ignored
    }
    return INITIAL_INCIDENT_STATE;
  }

  saveState(newState) {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(newState);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Ignored
    }

    if (this.channel) {
      try {
        this.channel.postMessage(newState);
      } catch {
        // Ignored
      }
    }
    this.notifyListeners(newState);
  }

  updateState(updater) {
    const current = this.getState();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    this.saveState(updated);
    return updated;
  }

  resetState() {
    const reset = {
      ...INITIAL_INCIDENT_STATE,
      timeline: [
        {
          id: `rst-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
          message: 'Demo scenario reset. System standing by in the simulated area.',
          status: 'info'
        }
      ]
    };
    this.saveState(reset);
    return reset;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(state) {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in sync listener', err);
      }
    });
  }
}

export const syncManager = new RealtimeSyncManager();
