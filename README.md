# Aleatoric Bloom Generator

A pure frontend implementation of the "Tidal Orchestra" technique used by Hans Zimmer and Radiohead for *(ocean) bloom*.

## The Concept

The core rule creates complex, organic patterns:
> "Play a note only when your neighbor is silent."

This creates a natural ebb and flow, preventing all notes from triggering at once and ensuring a breathing, swelling soundscape.

## Modes

1. **Swelling Tones**: The original behavior. Musicians play single, long, swelling notes that fade in and out.
2. **Short Melodies**: Musicians play short, predefined motifs from a shared scale (G Major Pentatonic). These motifs are layered using the same "neighbor silence" rule, ensuring they interlock organically without clashing.

## How to Run

Since this is a static site, you can run it in two ways:

1. **Directly**: Double-click `index.html` to open it in your browser.
2. **Simple Server**:
   ```bash
   python3 -m http.server
   ```
   Then visit `http://localhost:8000`.
