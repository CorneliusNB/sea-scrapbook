/**
 * Procedural Web Audio Engine for Sea Anniversary app
 * Synthesizes:
 * 1. Warm ocean wave tides using LFO-modulated lowpass filtered noise.
 * 2. Gentle pentatonic backdrop music (soothing FM or soft sine bell notes).
 * 3. High-frequency starry/starfish sea chimes.
 * 4. Micro bubble popping synthesizer effects.
 */

class OceanAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isPlaying = false;

  // Nodes for Tides/Waves
  private waveBufferSource: AudioBufferSourceNode | null = null;
  private waveGain: GainNode | null = null;
  private waveFilter: BiquadFilterNode | null = null;
  private waveLfo: OscillatorNode | null = null;

  // Melody & Arpeggio scheduler
  private melodyGain: GainNode | null = null;
  private melodyTimerId: any = null;
  private scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]; // Pentatonic C
  private synthType: 'sine' | 'triangle' | 'sine-delayed' = 'sine';
  private tempoSecs = 3.5;

  // General Synth Settings
  private volumes = {
    ambient: 0.25,
    melody: 0.15,
    chime: 0.35,
    bell: 0.40,
  };

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      // Create master and gain nodes
      this.setupWaveEngine();
      this.setupMelodyEngine();
      
      this.isInitialized = true;
    } catch (e) {
      console.error('Failed to initialize local Web Audio engine:', e);
    }
  }

  private setupWaveEngine() {
    if (!this.ctx) return;

    // 1. Generate White Noise buffer
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.waveBufferSource = this.ctx.createBufferSource();
    this.waveBufferSource.buffer = buffer;
    this.waveBufferSource.loop = true;

    // 2. Wave lowpass filter
    this.waveFilter = this.ctx.createBiquadFilter();
    this.waveFilter.type = 'lowpass';
    this.waveFilter.Q.value = 1.2;

    // Modulate lowpass frequency with an LFO to match standard breathing sea waves
    this.waveLfo = this.ctx.createOscillator();
    this.waveLfo.frequency.value = 0.08; // LFO sweeps filter frequency every ~12.5 seconds (sea waves)
    this.waveLfo.type = 'sine';

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 400; // Sweep of +/- 400Hz

    // Set base cutoff
    this.waveFilter.frequency.value = 450; 

    // Connections for lowpass LFO
    this.waveLfo.connect(lfoGain);
    if (this.waveFilter && this.waveFilter.frequency) {
      lfoGain.connect(this.waveFilter.frequency);
    }

    // 3. Ambient Wave Gain
    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.value = this.volumes.ambient;

    // Construct the wave audio signal path
    this.waveBufferSource.connect(this.waveFilter);
    this.waveFilter.connect(this.waveGain);
    this.waveGain.connect(this.ctx.destination);
  }

  private setupMelodyEngine() {
    if (!this.ctx) return;
    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = this.volumes.melody;
    this.melodyGain.connect(this.ctx.destination);
  }

  // Starts general playback
  start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    try {
      // Start Wave playback & Wave LFO
      this.waveBufferSource?.start();
      this.waveLfo?.start();
    } catch (e) {
      // If already started, we just rebuild the buffer source to avoid errors
      this.rebuildWaveSource();
      this.waveBufferSource?.start();
    }

    this.isPlaying = true;
    this.startMelodyAutomation();
  }

  private rebuildWaveSource() {
    if (!this.ctx || !this.waveFilter || !this.waveGain) return;
    
    // We recreate the buffer source since they can only be started once per Web Audio API spec
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.waveBufferSource = this.ctx.createBufferSource();
    this.waveBufferSource.buffer = buffer;
    this.waveBufferSource.loop = true;
    this.waveBufferSource.connect(this.waveFilter);
  }

  stop() {
    if (!this.isPlaying) return;
    
    try {
      this.waveBufferSource?.stop();
    } catch(err) {}
    
    this.isPlaying = false;
    this.stopMelodyAutomation();
  }

  setVolumes(volumes: { ambient?: number; melody?: number; chime?: number; bell?: number }) {
    if (volumes.ambient !== undefined) {
      this.volumes.ambient = volumes.ambient;
      if (this.waveGain && this.ctx) {
        this.waveGain.gain.setValueAtTime(volumes.ambient, this.ctx.currentTime);
      }
    }
    if (volumes.melody !== undefined) {
      this.volumes.melody = volumes.melody;
      if (this.melodyGain && this.ctx) {
        this.melodyGain.gain.setValueAtTime(volumes.melody, this.ctx.currentTime);
      }
    }
    if (volumes.chime !== undefined) {
      this.volumes.chime = volumes.chime;
    }
    if (volumes.bell !== undefined) {
      this.volumes.bell = volumes.bell;
    }
  }

  setSynthType(type: 'sine' | 'triangle' | 'sine-delayed') {
    this.synthType = type;
  }

  setTempo(tempoSecs: number) {
    this.tempoSecs = Math.max(1, Math.min(10, tempoSecs));
    if (this.isPlaying) {
      this.stopMelodyAutomation();
      this.startMelodyAutomation();
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getSettings() {
    return {
      ambientVolume: this.volumes.ambient,
      melodyVolume: this.volumes.melody,
      bellVolume: this.volumes.bell,
      chimeVolume: this.volumes.chime,
      synthType: this.synthType,
      tempoSecs: this.tempoSecs,
    };
  }

  // Automatic ambient chordal melodies matching the tide
  private startMelodyAutomation() {
    this.stopMelodyAutomation();
    
    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx || !this.melodyGain) return;

      // Select a sweet emotional random sound in the scale
      const randomFreq = this.scale[Math.floor(Math.random() * this.scale.length)];
      this.triggerSynthNote(randomFreq);

      // Sched next note with slight organic deviance (up to +/- 20%)
      const dynamicInterval = this.tempoSecs * (0.9 + Math.random() * 0.2) * 1000;
      this.melodyTimerId = setTimeout(playNextNote, dynamicInterval);
    };

    // Begin loop
    this.melodyTimerId = setTimeout(playNextNote, 1000);
  }

  private stopMelodyAutomation() {
    if (this.melodyTimerId) {
      clearTimeout(this.melodyTimerId);
      this.melodyTimerId = null;
    }
  }

  private triggerSynthNote(frequency: number) {
    if (!this.ctx || !this.melodyGain) return;

    const now = this.ctx.currentTime;
    
    // Core soft synth osc
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    // Customize timbre style
    if (this.synthType === 'sine-delayed') {
      osc.type = 'sine';
    } else {
      osc.type = this.synthType;
    }

    osc.frequency.value = frequency;

    // Slow sweet attack, nice warm decay
    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(this.volumes.melody, now + 0.5); // Warm attack
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0); // Gentle ring out

    // Delay echo effect for "sine-delayed"
    if (this.synthType === 'sine-delayed') {
      const delay = this.ctx.createDelay();
      const feedback = this.ctx.createGain();

      delay.delayTime.value = 0.35; // Delay echo rate
      feedback.gain.value = 0.45; // 45% echo decay

      osc.connect(oscGain);
      oscGain.connect(this.melodyGain);

      // Route through delay line too
      oscGain.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay); // Loop back
      feedback.connect(this.melodyGain);
    } else {
      osc.connect(oscGain);
      oscGain.connect(this.melodyGain);
    }

    osc.start(now);
    osc.stop(now + 4.0);
  }

  // Play micro bubble popping sounds (on bubble interaction)
  triggerBubblePop() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Bubble popping starts at medium frequency and shoots up fast (sounds like a plonk)
    const baseFreq = 220 + Math.random() * 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + 0.12);

    filter.type = 'bandpass';
    filter.Q.value = 8;
    filter.frequency.setValueAtTime(baseFreq * 1.5, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volumes.bell, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Play random starry chimes
  triggerStarfishChime() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    // Play multiple crystalline high frequencies to simulate magical wind-chimes
    const pitches = [1200, 1500, 1800, 2200];
    const chimeDest = this.ctx.createGain();
    chimeDest.gain.setValueAtTime(this.volumes.chime, now);
    chimeDest.connect(this.ctx.destination);

    pitches.forEach((freq, idx) => {
      // stagger notes slightly
      const delay = idx * 0.05 + (Math.random() * 0.02);
      const osc = this.ctx?.createOscillator();
      const gain = this.ctx?.createGain();

      if (!osc || !gain) return;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(this.volumes.chime * 0.4, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

      osc.connect(gain);
      gain.connect(chimeDest);

      osc.start(now + delay);
      osc.stop(now + delay + 1.5);
    });
  }
}

export const oceanAudio = new OceanAudioEngine();
