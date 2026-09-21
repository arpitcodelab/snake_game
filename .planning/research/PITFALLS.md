# Pitfalls & Mitigations in HTML5 Canvas Snake Games

## 1. Input Lag & Self-Reversal Glitches
- **Problem**: In fast gameplay, if a player presses `Down` then `Left` quickly before the next game tick, the snake might attempt to move into its own body if only the last key is stored.
- **Mitigation**: Implement a FIFO queue of max 2 inputs. Each game tick only pops one direction, validating that it is not the exact opposite of the current direction.

## 2. Canvas Blurriness on High-DPI / Retina Displays
- **Problem**: Standard canvas dimensions (600x600) appear blurry on mobile phones and Retina monitors (`window.devicePixelRatio > 1`).
- **Mitigation**: Scale the internal canvas buffer by `devicePixelRatio` while keeping CSS display dimensions constant, applying `ctx.scale(dpr, dpr)`.

## 3. Mobile Touch & Scroll Interference
- **Problem**: Swiping to control the snake on mobile devices can trigger browser pull-to-refresh, page scrolling, or navigation gestures.
- **Mitigation**: Apply `touch-action: none;` on the canvas container and call `e.preventDefault()` on touch event listeners for the canvas and D-pad.

## 4. Web Audio Autoplay Policy
- **Problem**: Browsers block audio playback until user interaction (click or keypress).
- **Mitigation**: Audio context initialization and resume are deferred to the first user interaction (e.g. clicking "PLAY" on the Start Screen).

## 5. Spritesheet Alignment & Slicing
- **Problem**: Google Snake's `apple_types.png` contains multiple icons packed together. Slicing with hardcoded inaccurate offsets causes pixel clipping or misalignment.
- **Mitigation**: Inspect and verify exact sprite dimensions and padding in `apple_types.png` and `trophy_types.png` to map indices accurately.
