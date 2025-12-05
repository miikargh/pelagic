// G Major Pentatonic / ish
export const SCALE = [
    196.00, // G3
    220.00, // A3
    246.94, // B3
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    587.33, // D5
    659.25  // E5
];

// Motifs with complexity ratings (0.0 - 1.0)
// notes: array of {n: scaleIndex, d: duration}
export const MOTIFS = [
    { complexity: 0.1, notes: [{n: 3, d: 0.5}, {n: 3, d: 0.5}, {n: 3, d: 2.0}] },   // Repeated note
    { complexity: 0.2, notes: [{n: 1, d: 1.0}, {n: 2, d: 1.0}] },                   // Simple step
    { complexity: 0.3, notes: [{n: 2, d: 0.5}, {n: 4, d: 0.5}, {n: 2, d: 2.0}] },   // Neighbor tone
    { complexity: 0.4, notes: [{n: 4, d: 1.0}, {n: 7, d: 2.0}] },                   // Octave leap-ish
    { complexity: 0.6, notes: [{n: 0, d: 0.5}, {n: 2, d: 0.5}, {n: 4, d: 2.0}] },   // Ascending triad
    { complexity: 0.6, notes: [{n: 5, d: 0.5}, {n: 3, d: 0.5}, {n: 1, d: 2.0}] },   // Descending
    { complexity: 0.9, notes: [{n: 0, d: 0.25}, {n: 1, d: 0.25}, {n: 2, d: 0.25}, {n: 3, d: 2.25}] }, // Run
];

export class Musician {
    constructor(id, freq, onStateChange) {
        this.id = id;
        this.baseFreq = freq;
        this.onStateChange = onStateChange; // Callback to update React state
        this.isPlaying = false;
        this.activeNodes = []; 
        this.timer = null;
        this.audioCtx = null;
    }

    setContext(ctx) {
        this.audioCtx = ctx;
    }

    // Check neighbors and decide whether to play
    // settings: { density, blend, swellDuration, melodyComplexity }
    decide(neighbors, settings) {
        if (this.isPlaying || !this.audioCtx) return;

        // neighbors is an array of Musician instances
        const left = neighbors[this.id - 1];
        const right = neighbors[this.id + 1];

        const leftSilent = !left || !left.isPlaying;
        const rightSilent = !right || !right.isPlaying;

        if (leftSilent && rightSilent) {
            // Use density setting for probability
            if (Math.random() < settings.density) { 
                this.play(settings);
            }
        }
    }

    stopAll() {
        this.activeNodes.forEach(node => node.stop());
        this.activeNodes = [];
        if (this.timer) clearTimeout(this.timer);
        this.setIsPlaying(false);
    }

    setIsPlaying(playing) {
        this.isPlaying = playing;
        this.onStateChange(this.id, playing);
    }

    play(settings) {
        if (!this.audioCtx) return;
        
        this.setIsPlaying(true);

        // Blend: 0 = Tones, 1 = Melodies
        if (Math.random() < settings.blend) {
            this.playMelody(settings);
        } else {
            this.playTone(settings);
        }
    }

    playTone(settings) {
        const t = this.audioCtx.currentTime;
        // Base duration on setting, add some randomness
        const baseDur = settings.swellDuration;
        const duration = baseDur + Math.random() * (baseDur * 0.5); 
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        const detune = (Math.random() - 0.5) * 10;
        osc.frequency.setValueAtTime(this.baseFreq, t);
        osc.detune.setValueAtTime(detune, t);

        gain.gain.setValueAtTime(0, t);
        const attackTime = duration * 0.4;
        gain.gain.linearRampToValueAtTime(0.15, t + attackTime);
        gain.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(t);
        osc.stop(t + duration);

        this.activeNodes.push({ stop: () => {
            try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){}
        }});

        this.timer = setTimeout(() => {
            this.finish();
        }, duration * 1000);
    }

    playMelody(settings) {
        const t = this.audioCtx.currentTime;
        
        // Filter or weight motifs based on complexity
        // Simple approach: Pick a motif that is "close" to the target complexity
        // We'll score them by distance to settings.melodyComplexity
        
        const targetComplexity = settings.melodyComplexity;
        
        // Weighted random selection favoring closer complexity
        // We'll pick 2 random candidates and choose the one closer to target
        const candidate1 = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
        const candidate2 = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
        
        const dist1 = Math.abs(candidate1.complexity - targetComplexity);
        const dist2 = Math.abs(candidate2.complexity - targetComplexity);
        
        const motifObj = dist1 < dist2 ? candidate1 : candidate2;
        const motif = motifObj.notes;

        const shift = Math.floor(Math.random() * 3); 

        let totalDuration = 0;
        
        motif.forEach((noteDef) => {
            const noteIndex = (noteDef.n + shift) % SCALE.length;
            const freq = SCALE[noteIndex];
            const noteStart = t + totalDuration;
            const noteDur = noteDef.d;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);
            
            gain.gain.setValueAtTime(0, noteStart);
            gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.1);
            gain.gain.linearRampToValueAtTime(0, noteStart + noteDur - 0.05);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start(noteStart);
            osc.stop(noteStart + noteDur);

            this.activeNodes.push({ stop: () => {
                    try { osc.stop(); osc.disconnect(); gain.disconnect(); } catch(e){}
            }});

            totalDuration += noteDur;
        });

        this.timer = setTimeout(() => {
            this.finish();
        }, totalDuration * 1000);
    }

    finish() {
        this.setIsPlaying(false);
        this.activeNodes = [];
        this.timer = null;
    }
}
