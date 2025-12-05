import React from 'react';
import './Controls.css';
import { MODES } from '../engine/OrchestraEngine';

export function Controls({ isRunning, onStart, onStop, currentStepInfo }) {
    return (
        <div className="controls-wrapper">
            <div className={`progression-status ${currentStepInfo ? 'active' : 'inactive'}`}>
                {currentStepInfo ? (
                    <>
                        <span className="label">Active Chord:</span>
                        <span className="chord">
                            Offset +{currentStepInfo.rootOffset} ({MODES[currentStepInfo.mode].name})
                        </span>
                    </>
                ) : (
                    <span>&nbsp;</span>
                )}
            </div>
            
            <div className="controls">
                {!isRunning ? (
                    <button className="btn-start" onClick={onStart}>
                        Play
                    </button>
                ) : (
                    <button className="btn-stop" onClick={onStop}>
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
}
