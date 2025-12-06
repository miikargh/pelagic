import React from 'react';
import './Controls.css';

export function Controls({ isRunning, onStart, onStop }) {
    return (
        <div className="controls-wrapper">
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
