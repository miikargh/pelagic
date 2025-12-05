import React, { useEffect, useRef } from 'react';
import './Background.css';

export function Background({ settings, isRunning }) {
    const canvasRef = useRef(null);
    const gridRef = useRef([]);
    const animationRef = useRef(null);
    const frameCountRef = useRef(0);

    // Initialize Grid
    const initGrid = (cols, rows) => {
        const grid = new Array(cols).fill(null)
            .map(() => new Array(rows).fill(0));
        
        // Seed random state based on density setting
        // We amplify density a bit for visual interest since 0.02 is too sparse for GoL
        const seedDensity = Math.min(0.5, settings.density * 5); 
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = Math.random() < seedDensity ? 1 : 0;
            }
        }
        return grid;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-init grid on resize
            const cellSize = 20;
            const cols = Math.ceil(canvas.width / cellSize);
            const rows = Math.ceil(canvas.height / cellSize);
            gridRef.current = initGrid(cols, rows);
        };
        
        window.addEventListener('resize', resize);
        resize();

        // Animation Loop
        const loop = () => {
            if (!isRunning) {
                animationRef.current = requestAnimationFrame(loop);
                // Draw static or fading grid if paused?
                // For now, just let it freeze or drift slowly.
                // Let's drift slowly to show it's alive.
                if (frameCountRef.current % 10 === 0) {
                    draw(ctx, canvas.width, canvas.height);
                }
                frameCountRef.current++;
                return;
            }

            // Speed control: Use blend or complexity to control update speed?
            // Let's stick to a fixed reliable speed for now, maybe 10-15fps effective
            if (frameCountRef.current % 5 === 0) {
                updateGrid();
                draw(ctx, canvas.width, canvas.height);
            }
            
            frameCountRef.current++;
            animationRef.current = requestAnimationFrame(loop);
        };

        const updateGrid = () => {
            const grid = gridRef.current;
            if (!grid || grid.length === 0) return;
            
            const cols = grid.length;
            const rows = grid[0].length;
            const next = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

            // Wrap around edges? Yes, toroidal.
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const state = grid[i][j];
                    
                    // Count neighbors
                    let neighbors = 0;
                    for (let x = -1; x < 2; x++) {
                        for (let y = -1; y < 2; y++) {
                            if (x === 0 && y === 0) continue;
                            
                            const col = (i + x + cols) % cols;
                            const row = (j + y + rows) % rows;
                            neighbors += grid[col][row];
                        }
                    }

                    // Rules influenced by settings
                    // Standard GoL: Birth on 3, Survive on 2 or 3.
                    // Let's mod these slightly based on settings.
                    // Density -> higher density setting makes birth easier?
                    // Blend -> Tones (0) = Stable, Melodies (1) = Chaotic
                    
                    // Basic Rules
                    if (state === 0 && neighbors === 3) {
                        next[i][j] = 1;
                    } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                        next[i][j] = 0;
                    } else {
                        next[i][j] = state;
                    }

                    // Injection of chaos based on settings
                    // If density is high, randomly ignite dead cells
                    if (Math.random() < settings.density * 0.05) {
                        next[i][j] = 1;
                    }
                    // If complexity is high, randomly kill live cells (entropy)
                    if (settings.melodyComplexity > 0.8 && Math.random() < 0.001) {
                        next[i][j] = 0;
                    }
                }
            }
            gridRef.current = next;
        };

        const draw = (ctx, width, height) => {
            ctx.clearRect(0, 0, width, height);
            
            const grid = gridRef.current;
            if (!grid) return;

            const cellSize = 20;
            const cols = grid.length;
            const rows = grid[0].length;

            // Color based on blend
            // Tone (0) -> Blue/Teal
            // Melody (1) -> Purple/Pink?
            // Let's stick to the theme: #64ffda (Teal) to maybe something warmer?
            
            // Simple approach: opacity varies
            ctx.fillStyle = '#64ffda'; 

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    if (grid[i][j] === 1) {
                        const x = i * cellSize;
                        const y = j * cellSize;
                        
                        // Opacity based on life + blend
                        // We can make them fade out.
                        // For now, simple rects.
                        ctx.globalAlpha = 0.05 + (settings.blend * 0.05); 
                        ctx.beginPath();
                        ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/2 - 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        };

        animationRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [settings, isRunning]); // Re-init if settings drastically change? No, loop handles it.

    return <canvas ref={canvasRef} className="background-canvas" />;
}

