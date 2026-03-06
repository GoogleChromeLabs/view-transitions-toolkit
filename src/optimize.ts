/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractGeometry, ViewTransitionGeometry } from "./measure.js";
import { getAnimations, ViewTransitionPart } from "./extract-animations.js";
import { extractViewTransitionName } from "./util.js";

export const OPTIMIZATION_STRATEGY = {
  NONE: "none",
  SLIDE: "slide",
  SCALE: "scale",
} as const;

export type OptimizeStrategy =
  typeof OPTIMIZATION_STRATEGY[keyof typeof OPTIMIZATION_STRATEGY];

/**
 * Replaces the animation's keyframes with an optimized version.
 * Instead of animating width/height (which triggers layout), it fixes the dimensions
 * to the 'end' state and uses a CSS scale transform to emulate the size change.
 *
 * @param animation - The CSSAnimation to optimize.
 * @param geometry - The geometry extracted via extractGeometry().
 * @param strategy {OptimizeStrategy} - The optimization strategy to use.
 */
export function optimizeAnimation(
  animation: CSSAnimation,
  geometry: { before: ViewTransitionGeometry; after: ViewTransitionGeometry },
  strategy: OptimizeStrategy = OPTIMIZATION_STRATEGY.SCALE,
): boolean | string {
  // Bail out if no strategy, or strategy is NONE
  if (!strategy || strategy === OPTIMIZATION_STRATEGY.NONE) {
    return false;
  }

  const { before, after } = geometry;
  const effect = animation.effect as KeyframeEffect;
  const keyframes = effect.getKeyframes();

  // Bail out if there are no two keyframes
  if (keyframes.length !== 2) {
    console.warn("Optimize only works with 2 keyframes");
    return false;
  }

  // Determine starting scale.
  // If the strategy is SLIDE, we don't want to scale, so we force the scale to 1.
  const scaleX =
    strategy === OPTIMIZATION_STRATEGY.SLIDE ? 1 : before.width / after.width;
  const scaleY =
    strategy === OPTIMIZATION_STRATEGY.SLIDE ? 1 : before.height / after.height;

  // Build flip keyframes, copying over the easing from the existing effect
  // See https://www.bram.us/2025/03/04/view-transitions-snapshot-containing-block/ for details
  const flipKeyframes = {
    transform: [
      `translate(${before.left}px,${before.top}px) scaleX(${scaleX}) scaleY(${scaleY})`,
      `translate(${after.left}px,${after.top}px) scaleX(1) scaleY(1)`,
    ],
    transformOrigin: ["0% 0%", "0% 0%"],
    easing: [keyframes[0].easing, keyframes[1].easing],
  };

  // Write the new keyframes
  effect.setKeyframes(flipKeyframes);

  const viewTransitionName = extractViewTransitionName(
    effect.pseudoElement as string,
  );
  return viewTransitionName ?? false;
}

/**
 * Optimize the group animations of a VT object
 */
export function optimizeGroupAnimations(
  vt: ViewTransition,
  targets: "*" | string | string[],
  strategy: OptimizeStrategy = OPTIMIZATION_STRATEGY.SCALE,
): string[] {
  const optimizedViewTransitionNames: string[] = [];
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

  if (!animationsToOptimize.length) return optimizedViewTransitionNames;

  animationsToOptimize.forEach((animation: CSSAnimation) => {
    try {
      const geometry = extractGeometry(animation);
      const result = optimizeAnimation(animation, geometry, strategy);
      if (typeof result === "string") {
        optimizedViewTransitionNames.push(result);
      }
    } catch (err) {
      console.warn("Failed to optimize view transition animation", animation, err);
    }
  });

  return optimizedViewTransitionNames;
}
