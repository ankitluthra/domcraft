"use client";

import { useEffect, useRef, useState } from "react";

import { cx } from "../utils/classNames";
import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_TOGGLE_EVENT,
  DroneToggleEvent,
  getStoredDroneEnabled,
  setStoredDroneEnabled,
} from "./state";
import type { DroneFollowToggleProps } from "./types";

export function DroneFollowToggle({
  className,
  defaultEnabled = true,
  enabled: controlledEnabled,
  labelOff = "Drone Off",
  labelOn = "Drone Follow",
  onEnabledChange,
  persist = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: DroneFollowToggleProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const [uncontrolledEnabled, setUncontrolledEnabled] = useState(defaultEnabled);
  const isControlled = controlledEnabled !== undefined;
  const enabled = controlledEnabled ?? uncontrolledEnabled;
  const enabledRef = useRef(defaultEnabled);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => {
      const storedEnabled = persist
        ? getStoredDroneEnabled(storageKey, defaultEnabled)
        : defaultEnabled;

      enabledRef.current = controlledEnabled ?? storedEnabled;

      if (!isControlled) {
        setUncontrolledEnabled(storedEnabled);
      }

      setHasMounted(true);
    }, 0);

    function handleToggle(event: Event) {
      const detail = (event as DroneToggleEvent).detail;

      if (detail?.storageKey !== storageKey) {
        return;
      }

      const nextEnabled = detail?.enabled ?? getStoredDroneEnabled(storageKey, defaultEnabled);
      enabledRef.current = nextEnabled;

      if (!isControlled) {
        setUncontrolledEnabled(nextEnabled);
      }
    }

    window.addEventListener(DEFAULT_TOGGLE_EVENT, handleToggle);

    return () => {
      window.clearTimeout(mountTimer);
      window.removeEventListener(DEFAULT_TOGGLE_EVENT, handleToggle);
    };
  }, [controlledEnabled, defaultEnabled, isControlled, persist, storageKey]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  function toggleDrone() {
    const next = !enabledRef.current;
    enabledRef.current = next;

    if (!isControlled) {
      setUncontrolledEnabled(next);
    }

    setStoredDroneEnabled(next, storageKey, persist);
    onEnabledChange?.(next, "toggle");
  }

  const label = enabled ? labelOn : labelOff;

  return (
    <button
      aria-label={`${label}. Toggle with Control D.`}
      aria-pressed={enabled}
      className={cx("domcraft-drone-toggle", enabled && "domcraft-drone-toggle--enabled", className)}
      data-mounted={hasMounted ? "true" : "false"}
      onClick={toggleDrone}
      type="button"
    >
      <span aria-hidden="true" className="domcraft-drone-toggle__icon">
        {enabled && hasMounted ? "⌖" : "◌"}
      </span>
      <span className="domcraft-drone-toggle__label">{label}</span>
      <kbd className="domcraft-drone-toggle__shortcut">Ctrl+D</kbd>
    </button>
  );
}
