import React from "react";
import { createRoot } from "react-dom/client";
import { CursorDrone, DroneFollowToggle, Quadcopter } from "@domcraft/react";

import "@domcraft/react/styles.css";
import "./styles.css";

function App() {
  return (
    <div className="docs-root">
      <CursorDrone
        colorMode="light"
        motionIntensity="normal"
        opacity={0.74}
        opacityOverText={0.26}
        textAware
        textLayering="behind-text"
        zIndex={9}
        zIndexBehindText={1}
      />
      <header className="hero">
        <p className="eyebrow">Domcraft</p>
        <h1>Animated React Objects Built from DOM + CSS</h1>
        <p className="lede">
          This quadcopter is layered HTML and CSS with motion logic. No image. No SVG sprite. No
          canvas scene.
        </p>
        <div className="hero-actions">
          <DroneFollowToggle />
        </div>
      </header>

      <main className="content">
        <section className="panel">
          <h2>Install</h2>
          <pre>
            <code>pnpm add @domcraft/react framer-motion</code>
          </pre>
        </section>

        <section className="panel">
          <h2>Usage</h2>
          <pre>
            <code>{`import { CursorDrone, DroneFollowToggle } from "@domcraft/react";
import "@domcraft/react/styles.css";

export function Page() {
  return (
    <>
      <CursorDrone />
      <DroneFollowToggle />
      <main>...</main>
    </>
  );
}`}</code>
          </pre>
        </section>

        <section className="panel text-zone">
          <h2>Text-Aware Opacity Demo</h2>
          <p>
            Move the drone over this section. It will fade to keep text readable while preserving
            motion cues and heading.
          </p>
          <p>
            Domcraft components are inspectable and themeable, so designers and engineers can tune
            behavior with normal CSS and props instead of replacing static assets.
          </p>
          <p>
            Reduced motion settings are respected automatically. Toggle your OS preference to verify
            behavior.
          </p>
        </section>

        <section className="panel theme-lab">
          <h2>CSS Variable Theme Lab</h2>
          <p>Preview a static `Quadcopter` with custom accent/body tokens.</p>
          <div className="theme-preview">
            <div className="theme-preview-inner">
              <Quadcopter />
            </div>
          </div>
          <pre>
            <code>{`:root {
  --domcraft-drone-accent: #22d3ee;
  --domcraft-drone-body-light: #f8fafc;
  --domcraft-drone-body-mid: #64748b;
  --domcraft-drone-body-dark: #1e293b;
}`}</code>
          </pre>
        </section>
      </main>
    </div>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
