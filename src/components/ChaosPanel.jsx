import React from 'react';
import './ChaosPanel.css';

export function ChaosPanel({ settings, onSettingChange }) {
    const handleChange = (key, value) => {
        onSettingChange({ ...settings, [key]: parseFloat(value) });
    };

    return (
        <div className="chaos-panel">
            <h3>Chaos Controls</h3>
            
            <div className="control-group">
                <label>
                    Density (Probability)
                    <span className="value">{settings.density.toFixed(3)}</span>
                </label>
                <input 
                    type="range" 
                    min="0.001" 
                    max="0.1" 
                    step="0.001" 
                    value={settings.density} 
                    onChange={(e) => handleChange('density', e.target.value)}
                />
            </div>

            <div className="control-group">
                <label>
                    Blend (Tones vs Melodies)
                    <span className="value">{Math.round(settings.blend * 100)}% Melody</span>
                </label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={settings.blend} 
                    onChange={(e) => handleChange('blend', e.target.value)}
                />
                <div className="labels">
                    <span>Pure Tone</span>
                    <span>Mixed</span>
                    <span>Pure Melody</span>
                </div>
            </div>

            <div className="control-group">
                <label>
                    Swell Duration (Base)
                    <span className="value">{settings.swellDuration}s</span>
                </label>
                <input 
                    type="range" 
                    min="2" 
                    max="15" 
                    step="0.5" 
                    value={settings.swellDuration} 
                    onChange={(e) => handleChange('swellDuration', e.target.value)}
                />
            </div>

            <div className="control-group">
                <label>
                    Melody Complexity
                    <span className="value">{Math.round(settings.melodyComplexity * 100)}%</span>
                </label>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={settings.melodyComplexity} 
                    onChange={(e) => handleChange('melodyComplexity', e.target.value)}
                />
                <div className="labels">
                    <span>Simple</span>
                    <span>Complex</span>
                </div>
            </div>
        </div>
    );
}

