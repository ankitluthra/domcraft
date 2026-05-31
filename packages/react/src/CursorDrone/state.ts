export const DEFAULT_STORAGE_KEY = "domcraft-cursor-drone";
export const DEFAULT_TOGGLE_EVENT = "domcraft-cursor-drone-toggle";

export type DroneToggleEvent = CustomEvent<{ enabled: boolean; storageKey: string }>;

export function getStoredDroneEnabled(storageKey = DEFAULT_STORAGE_KEY, fallback = true) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(storageKey);

  if (storedValue === "off") {
    return false;
  }

  if (storedValue === "on") {
    return true;
  }

  return fallback;
}

export function setStoredDroneEnabled(
  enabled: boolean,
  storageKey = DEFAULT_STORAGE_KEY,
  persist = true,
) {
  if (typeof window === "undefined") {
    return;
  }

  if (persist) {
    window.localStorage.setItem(storageKey, enabled ? "on" : "off");
  }

  window.dispatchEvent(
    new CustomEvent(DEFAULT_TOGGLE_EVENT, {
      detail: { enabled, storageKey },
    }),
  );
}
