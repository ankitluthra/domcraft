# @domcraft/react

React components built from DOM and CSS.

## Install

```bash
pnpm add @domcraft/react framer-motion
```

## Usage

```tsx
import { CursorDrone, DroneFollowToggle } from "@domcraft/react";
import "@domcraft/react/styles.css";

export function App() {
  return (
    <>
      <CursorDrone />
      <DroneFollowToggle />
    </>
  );
}
```
