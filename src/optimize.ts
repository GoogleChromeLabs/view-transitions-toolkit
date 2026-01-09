/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractGeometry, ViewTransitionGeometry } from "./measure";
import { getAnimations, ViewTransitionPart } from "./extract-animations";

/**
 * Replaces the animation's keyframes with an optimized version.
 * * Instead of animating width/height (which triggers layout), it fixes the dimensions
 * to the 'end' state and uses a CSS scale transform to emulate the size change.
 *
 * @param animation - The CSSAnimation to optimize.
 * @param geometry - The geometry extracted via extractGeometry().
 */
export function optimizeAnimation(
  animation: CSSAnimation,
  geometry: { start: ViewTransitionGeometry; end: ViewTransitionGeometry },
): void {
  const { start, end } = geometry;
  const effect = animation.effect as KeyframeEffect;

  // 1. Calculate Scale Factors
  // We compare the start size to the end size to determine how much we need to scale.
  // Safety check: Prevent division by zero if the element disappears (0 width).
  const scaleX = end.width === 0 ? 1 : start.width / end.width;
  const scaleY = end.height === 0 ? 1 : start.height / end.height;

  // @TODO: Verify this against https://www.bram.us/2025/03/04/view-transitions-snapshot-containing-block/
  // 2. Construct the Optimized Start Transform
  // The logic:
  // - We set the element to its FINAL size (end.width, end.height).
  // - We apply the START position (start.transform).
  // - We apply a SCALE to visually shrink/grow the final size back to the start size.
  //
  // Note: ::view-transition-group elements have a default `transform-origin: 0 0`.
  // This is critical; it means scaling applies from the top-left corner, preserving
  // the position set by the translation.
  const baseTransform = start.transform === "none" ? "" : start.transform;
  const startTransform = `${baseTransform} scale(${scaleX}, ${scaleY})`;

  // 3. Apply New Keyframes
  // We fix width and height to the END values for the entire duration.
  effect.setKeyframes([
    {
      width: `${end.width}px`,
      height: `${end.height}px`,
      transform: startTransform,
    },
    {
      width: `${end.width}px`,
      height: `${end.height}px`,
      transform: end.transform,
    },
  ]);
}

/**
 * Optimize the group animations of a VT object
 */
export function optimizeGroupAnimations(
  vt: ViewTransition,
  targets: boolean | "*" | string[],
) {
  if (targets === false) return;

  const allGroupAnimations = getAnimations(vt, "*", ViewTransitionPart.Group);

  if (!allGroupAnimations) return;

  const animationsToOptimize = allGroupAnimations.filter(
    (anim: CSSAnimation) => {
      if (targets === "*" || targets === true) return true;

      if (Array.isArray(targets)) {
        const effect = anim.effect as KeyframeEffect;
        const pseudo = effect.pseudoElement || "";
        return targets.some((id) => pseudo.includes(`(${id})`));
      }
      return false;
    },
  );

  animationsToOptimize.forEach((anim: CSSAnimation) => {
    try {
      const geometry = extractGeometry(anim);
      optimizeAnimation(anim, geometry);
    } catch (err) {
      console.warn("Failed to optimize view transition animation", anim, err);
    }
  });
}

/*
const transition = document.startViewTransition(() => updateDOM());
await transition.ready;

// 1. Get all "Group" animations (the ones that move/resize)
const groupAnimations = getAnimations(transition, "*", ViewTransitionPart.Group);

groupAnimations.forEach((anim) => {
  // 2. Extract the browser-calculated positions
  const geometry = extractGeometry(anim);
  
  // 3. Apply the optimization
  optimizeAnimation(anim, geometry);
});
*/
