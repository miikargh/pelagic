import React from 'react';
import './Controls.css';

export function Controls({ isRunning, onStart, onStop }) {
    return (
        <div className="controls">
            {!isRunning ? (
                <button className="btn-start" onClick={onStart}>
                    Initialize Orchestra
                </button>
            ) : (
                <button className="btn-stop" onClick={onStop}>
                    Stop
                </button>
            )}
        </div>
    );
}
