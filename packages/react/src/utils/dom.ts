export const DEFAULT_READABLE_TEXT_SELECTOR =
  "main :is(h1, h2, h3, h4, p, a, button, li, span, kbd, dt, dd, label, small)";

export function isDroneOverReadableContent(
  centerX: number,
  centerY: number,
  selector = DEFAULT_READABLE_TEXT_SELECTOR,
  footprint = 96,
) {
  if (typeof document === "undefined") {
    return false;
  }

  const halfFootprint = footprint / 2;
  const droneBounds = {
    bottom: centerY + halfFootprint,
    left: centerX - halfFootprint,
    right: centerX + halfFootprint,
    top: centerY - halfFootprint,
  };

  return Array.from(document.querySelectorAll<HTMLElement>(selector)).some((element) => {
    if (!isReadableTextElement(element)) {
      return false;
    }

    const bounds = element.getBoundingClientRect();

    return (
      droneBounds.left < bounds.right &&
      droneBounds.right > bounds.left &&
      droneBounds.top < bounds.bottom &&
      droneBounds.bottom > bounds.top
    );
  });
}

function isReadableTextElement(element: HTMLElement) {
  if (element.closest(".domcraft-cursor-drone") || element.closest("[aria-hidden='true']")) {
    return false;
  }

  if (!element.textContent?.trim()) {
    return false;
  }

  const style = window.getComputedStyle(element);

  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
    return false;
  }

  const bounds = element.getBoundingClientRect();

  return (
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.bottom >= 0 &&
    bounds.right >= 0 &&
    bounds.top <= window.innerHeight &&
    bounds.left <= window.innerWidth
  );
}
