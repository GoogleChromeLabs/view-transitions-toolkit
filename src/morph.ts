/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAnimations, ViewTransitionPart } from "./animations.js";

/**
 * Returns CSS needed to morph an element during a View Transition,
 * following the technique described in https://www.bram.us/2025/05/15/view-transitions-border-radius-revisited/
 *
 * @param vt The active ViewTransition
 * @param element The element to apply the morph to
 * @param properties A list of CSS properties to transition
 * @returns A string containing the required CSS, or an empty string if it couldn't be generated
 */
export function morph(
  vt: ViewTransition,
  element: HTMLElement,
  properties: string[]
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
  
  // 3. Get the duration and easing from the original ::view-transition-group
  const groupAnimations = getAnimations(vt, vtName, ViewTransitionPart.Group);
  if (groupAnimations.length === 0) {
    console.warn(`morph: Could not find ::view-transition-group animation for ${vtName}. Skipping.`);
    return "";
  }

  const anim = groupAnimations[0];
  const effect = anim.effect as KeyframeEffect;
  const timing = effect.getComputedTiming();
  const durationMs = timing.duration;
  const easing = effect.getTiming().easing;

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
