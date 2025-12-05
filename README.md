# Aleatoric Bloom Generator

A React-based web app demonstrating the "Tidal Orchestra" aleatoric music technique used by Hans Zimmer and Radiohead for *(ocean) bloom*.

## The Concept

The core rule creates complex, organic patterns:
> "Play a note only when your neighbor is silent."

This creates a natural ebb and flow, preventing all notes from triggering at once and ensuring a breathing, swelling soundscape.

## Chaos Controls

The app features real-time parameter manipulation:

- **Density**: Controls the probability that a musician will start playing when their space is clear. Low values result in sparse, meditative textures; high values create chaotic, dense clusters.
- **Blend**: Seamlessly mixes between long, swelling tones and short melodic motifs.
- **Swell Duration**: Sets the base length of the drone notes.
- **Melody Complexity**: Biases the selection of motifs towards simple steps or complex runs.

## Development

This project uses [Vite](https://vitejs.dev/) + [React](https://react.dev/).

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173` (or the port shown in terminal).

3. **Build for production**:
   ```bash
   npm run build
   ```
