/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * Returns CSS needed to morph an element during a View Transition,
 * following the technique described in https://www.bram.us/2025/05/15/view-transitions-border-radius-revisited/
 *
 * @param vt The active ViewTransition
 * @param element The element to apply the morph to
 * @param options Object containing duration (ms) and easing string
 * @returns A string containing the required CSS, or an empty string if it couldn't be generated
 */
export function morph(
  vt: ViewTransition,
  element: HTMLElement,
  properties: string[],
  options: { duration: number; easing: string }
): string {
  // 1. Get view-transition-name
  const styles = window.getComputedStyle(element);
  const vtName = styles.viewTransitionName;

  if (!vtName || vtName === "none") {
    console.warn("morph: Element has no view-transition-name. Skipping.");
    return "";
  }

  // 2. Warn if element already has a transition
  const durations = styles.transitionDuration.split(",").map(d => parseFloat(d));
  if (durations.some(d => d > 0)) {
    console.warn("morph: Element already has a CSS transition applied. It will be overwritten by morph.");
  }
  
  const durationMs = options.duration;
  const easing = options.easing;

  // 4. Generate the CSS string
  if (!element.id) {
    console.warn("morph: Element must have an ID to be targeted. Skipping.");
    return "";
  }
  
  return `
#${element.id} {
  transition-property: ${properties.join(", ")};
  transition-duration: ${durationMs}ms;
  transition-timing-function: ${easing};
}

::view-transition-old(${vtName}) {
  display: none;
}

::view-transition-new(${vtName}) {
  animation: none;
  width: 100%;
  height: 100%;
}
`.trim();
}
