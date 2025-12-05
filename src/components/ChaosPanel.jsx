import React from 'react';
import './ChaosPanel.css';
import { ROOTS, MODES, PROGRESSIONS } from '../engine/OrchestraEngine';

const PRESETS = {
    zen: {
        name: "Zen",
        settings: {
            density: 0.008,
            blend: 0.1,
            swellDuration: 10,
            melodyComplexity: 0.2,
            progressionSpeed: 1.0
        }
    },
    active: {
        name: "Active",
        settings: {
            density: 0.05,
            blend: 0.7,
            swellDuration: 3,
            melodyComplexity: 0.6,
            progressionSpeed: 1.0
        }
    },
    chaos: {
        name: "Chaos",
        settings: {
            density: 0.08,
            blend: 0.9,
            swellDuration: 2,
            melodyComplexity: 0.9,
            progressionSpeed: 1.5
        }
    },
    deep: {
        name: "Deep",
        settings: {
            density: 0.015,
            blend: 0.0,
            swellDuration: 15,
            melodyComplexity: 0.0,
            progressionSpeed: 0.5
        }
    }
};

export function ChaosPanel({ settings, onSettingChange }) {
    const handleChange = (key, value) => {
        onSettingChange({ ...settings, [key]: parseFloat(value) });
    };

    const handleSelectChange = (key, value) => {
        onSettingChange({ ...settings, [key]: value });
    };

    const randomizeSettings = () => {
        onSettingChange({
            ...settings,
            density: 0.001 + Math.random() * 0.099,
            blend: Math.random(),
            swellDuration: 2 + Math.random() * 13,
            melodyComplexity: Math.random(),
            progressionSpeed: 0.1 + Math.random() * 4.9
        });
    };

    return (
        <div className="chaos-panel">
            <h3>Chaos Controls</h3>
            
            <div className="preset-section">
                <div className="preset-buttons">
                    {Object.entries(PRESETS).map(([key, preset]) => (
                        <button 
                            key={key} 
                            onClick={() => onSettingChange({ ...settings, ...preset.settings })}
                            className="preset-btn"
                            title={`Apply ${preset.name} preset`}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
                <button onClick={randomizeSettings} className="random-btn" title="Randomize Chaos Parameters">
                    🎲 Randomize
                </button>
            </div>
            
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

            <div className="control-group-row">
                <div className="control-group third">
                    <label>Root</label>
                    <select 
                        value={settings.root} 
                        onChange={(e) => handleSelectChange('root', e.target.value)}
                        className="scale-select"
                    >
                        {Object.keys(ROOTS).map((root) => (
                            <option key={root} value={root}>{root}</option>
                        ))}
                    </select>
                </div>
                <div className="control-group third">
                    <label>Mode</label>
                    <select 
                        value={settings.mode} 
                        onChange={(e) => handleSelectChange('mode', e.target.value)}
                        className="scale-select"
                        disabled={settings.progression !== 'static'}
                        style={{ opacity: settings.progression !== 'static' ? 0.5 : 1 }}
                    >
                        {Object.entries(MODES).map(([key, mode]) => (
                            <option key={key} value={key}>{mode.name}</option>
                        ))}
                    </select>
                </div>
                <div className="control-group third">
                    <label>Progression</label>
                    <select 
                        value={settings.progression} 
                        onChange={(e) => handleSelectChange('progression', e.target.value)}
                        className="scale-select"
                    >
                        {Object.entries(PROGRESSIONS).map(([key, prog]) => (
                            <option key={key} value={key}>{prog.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="control-group">
                <label>
                    Progression Speed
                    <span className="value">{settings.progressionSpeed.toFixed(1)}x</span>
                </label>
                <input 
                    type="range" 
                    min="0.1" 
                    max="5.0" 
                    step="0.1" 
                    value={settings.progressionSpeed} 
                    onChange={(e) => handleChange('progressionSpeed', e.target.value)}
                    disabled={settings.progression === 'static'}
                    style={{ opacity: settings.progression === 'static' ? 0.5 : 1 }}
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
