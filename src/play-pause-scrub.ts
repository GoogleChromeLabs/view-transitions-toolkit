/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAnimations } from "./extract-animations";

/**
 * Pauses the View Transition by pausing all animations associated with the current View Transition.
 *
 * @param vt - The ViewTransition instance.
 */
export function pauseViewTransition(vt: ViewTransition): void {
  // Retrieve all animations linked to this transition
  const animations = getAnimations(vt);

  // Loop through and pause each one
  animations.forEach((anim) => {
    anim.pause();
  });
}

/**
 * Resumes (plays) the View Transition by playing all animations associated with the current View Transition.
 *
 * @param vt - The ViewTransition instance.
 */
export function playViewTransition(vt: ViewTransition): void {
  // Retrieve all animations linked to this transition
  const animations = getAnimations(vt);

  // Loop through and play each one
  animations.forEach((anim) => {
    anim.play();
  });
}

/**
 * Scrubs the View Transition to a specific progress point.
 * This automatically pauses the transition to hold the frame.
 *
 * @param vt - The ViewTransition instance.
 * @param progress - A number between 0 (start) and 1 (end).
 */
export function scrubViewTransition(
  vt: ViewTransition,
  progress: number,
): void {
  // 1. Clamp progress between 0 and 1 to prevent errors
  const safeProgress = Math.max(0, Math.min(1, progress));

  const animations = getAnimations(vt);

  animations.forEach((anim: CSSAnimation) => {
    // 2. Pause the animation so it doesn't immediately continue playing
    anim.pause();

    const effect = anim.effect;
    if (!(effect instanceof KeyframeEffect)) return;

    // 3. Get the duration of this specific animation
    const timing = effect.getComputedTiming();

    // Safety check: duration usually returns number (ms), but can be 'auto' (though rare in VT)
    if (typeof timing.duration !== "number") return;

    // 4. Set the current time based on progress
    // currentTime expects milliseconds
    anim.currentTime = timing.duration * safeProgress;
  });
}

/*
const transition = document.startViewTransition(() => {
  updateDOM();
});

await transition.ready;

// Pause immediately to freeze the transition on the first frame
pauseViewTransition(transition);
*/

/*
const rangeInput = document.querySelector("#scrubber") as HTMLInputElement;

// Start the transition
const transition = document.startViewTransition(() => updateTheDOM());
await transition.ready;

// Bind input change to scrub function
rangeInput.addEventListener("input", (e) => {
  const value = parseFloat((e.target as HTMLInputElement).value); // 0 to 1
  scrubViewTransition(transition, value);
});
*/
