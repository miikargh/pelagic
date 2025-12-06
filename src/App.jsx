import React, { useState, useEffect, useRef } from 'react';
import { Musician } from './components/Musician';
import { Controls } from './components/Controls';
import { ChaosPanel } from './components/ChaosPanel';
import { Background } from './components/Background';
import { Musician as MusicianEngine, DEFAULT_ROOT, DEFAULT_MODE, PROGRESSIONS, DEFAULT_PROGRESSION, ROOTS, MODES } from './engine/OrchestraEngine';
import { ProgressionManager } from './engine/ProgressionManager';

const MUSICIAN_COUNT = 8;

function App() {
    const [isRunning, setIsRunning] = useState(false);
    
    // Settings State
    const [settings, setSettings] = useState({
        density: 0.02,
        blend: 0.5,        // 0.0 = Tone, 1.0 = Melody
        swellDuration: 6,  // Seconds
        melodyComplexity: 0.5,
        root: DEFAULT_ROOT,
        mode: DEFAULT_MODE,
        progression: DEFAULT_PROGRESSION,
        progressionSpeed: 1.0,
        activeStep: null // Injected by ProgressionManager
    });

    const [musicianStates, setMusicianStates] = useState(Array(MUSICIAN_COUNT).fill(false));

    // Visual State for Progression
    const [currentStepInfo, setCurrentStepInfo] = useState(null);

    // Refs for engine
    const musiciansRef = useRef([]);
    const audioCtxRef = useRef(null);
    const loopRef = useRef(null);
    const progressionManagerRef = useRef(null);
    
    // Ref for settings to access current values in animation loop
    const settingsRef = useRef(settings);
    useEffect(() => {
        settingsRef.current = settings;
        // Update progression manager if progression key changes
        if (progressionManagerRef.current) {
            if (settings.progression) {
                progressionManagerRef.current.setProgression(settings.progression);
            }
            progressionManagerRef.current.setSpeed(settings.progressionSpeed);
        }
    }, [settings]);

    // Initialize engine instances on mount
    useEffect(() => {
        musiciansRef.current = Array(MUSICIAN_COUNT).fill(null).map((_, i) => {
            // Initial note doesn't matter much now as play() picks from current scale
            // But we keep a dummy value for constructor
            return new MusicianEngine(i, 440, (id, isPlaying) => {
                setMusicianStates(prev => {
                    const next = [...prev];
                    next[id] = isPlaying;
                    return next;
                });
            });
        });

        // Initialize Progression Manager
        progressionManagerRef.current = new ProgressionManager(
            DEFAULT_PROGRESSION, 
            (step, index) => {
                // IMPORTANT: We must use functional state update to ensure we don't stale-close over 'settings'
                // BUT here we are setting specific fields.
                // Actually, setSettings accepts prev state.
                if (step) {
                    setSettings(prev => ({ ...prev, activeStep: step }));
                    setCurrentStepInfo({ index, ...step });
                } else {
                    setSettings(prev => ({ ...prev, activeStep: null }));
                    setCurrentStepInfo(null);
                }
            },
            PROGRESSIONS
        );

        return () => {
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
            musiciansRef.current.forEach(m => m.stopAll());
            if (audioCtxRef.current) audioCtxRef.current.close();
            if (progressionManagerRef.current) progressionManagerRef.current.stop();
        };
    }, []);

    const startOrchestra = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            
            const compressor = audioCtxRef.current.createDynamicsCompressor();
            compressor.connect(audioCtxRef.current.destination);
            
            musiciansRef.current.forEach(m => m.setContext(audioCtxRef.current));
        }

        // Mobile browser policy: resume explicitly and play silent buffer to unlock
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        // Play a silent buffer to verify/force audio unlock on iOS
        try {
            const buffer = audioCtxRef.current.createBuffer(1, 1, 22050);
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtxRef.current.destination);
            source.start(0);
        } catch (e) {
            console.warn("Audio unlock attempted", e);
        }

        setIsRunning(true);
        // progressionManagerRef check is moved to effect or updated there, 
        // but we should ensure it starts if we are resuming.
        // The ProgressionManager needs to know if it should run based on isRunning.
        // Actually, setIsRunning(true) triggers the effect which manages loop and musician stop,
        // but ProgressionManager is separate. Let's keep it here for now.
        if (progressionManagerRef.current) progressionManagerRef.current.start();
    };

    const stopOrchestra = () => {
        setIsRunning(false);
        if (progressionManagerRef.current) progressionManagerRef.current.stop();
    };

    // The Loop
    const loop = () => {
        if (!isRunning) return; // Should be caught by effect, but safety check
        
        musiciansRef.current.forEach(m => {
            m.decide(musiciansRef.current, settingsRef.current); 
        });

        loopRef.current = requestAnimationFrame(loop);
    };

    // Manage loop lifecycle
    // We use a ref to track if the loop is actually running to avoid duplicates
    const isLoopingRef = useRef(false);

    useEffect(() => {
        if (isRunning) {
            if (!isLoopingRef.current) {
                isLoopingRef.current = true;
                loop();
            }
        } else {
            isLoopingRef.current = false;
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
            musiciansRef.current.forEach(m => m.stopAll());
        }
        return () => {
            isLoopingRef.current = false;
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
        };
    }, [isRunning]);

    return (
        <div className="app">
            <Background settings={settings} isRunning={isRunning} />
            
            <header className="app-header">
                <h1>PELAGIC</h1>
            </header>

            <main className="app-main">
                <div id="orchestra" className="orchestra-container">
                    {musicianStates.map((playing, i) => (
                        <Musician key={i} isPlaying={playing} />
                    ))}
                </div>

                <Controls 
                    isRunning={isRunning}
                    onStart={startOrchestra}
                    onStop={stopOrchestra}
                />

                <ChaosPanel 
                    settings={settings} 
                    onSettingChange={setSettings} 
                />
            </main>

            <footer className="app-footer">
                <p className="description">
                    An aleatoric music experiment based on the "Tidal Orchestra" technique.
                    Musicians listen to their neighbors and play only when space allows, creating a natural, breathing soundscape.
                </p>
            </footer>
        </div>
    );
}

export default App;
