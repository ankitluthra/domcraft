"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MotionStyle } from "framer-motion";

import { isDroneOverReadableContent } from "../utils/dom";
import { clamp, shortestAngleDelta } from "../utils/math";
import { cx } from "../utils/classNames";
import { Quadcopter } from "./Quadcopter";
import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_TOGGLE_EVENT,
  DroneToggleEvent,
  getStoredDroneEnabled,
  setStoredDroneEnabled,
} from "./state";
import type { CursorDroneProps, RotorPhase } from "./types";

const MOTION_PRESETS = {
  calm: {
    damping: 19,
    mass: 0.8,
    stiffness: 38,
  },
  normal: {
    damping: 16,
    mass: 0.72,
    stiffness: 48,
  },
  snappy: {
    damping: 15,
    mass: 0.65,
    stiffness: 62,
  },
};

export function CursorDrone({
  className,
  defaultEnabled = true,
  enabled: controlledEnabled,
  keyboardShortcut = true,
  motionIntensity = "normal",
  onEnabledChange,
  opacity = 0.7,
  opacityOverText = 0.25,
  persist = true,
  readableContentSelector,
  size = 96,
  storageKey = DEFAULT_STORAGE_KEY,
  textAware = true,
  zIndex = 5,
}: CursorDroneProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const [uncontrolledEnabled, setUncontrolledEnabled] = useState(defaultEnabled);
  const [isOverReadableContent, setIsOverReadableContent] = useState(false);
  const [rotorPhase, setRotorPhase] = useState<RotorPhase>("idle");
  const droneRef = useRef<HTMLDivElement>(null);
  const enabledRef = useRef(defaultEnabled);
  const isControlled = controlledEnabled !== undefined;
  const enabled = controlledEnabled ?? uncontrolledEnabled;
  const isOverReadableContentRef = useRef(false);
  const targetPosition = useRef({ x: 900, y: 320 });
  const previousPosition = useRef({ x: 900, y: 320 });
  const scrollBoostUntil = useRef(0);
  const rotorAngle = useRef(0);
  const rotorSpeed = useRef(0);
  const bank = useRef(0);
  const pitch = useRef(0);
  const heading = useRef(0);
  const isMobileLike = useRef(false);
  const lastInputWasTouchLike = useRef(false);
  const lastDirectInputAt = useRef(0);
  const idleAnchor = useRef({ x: 0, y: 0 });
  const pointerX = useMotionValue(900);
  const pointerY = useMotionValue(320);
  const motionPreset = MOTION_PRESETS[motionIntensity];
  const x = useSpring(pointerX, motionPreset);
  const y = useSpring(pointerY, motionPreset);

  useEffect(() => {
    const initialPosition = {
      x: window.innerWidth * 0.72,
      y: window.innerHeight * 0.38,
    };

    pointerX.set(initialPosition.x);
    pointerY.set(initialPosition.y);
    targetPosition.current = initialPosition;
    previousPosition.current = initialPosition;
    idleAnchor.current = initialPosition;
    lastInputWasTouchLike.current = false;
    isMobileLike.current =
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(pointer: coarse)").matches;
    lastDirectInputAt.current = performance.now();

    window.setTimeout(() => {
      const storedEnabled = persist
        ? getStoredDroneEnabled(storageKey, defaultEnabled)
        : defaultEnabled;

      enabledRef.current = controlledEnabled ?? storedEnabled;

      if (!isControlled) {
        setUncontrolledEnabled(storedEnabled);
      }

      setHasMounted(true);
    }, 0);
  }, [controlledEnabled, defaultEnabled, isControlled, persist, pointerX, pointerY, storageKey]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
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

    return () => window.removeEventListener(DEFAULT_TOGGLE_EVENT, handleToggle);
  }, [defaultEnabled, isControlled, storageKey]);

  useEffect(() => {
    if (prefersReducedMotion || !enabled) {
      rotorSpeed.current = 0;
      droneRef.current?.style.setProperty("--domcraft-rotor-angle", `${rotorAngle.current}deg`);
      droneRef.current?.style.setProperty(
        "--domcraft-rotor-angle-reverse",
        `${-rotorAngle.current}deg`,
      );
      window.setTimeout(() => setRotorPhase("idle"), 0);
      return;
    }

    let animationFrame = 0;
    let currentPhase: RotorPhase = "idle";

    function setPhase(nextPhase: RotorPhase) {
      if (nextPhase === currentPhase) {
        return;
      }

      currentPhase = nextPhase;
      setRotorPhase(nextPhase);
    }

    function handlePointerMove(event: PointerEvent) {
      targetPosition.current = { x: event.clientX, y: event.clientY };
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      lastDirectInputAt.current = performance.now();
      lastInputWasTouchLike.current = event.pointerType === "touch" || event.pointerType === "pen";

      if (lastInputWasTouchLike.current) {
        idleAnchor.current = { x: event.clientX, y: event.clientY };
      }
    }

    function handleScroll() {
      scrollBoostUntil.current = performance.now() + 220;
    }

    function updateFlightDynamics() {
      const now = performance.now();
      const idleInputGap = now - lastDirectInputAt.current;

      if (lastInputWasTouchLike.current && idleInputGap > 600) {
        pointerX.set(idleAnchor.current.x);
        pointerY.set(idleAnchor.current.y);
        targetPosition.current = {
          x: idleAnchor.current.x,
          y: idleAnchor.current.y,
        };
      }

      const currentX = x.get();
      const currentY = y.get();
      const targetDeltaX = targetPosition.current.x - currentX;
      const targetDeltaY = targetPosition.current.y - currentY;
      const velocityX = currentX - previousPosition.current.x;
      const velocityY = currentY - previousPosition.current.y;
      const distanceToTarget = Math.hypot(
        currentX - targetPosition.current.x,
        currentY - targetPosition.current.y,
      );
      const isMobileFlight = isMobileLike.current && lastInputWasTouchLike.current;
      const speed = Math.hypot(velocityX, velocityY);
      const hasScrollBoost = now < scrollBoostUntil.current;
      const targetRotorSpeed =
        distanceToTarget > 5 || hasScrollBoost ? (isMobileFlight ? 26 : 52) : 0;

      rotorSpeed.current +=
        (targetRotorSpeed - rotorSpeed.current) *
        (targetRotorSpeed > 0 ? (isMobileFlight ? 0.08 : 0.13) : 0.045);

      if (targetRotorSpeed === 0 && rotorSpeed.current < 0.04) {
        rotorSpeed.current = 0;
      }

      if (rotorSpeed.current > 0) {
        rotorAngle.current = (rotorAngle.current + rotorSpeed.current) % 360;
      }

      const desiredBank = clamp(
        targetDeltaX * (isMobileFlight ? 0.012 : 0.018) +
          velocityX * (isMobileFlight ? 0.14 : 0.22),
        -6,
        6,
      );
      const desiredPitch = clamp(
        -targetDeltaY * (isMobileFlight ? 0.01 : 0.015) -
          velocityY * (isMobileFlight ? 0.12 : 0.18),
        -4.5,
        4.5,
      );

      bank.current += (desiredBank - bank.current) * (isMobileFlight ? 0.06 : 0.085);
      pitch.current += (desiredPitch - pitch.current) * (isMobileFlight ? 0.06 : 0.085);

      if (distanceToTarget > 4 || speed > 0.2) {
        const desiredHeading =
          Math.atan2(targetDeltaY || velocityY, targetDeltaX || velocityX) * (180 / Math.PI) + 90;
        heading.current +=
          shortestAngleDelta(heading.current, desiredHeading) * (isMobileFlight ? 0.02 : 0.032);
      }

      droneRef.current?.style.setProperty("--domcraft-rotor-angle", `${rotorAngle.current}deg`);
      droneRef.current?.style.setProperty(
        "--domcraft-rotor-angle-reverse",
        `${-rotorAngle.current}deg`,
      );
      droneRef.current?.style.setProperty("--domcraft-drone-bank", `${bank.current}deg`);
      droneRef.current?.style.setProperty("--domcraft-drone-pitch", `${pitch.current}deg`);
      droneRef.current?.style.setProperty("--domcraft-drone-heading", `${heading.current}deg`);

      const nextIsOverReadableContent =
        textAware &&
        isDroneOverReadableContent(currentX, currentY, readableContentSelector, size);

      if (nextIsOverReadableContent !== isOverReadableContentRef.current) {
        isOverReadableContentRef.current = nextIsOverReadableContent;
        setIsOverReadableContent(nextIsOverReadableContent);
      }

      if (targetRotorSpeed > 0 || rotorSpeed.current > 18) {
        setPhase("active");
      } else if (rotorSpeed.current > 0.2) {
        setPhase("settling");
      } else {
        setPhase("idle");
      }

      previousPosition.current = { x: currentX, y: currentY };
      animationFrame = window.requestAnimationFrame(updateFlightDynamics);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    animationFrame = window.requestAnimationFrame(updateFlightDynamics);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [enabled, pointerX, pointerY, prefersReducedMotion, readableContentSelector, size, textAware, x, y]);

  useEffect(() => {
    if (!keyboardShortcut) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "d" || !event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      event.preventDefault();

      const next = !enabledRef.current;
      enabledRef.current = next;

      if (!isControlled) {
        setUncontrolledEnabled(next);
      }

      setStoredDroneEnabled(next, storageKey, persist);
      onEnabledChange?.(next, "keyboard");
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isControlled, keyboardShortcut, onEnabledChange, persist, storageKey]);

  if (!hasMounted) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className={cx("domcraft-cursor-drone-frame", className)}
      initial={false}
      style={
        {
          "--domcraft-cursor-drone-size": `${size}px`,
          "--domcraft-cursor-drone-z-index": zIndex,
          opacity: enabled && !prefersReducedMotion ? 1 : 0,
          x,
          y,
        } as MotionStyle
      }
      transition={{ duration: 0.2 }}
    >
      <div
        className={cx(
          "domcraft-cursor-drone domcraft-cursor-drone--quad",
          rotorPhase === "active" && "domcraft-cursor-drone--active",
          rotorPhase === "settling" && "domcraft-cursor-drone--settling",
        )}
        ref={droneRef}
        style={
          {
            "--domcraft-cursor-drone-opacity": isOverReadableContent ? opacityOverText : opacity,
          } as CSSProperties
        }
      >
        <Quadcopter />
      </div>
    </motion.div>
  );
}
