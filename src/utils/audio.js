// Real Browser Web Audio API & Vibration Synthesizer

class AudioManager {
  constructor() {
    this.ctx = null;
    this.sirenInterval = null;
    this.ringInterval = null;
  }

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single tone
  playTone(freq, type = 'sine', duration = 0.2, volume = 0.15) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio playback silently suppressed if blocked by browser policy
    }
  }

  // Start continuous loud emergency siren (used during member alarm buffer)
  startEmergencySiren() {
    this.stopEmergencySiren();
    let toggle = false;
    const playStep = () => {
      this.playTone(toggle ? 920 : 640, 'sawtooth', 0.28, 0.25);
      toggle = !toggle;
    };
    playStep();
    this.sirenInterval = setInterval(playStep, 320);

    // Trigger physical phone vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800]);
      } catch {
        // Ignored
      }
    }
  }

  stopEmergencySiren() {
    const wasRunning = Boolean(this.sirenInterval);
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (wasRunning && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch {
        // Ignored
      }
    }
  }

  // Start telephone ring tone (used when calling Guardian / Live Talk)
  startPhoneRinging() {
    this.stopPhoneRinging();
    const playRingBurst = () => {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        // Dual-tone ringing (400 Hz + 450 Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.value = 400;
        osc2.frequency.value = 450;

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.5);
        osc2.stop(ctx.currentTime + 1.5);
      } catch {
        // Ignored
      }
    };

    playRingBurst();
    this.ringInterval = setInterval(playRingBurst, 3500);
  }

  stopPhoneRinging() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Chime for notifications
  playAlertChime() {
    this.playTone(523.25, 'triangle', 0.12, 0.15); // C5
    setTimeout(() => {
      this.playTone(659.25, 'triangle', 0.18, 0.18); // E5
    }, 120);
    setTimeout(() => {
      this.playTone(783.99, 'triangle', 0.35, 0.2); // G5
    }, 240);
  }

  // Success chime on resolved or OTP match
  playSuccessChime() {
    this.playTone(587.33, 'sine', 0.12, 0.12);
    setTimeout(() => {
      this.playTone(880, 'sine', 0.3, 0.15);
    }, 140);
  }

  stopAll() {
    this.stopEmergencySiren();
    this.stopPhoneRinging();
  }
}

export const audioManager = new AudioManager();
