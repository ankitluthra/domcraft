export type RotorPhase = "idle" | "active" | "settling";

export type CursorDroneChangeSource = "keyboard" | "toggle" | "programmatic";

export type CursorDroneProps = {
  className?: string;
  defaultEnabled?: boolean;
  enabled?: boolean;
  keyboardShortcut?: boolean;
  motionIntensity?: "calm" | "normal" | "snappy";
  onEnabledChange?: (enabled: boolean, source: CursorDroneChangeSource) => void;
  opacity?: number;
  opacityOverText?: number;
  persist?: boolean;
  readableContentSelector?: string;
  size?: number;
  storageKey?: string;
  textAware?: boolean;
  zIndex?: number;
};

export type DroneFollowToggleProps = {
  className?: string;
  defaultEnabled?: boolean;
  enabled?: boolean;
  labelOff?: string;
  labelOn?: string;
  onEnabledChange?: (enabled: boolean, source: CursorDroneChangeSource) => void;
  persist?: boolean;
  storageKey?: string;
};
