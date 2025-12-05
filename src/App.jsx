import React, { useState, useEffect, useRef } from 'react';
import { Musician } from './components/Musician';
import { Controls } from './components/Controls';
import { ChaosPanel } from './components/ChaosPanel';
import { Musician as MusicianEngine, SCALE } from './engine/OrchestraEngine';

const MUSICIAN_COUNT = 8;

function App() {
    const [isRunning, setIsRunning] = useState(false);
    
    // Settings State
    const [settings, setSettings] = useState({
        density: 0.02,
        blend: 0.5,        // 0.0 = Tone, 1.0 = Melody
        swellDuration: 6,  // Seconds
        melodyComplexity: 0.5
    });
    
    // State for visual representation
    const [musicianStates, setMusicianStates] = useState(
        Array(MUSICIAN_COUNT).fill(false)
    );

    // Refs for engine
    const musiciansRef = useRef([]);
    const audioCtxRef = useRef(null);
    const loopRef = useRef(null);
    
    // Ref for settings to access current values in animation loop
    const settingsRef = useRef(settings);
    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    // Initialize engine instances on mount
    useEffect(() => {
        musiciansRef.current = Array(MUSICIAN_COUNT).fill(null).map((_, i) => {
            const note = SCALE[Math.floor(Math.random() * SCALE.length)];
            return new MusicianEngine(i, note, (id, isPlaying) => {
                setMusicianStates(prev => {
                    const next = [...prev];
                    next[id] = isPlaying;
                    return next;
                });
            });
        });

        return () => {
            if (loopRef.current) cancelAnimationFrame(loopRef.current);
            musiciansRef.current.forEach(m => m.stopAll());
            if (audioCtxRef.current) audioCtxRef.current.close();
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

        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        setIsRunning(true);
    };

    const stopOrchestra = () => {
        setIsRunning(false);
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
            <h1>(OCEAN) BLOOM GENERATOR</h1>
            <p className="description">
                An aleatoric music experiment based on the "Tidal Orchestra" technique.
                Musicians listen to their neighbors and play only when space allows, creating a natural, breathing soundscape.
            </p>

            <div id="orchestra" style={{
                display: 'flex',
                gap: '15px',
                padding: '40px',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
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
        </div>
    );
}

export default App;
