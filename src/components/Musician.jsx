import React from 'react';
import './Musician.css';

export function Musician({ isPlaying }) {
    return (
        <div className={`musician ${isPlaying ? 'playing' : ''}`} />
    );
}

