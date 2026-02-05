/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractGeometry, ViewTransitionGeometry } from "./measure.js";
import { getAnimations, ViewTransitionPart } from "./extract-animations.js";

/**
 * Replaces the animation's keyframes with an optimized version.
 * Instead of animating width/height (which triggers layout), it fixes the dimensions
 * to the 'end' state and uses a CSS scale transform to emulate the size change.
 *
 * @param animation - The CSSAnimation to optimize.
 * @param geometry - The geometry extracted via extractGeometry().
 */
export function optimizeAnimation(
  animation: CSSAnimation,
  geometry: { before: ViewTransitionGeometry; after: ViewTransitionGeometry },
): void {
  const { before, after } = geometry;
  const effect = animation.effect as KeyframeEffect;
  const keyframes = effect.getKeyframes();

  // Bail out if there are no two keyframes
  if (keyframes.length !== 2) {
    console.warn("Optimize only works with 2 keyframes");
    return;
  }

  // Build flip keyframes, copying over the easing from the existing effect
  // See https://www.bram.us/2025/03/04/view-transitions-snapshot-containing-block/ for details
  // @TODO: Make scale transforms optional
  const flipKeyframes = {
    transform: [
      `translate(${before.left}px,${before.top}px) scaleX(${before.width / after.width}) scaleY(${before.height / after.height})`,
      `translate(${after.left}px,${after.top}px) scaleX(1) scaleY(1)`,
    ],
    transformOrigin: ["0% 0%", "0% 0%"],
    easing: [keyframes[0].easing, keyframes[1].easing],
  };

  // @TODO: This requires a tad of CSS …
  // ::view-transition-new(*),
  // ::view-transition-old(*) {
  //   width: 100%;
  //   height: 100%;
  //   object-fit: fill;
  // }

  // Write the new keyframes
  effect.setKeyframes(flipKeyframes);
}

/**
 * Optimize the group animations of a VT object
 */
export function optimizeGroupAnimations(
  vt: ViewTransition,
  targets: "*" | string | string[],
) {
  // If targets is an array, loop over all targets and get the relevant group animation. Store it in a temp array
  let animationsToOptimize: CSSAnimation[] = [];
  if (Array.isArray(targets)) {
    for (const target of targets) {
      const animations = getAnimations(vt, target, ViewTransitionPart.Group);

      if (animations.length && animations[0]) {
        animationsToOptimize.push(animations[0]);
      }
    }
  } else {
    const animations = getAnimations(vt, targets, ViewTransitionPart.Group);

    if (animations.length) {
      animationsToOptimize.push(...animations);
    }
  }

  if (!animationsToOptimize.length) return;

  animationsToOptimize.forEach((anim: CSSAnimation) => {
    try {
      const geometry = extractGeometry(anim);
      optimizeAnimation(anim, geometry);
    } catch (err) {
      console.warn("Failed to optimize view transition animation", anim, err);
    }
  });
}
