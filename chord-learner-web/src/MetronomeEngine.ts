export class MetronomeEngine {
    audioCtx: AudioContext | null = null;
    bpm: number = 120;
    isPlaying: boolean = false;
    nextNoteTime: number = 0;
    currentBeat: number = 0;
    beatsPerMeasure: number = 4;
    scheduleAheadTime: number = 0.1;
    lookahead: number = 25;
    timerID: number | null = null;
    
    onBeat: ((beat: number) => void) | null = null;
  
    private _init() {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    }
  
    private _scheduleNote(beat: number, time: number) {
      if (!this.audioCtx) return;
      
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      const isAccent = beat === 0;
      osc.frequency.value = isAccent ? 1000 : 800;
      
      gainNode.gain.setValueAtTime(isAccent ? 0.8 : 0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      
      osc.start(time);
      osc.stop(time + 0.08);
      
      const delay = (time - this.audioCtx.currentTime) * 1000;
      setTimeout(() => {
        if (this.onBeat) this.onBeat(beat);
      }, delay);
    }
  
    private _scheduler() {
      if (!this.audioCtx) return;
      
      while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
        this._scheduleNote(this.currentBeat, this.nextNoteTime);
        this.nextNoteTime += 60 / this.bpm;
        this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
      }
      this.timerID = window.setTimeout(() => this._scheduler(), this.lookahead);
    }
  
    start() {
      this._init();
      if (this.audioCtx?.state === 'suspended') this.audioCtx.resume();
      this.isPlaying = true;
      this.currentBeat = 0;
      this.nextNoteTime = this.audioCtx!.currentTime + 0.05;
      this._scheduler();
    }
  
    stop() {
      this.isPlaying = false;
      if (this.timerID) clearTimeout(this.timerID);
    }
  
    setBPM(b: number) { this.bpm = b; }
    setBeats(b: number) { this.beatsPerMeasure = b; this.currentBeat = 0; }
  }