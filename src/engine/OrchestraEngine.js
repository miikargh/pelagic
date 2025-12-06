export const ROOTS = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00,
    'A': 440.00,
    'B': 493.88
};

export const MODES = {
    'major_pentatonic': {
        name: 'Major Pentatonic',
        intervals: [0, 2, 4, 7, 9] // Semitones
    },
    'minor_pentatonic': {
        name: 'Minor Pentatonic',
        intervals: [0, 3, 5, 7, 10]
    },
    'whole_tone': {
        name: 'Whole Tone',
        intervals: [0, 2, 4, 6, 8, 10]
    },
    'lydian': {
        name: 'Lydian',
        intervals: [0, 2, 4, 6, 7, 9, 11]
    },
    'hirajoshi': {
        name: 'Hirajoshi',
        intervals: [0, 2, 3, 7, 8]
    },
    'dorian': {
        name: 'Dorian',
        intervals: [0, 2, 3, 5, 7, 9, 10]
    }
};

// Progression Definitions
// Steps are relative to the current root
export const PROGRESSIONS = {
    'static': {
        name: 'Static (No Change)',
        steps: [
            { rootOffset: 0, mode: 'major_pentatonic', duration: 10 }
        ]
    },
    'emotional_journey': {
        name: 'Emotional Journey',
        steps: [
            { rootOffset: 0, mode: 'major_pentatonic', duration: 15 }, // I
            { rootOffset: 5, mode: 'major_pentatonic', duration: 15 }, // IV
            { rootOffset: 7, mode: 'major_pentatonic', duration: 15 }, // V
            { rootOffset: 0, mode: 'major_pentatonic', duration: 15 }  // I
        ]
    },
    'dark_descent': {
        name: 'Dark Descent',
        steps: [
            { rootOffset: 0, mode: 'minor_pentatonic', duration: 20 }, // i
            { rootOffset: 3, mode: 'major_pentatonic', duration: 20 }, // III
            { rootOffset: 7, mode: 'minor_pentatonic', duration: 20 }, // v
            { rootOffset: 8, mode: 'lydian', duration: 20 }            // VI (Lydian twist)
        ]
    },
    'dream_cycle': {
        name: 'Dream Cycle',
        steps: [
            { rootOffset: 0, mode: 'whole_tone', duration: 20 },
            { rootOffset: 2, mode: 'lydian', duration: 20 },
            { rootOffset: 4, mode: 'whole_tone', duration: 20 }
        ]
    }
};

export const DEFAULT_PROGRESSION = 'static';

// Helper to generate frequencies for a scale
// Spans 2 octaves
function generateScale(rootFreq, modeKey) {
    const intervals = MODES[modeKey].intervals;
    const scale = [];
    
    // Base Octave
    intervals.forEach(semitone => {
        scale.push(rootFreq * Math.pow(2, semitone / 12));
    });
    
    // Lower Octave (0.5x)
    intervals.forEach(semitone => {
        scale.unshift((rootFreq * 0.5) * Math.pow(2, semitone / 12));
    });

    // Sort just in case
    return scale.sort((a, b) => a - b);
}

// Helper: Calculate frequency from root name + semitone offset
function getFreqFromRootOffset(baseRootName, semitoneOffset) {
    const baseFreq = ROOTS[baseRootName];
    return baseFreq * Math.pow(2, semitoneOffset / 12);
}

export const DEFAULT_ROOT = 'G';
export const DEFAULT_MODE = 'major_pentatonic';

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
        this.baseFreq = freq; // Deprecated: We now look up note from scale dynamically
        this.onStateChange = onStateChange; 
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
        // Add larger lookahead (100ms) for mobile stability
        const t = this.audioCtx.currentTime + 0.1;
        const baseDur = settings.swellDuration;
        const duration = baseDur + Math.random() * (baseDur * 0.5); 
        
        // Determine scale based on active progression step override or manual settings
        let rootFreq = ROOTS[settings.root || DEFAULT_ROOT];
        let modeKey = settings.mode || DEFAULT_MODE;

        if (settings.activeStep) {
            // activeStep contains: { rootOffset, mode }
            // We calculate new root based on settings.root + offset
            rootFreq = getFreqFromRootOffset(settings.root || DEFAULT_ROOT, settings.activeStep.rootOffset);
            modeKey = settings.activeStep.mode;
        }

        const notes = generateScale(rootFreq, modeKey);

        // Pick a random note
        const freq = notes[Math.floor(Math.random() * notes.length)];

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        const detune = (Math.random() - 0.5) * 10;
        osc.frequency.setValueAtTime(freq, t);
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
        // Add larger lookahead (100ms) for mobile stability
        const t = this.audioCtx.currentTime + 0.1;
        
        // Determine scale based on active progression step override or manual settings
        let rootFreq = ROOTS[settings.root || DEFAULT_ROOT];
        let modeKey = settings.mode || DEFAULT_MODE;

        if (settings.activeStep) {
            rootFreq = getFreqFromRootOffset(settings.root || DEFAULT_ROOT, settings.activeStep.rootOffset);
            modeKey = settings.activeStep.mode;
        }

        const notes = generateScale(rootFreq, modeKey);

        // Filter or weight motifs based on complexity
        const targetComplexity = settings.melodyComplexity;
        const candidate1 = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
        const candidate2 = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
        
        const dist1 = Math.abs(candidate1.complexity - targetComplexity);
        const dist2 = Math.abs(candidate2.complexity - targetComplexity);
        
        const motifObj = dist1 < dist2 ? candidate1 : candidate2;
        const motif = motifObj.notes;

        const shift = Math.floor(Math.random() * 3); 

        let totalDuration = 0;
        
        motif.forEach((noteDef) => {
            // Map motif index to current scale
            const noteIndex = (noteDef.n + shift) % notes.length;
            const freq = notes[noteIndex];
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
