# Domcraft

DOM-built animated components for React.

This repo starts with a cursor-following quadcopter extracted from `drone-ai-web`. The drone is not an image, canvas, or SVG asset. It is a layered DOM component styled with CSS gradients, borders, transforms, shadows, and CSS variables.

## Current Package

```tsx
import { CursorDrone, DroneFollowToggle } from "@domcraft/react";
import "@domcraft/react/styles.css";

export function Page() {
  return (
    <>
      <CursorDrone />
      <DroneFollowToggle />
      <main>...</main>
    </>
  );
}
```

## Local Development Target

This folder is intentionally a starter repo. The next Codex session should:

1. Install dependencies.
2. Run typecheck/build.
3. Add a docs/demo app.
4. Polish package exports.
5. Publish as an open-source component library.

See:

- `docs/cursor-drone.md`

## Philosophy

- No image assets for the core visual.
- No SVG sprites for the core visual.
- CSS variables for theming.
- Deterministic DOM layers.
- Motion that can respond to page content.
- SSR-safe React APIs.

## License

MIT, once the repo is published.
