# Cursor Drone Guide

This document explains how the cursor-follow quadcopter works and how to evolve it as a reusable package component.

## File Map

- Behavior and rendering: `packages/react/src/CursorDrone/CursorDrone.tsx`
- Toggle control: `packages/react/src/CursorDrone/DroneFollowToggle.tsx`
- Visual DOM layers: `packages/react/src/CursorDrone/Quadcopter.tsx`
- Visual styling: `packages/react/src/styles.css`
- Shared state helpers: `packages/react/src/CursorDrone/state.ts`
- DOM/text helpers: `packages/react/src/utils/dom.ts`

## What The Drone Is

The quadcopter is not an image and not an SVG asset. It is a DOM component made from layered `div`s:

- body, nose, camera
- 2 arms
- 4 rotor shells
- propeller strips inside rotor spin wrappers
- scan cone

All visuals come from CSS gradients, borders, transforms, shadows, and CSS variables.

## Motion System

`CursorDrone` uses a pointer target, spring smoothing, and per-frame updates.

1. Pointer target:
   - pointer movement updates `targetPosition`
   - `pointerX` and `pointerY` MotionValues are updated

2. Smoothing:
   - `useSpring(pointerX)` and `useSpring(pointerY)` create smooth lagging movement

3. Frame loop:
   - `requestAnimationFrame` computes velocity, distance to target, desired bank/pitch/heading, rotor speed, and spin angle
   - values are written to CSS vars:
     - `--domcraft-rotor-angle`
     - `--domcraft-rotor-angle-reverse`
     - `--domcraft-drone-bank`
     - `--domcraft-drone-pitch`
     - `--domcraft-drone-heading`

4. Phase classes:
   - `idle`
   - `active`
   - `settling`

The phase classes tune glow, blur, propeller width, and scan cone opacity.

## Controls And State Sync

The package supports:

- uncontrolled state
- controlled `enabled` prop
- `defaultEnabled`
- optional localStorage persistence
- optional `Ctrl+D` keyboard shortcut
- optional `DroneFollowToggle`

The shared event is `domcraft-cursor-drone-toggle`. Do not dispatch the event from inside a React state updater callback.

## Text-Aware Transparency

To keep content readable, the drone opacity changes when it overlaps visible text-bearing elements.

Default selector:

```txt
main :is(h1, h2, h3, h4, p, a, button, li, span, kbd, dt, dd, label, small)
```

Defaults:

- normal opacity: `0.7`
- over text: `0.25`
- footprint: based on the configured `size`

## Public Customization

Props to preserve and polish:

- `size`
- `zIndex`
- `opacity`
- `opacityOverText`
- `textAware`
- `readableContentSelector`
- `persist`
- `storageKey`
- `keyboardShortcut`
- `motionIntensity`
- `enabled`
- `defaultEnabled`
- `onEnabledChange`

CSS variables to preserve and expand:

- `--domcraft-drone-accent`
- `--domcraft-drone-body-light`
- `--domcraft-drone-body-mid`
- `--domcraft-drone-body-dark`

## Safe Update Checklist

When changing behavior:

1. Keep controlled and uncontrolled state paths working.
2. Keep keyboard and toggle paths in sync.
3. Keep localStorage optional.
4. Keep browser APIs inside effects or guarded helpers.
5. Run typecheck/build.
6. Visually verify movement, toggle, fade-over-text, and reduced motion.

## Common Pitfalls

- Dispatching sync events inside state updaters.
- Making rotor shell and propeller layer both rotate.
- Letting glow/blur wash over readable text.
- Reintroducing Tailwind-only styling into the package.
- Adding Next.js assumptions to the package.
