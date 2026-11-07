/**
 * Procedural Web Audio API sound synthesizer
 * 100% procedural with zero external audio assets
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: number | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;

    this.ctx = new AudioCtxClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  private resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  // Gunshot sound (Pulse Rifle)
  public playRifleShot() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Plasma shot sound
  public playPlasmaShot() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.16);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.17);
  }

  // Celestial Railgun (Massive futuristic discharge)
  public playRailgunShot() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // High laser charge + sub bass impact
    const oscHigh = this.ctx.createOscillator();
    const gainHigh = this.ctx.createGain();
    oscHigh.type = 'sawtooth';
    oscHigh.frequency.setValueAtTime(1600, t);
    oscHigh.frequency.exponentialRampToValueAtTime(300, t + 0.35);
    gainHigh.gain.setValueAtTime(0.6, t);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    const oscBass = this.ctx.createOscillator();
    const gainBass = this.ctx.createGain();
    oscBass.type = 'triangle';
    oscBass.frequency.setValueAtTime(140, t);
    oscBass.frequency.exponentialRampToValueAtTime(35, t + 0.5);
    gainBass.gain.setValueAtTime(0.7, t);
    gainBass.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    oscHigh.connect(gainHigh);
    gainHigh.connect(this.sfxGain);
    oscBass.connect(gainBass);
    gainBass.connect(this.sfxGain);

    oscHigh.start(t);
    oscHigh.stop(t + 0.36);
    oscBass.start(t);
    oscBass.stop(t + 0.52);
  }

  // Hitmarker sound (crisp tick)
  public playHitmarker() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.setValueAtTime(1800, t + 0.02);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Headshot Ding (Satisfying bell chime)
  public playHeadshot() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2637, t); // E7 note
    osc.frequency.setValueAtTime(3135, t + 0.05); // G7 note

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Kill notification sound
  public playKillSound() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.05);
      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.22);
    });
  }

  // Jump pad launch
  public playJumpPad() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Reload sound
  public playReload() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Click 1 (eject)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(900, t);
    gain1.gain.setValueAtTime(0.18, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.09);

    // Click 2 (lock in)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, t + 0.28);
    gain2.gain.setValueAtTime(0.22, t + 0.28);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.38);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.28);
    osc2.stop(t + 0.4);
  }

  // Roulette tick
  public playRouletteTick(pitch: number = 1.0) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 * pitch, t);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Purchase & unlock fanfare
  public playPurchaseSuccess() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.3, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.42);
    });
  }

  // Background Cyber Combat Music (Ambient rhythmic procedural synth)
  public startAmbientMusic() {
    if (this.musicPlaying) return;
    this.resume();
    this.musicPlaying = true;
    let step = 0;
    const notes = [110, 110, 130.81, 146.83, 110, 98, 110, 164.81]; // Bass synth line

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const freq = notes[step % notes.length];
      step++;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.Q.setValueAtTime(4, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.2);
    }, 240);
  }

  public stopAmbientMusic() {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
