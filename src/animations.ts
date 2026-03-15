/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { extractViewTransitionName } from "./misc.js";

/**
 * Enum representing the specific parts of the View Transition pseudo-element tree.
 */
export enum ViewTransitionPart {
  Group = "::view-transition-group",
  GroupChildren = "::view-transition-group-children",
  ImagePair = "::view-transition-image-pair",
  Old = "::view-transition-old",
  New = "::view-transition-new",
}

/**
 * Represents the geometric state of a View Transition Group at a specific point in time.
 */
export interface ViewTransitionGeometry {
  width: number;
  height: number;
  left: number;
  top: number;
}

export const OPTIMIZATION_STRATEGY = {
  NONE: "none",
  SLIDE: "slide",
  SCALE: "scale",
} as const;

export type OptimizeStrategy =
  (typeof OPTIMIZATION_STRATEGY)[keyof typeof OPTIMIZATION_STRATEGY];

// Cache storage: Maps a ViewTransition instance to its related CSSAnimations
const animationsCache = new WeakMap<ViewTransition, CSSAnimation[]>();

// Interface extension to support the modern 'transitionRoot' property
// which may not exist in standard lib.dom.d.ts yet.
interface ViewTransitionWithRoot extends ViewTransition {
  transitionRoot?: Element; // Usually HTMLElement or the DocumentElement
}

/**
 * Detects if the current browser environment is affected by
 * https://crbug.com/387030974 (Chrome < 137)
 *
 * @param keyframe - The keyframe of the animation
 * @returns True if the keyframe data is incomplete/untrustworthy.
 */
const isBuggyChromium = (keyframe: ComputedKeyframe): boolean => {
  if (keyframe.transform === "none") return true;
  return false;
};

// Helper to safely parse pixel strings ("100px")
const parseVal = (val: string | number | null | undefined): number => {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val);
  return 0;
};

/**
 * Retrieves all CSSAnimations associated with a specific View Transition identifier.
 * * @param vt - The ViewTransition instance.
 * @param identifier - The view-transition-name to filter by. Defaults to "*" (all).
 * @returns An array of CSSAnimation instances.
 */
export function getAnimations(
  vt: ViewTransition,
  identifier: string | string[] = "*",
  part: ViewTransitionPart | null = null,
): CSSAnimation[] {
  // 1. Check if we have already cached the animations for this specific ViewTransition
  let animations = animationsCache.has(vt) ? animationsCache.get(vt) : null;

  // 2. If not in cache, perform the expensive DOM lookup
  if (!animations) {
    const vtModern = vt as ViewTransitionWithRoot;
    let allAnimations: Animation[];

    // Modern approach: Get it from the transitionRoot
    if (vtModern.transitionRoot) {
      allAnimations = vtModern.transitionRoot.getAnimations({ subtree: true });
    }
    // Fallback: Read it from the document
    else {
      allAnimations = document.getAnimations();
    }

    // Filter down to ONLY View Transition animations
    animations = allAnimations.filter((anim): anim is CSSAnimation => {
      if (!(anim instanceof CSSAnimation)) return false;

      const effect = anim.effect;
      if (!(effect instanceof KeyframeEffect)) return false;

      // The animation must be linked to the transitionRoot
      const transitionRoot =
        vtModern.transitionRoot ?? document.documentElement;
      const isLinkedToTransitionRoot = effect.target === transitionRoot;
      if (!isLinkedToTransitionRoot) return false;

      // The animation must be linked to a pseudo whose name starts with ::view-transition
      const pseudo = effect.pseudoElement;
      return !!(pseudo && pseudo.startsWith("::view-transition"));
    });

    // Store the filtered list in the cache
    animationsCache.set(vt, animations);
  }

  let filteredAnimations = animations;

  // 3. Perform the cheap filter based on the identifier argument
  // This runs against the cached array, not the document
  if (identifier !== "*") {
    if (Array.isArray(identifier)) {
      filteredAnimations = filteredAnimations.filter((anim) => {
        const effect = anim.effect as KeyframeEffect;
        const transitionName = extractViewTransitionName(
          effect.pseudoElement as string,
        );
        return transitionName && identifier.includes(transitionName);
      });
    } else {
      if (!CSS.supports("view-transition-name", identifier)) {
        throw new DOMException(
          `'${identifier}' is not a valid view-transition-name.`,
        );
      }
      filteredAnimations = filteredAnimations.filter((anim) => {
        // We know effect is KeyframeEffect from the cache step
        const effect = anim.effect as KeyframeEffect;
        return effect.pseudoElement?.includes(`(${identifier})`);
      });
    }
  }

  // 4. Find the one that matches the specific pseudo-element part
  if (part !== null) {
    filteredAnimations = filteredAnimations.filter((anim) => {
      const effect = anim.effect as KeyframeEffect;

      // Check if the pseudo string (e.g. "::view-transition-old(root)")
      // starts with the requested part enum (e.g. "::view-transition-old")
      return effect.pseudoElement?.startsWith(part);
    });
  }

  return filteredAnimations;
}

/**
 * Extracts the before and end geometry from a View Transition CSSAnimation.
 * Automatically handles browser bugs where keyframe data might be missing.
 *
 * @param animation - The CSSAnimation instance.
 * @returns An object containing the before and end geometry.
 */
export function extractGeometry(animation: CSSAnimation): {
  before: ViewTransitionGeometry;
  after: ViewTransitionGeometry;
} {
  const effect = animation.effect;
  if (!(effect instanceof KeyframeEffect)) {
    throw new Error("Animation effect is not a KeyframeEffect");
  }

  const keyframes: Array<ComputedKeyframe> = effect.getKeyframes();
  if (keyframes.length != 2) {
    throw new Error("Optimize only works with 2 keyframes");
  }

  const startFrame: ComputedKeyframe = keyframes[0];
  const endFrame: ComputedKeyframe = keyframes[keyframes.length - 1];

  let rectBefore, rectAfter: ViewTransitionGeometry;

  // Safari 18 does not include transforms in the keyframes when the are "none".
  // We therefore force them to that string (which is totally parseable by DOMMatrix())
  if (!startFrame.transform) {
    startFrame.transform = "none";
  }
  if (!endFrame.transform) {
    endFrame.transform = "none";
  }

  // Build rect to represent the before position + size
  // based off of the “from” transform value
  const beforeMatrix: DOMMatrix = new DOMMatrix(startFrame.transform as string);
  rectBefore = {
    width: parseVal(startFrame.width),
    height: parseVal(startFrame.height),
    left: beforeMatrix.e,
    top: beforeMatrix.f,
  };

  if (isBuggyChromium(endFrame)) {
    // FALLBACK: Scrub to the end and read computed styles directly from the DOM
    const originalTime = animation.currentTime;
    const timing = effect.getComputedTiming();

    // Move playhead to the end
    animation.currentTime = (timing.duration as number) || 0;

    // Read new styles
    const newStyles = window.getComputedStyle(
      document.documentElement,
      effect.pseudoElement,
    );

    const afterMatrix = new DOMMatrix(newStyles.transform);

    rectAfter = {
      width: parseVal(newStyles.width),
      height: parseVal(newStyles.height),
      left: afterMatrix.e,
      top: afterMatrix.f,
    };

    // Restore playhead
    animation.currentTime = originalTime;
  } else {
    const afterMatrix = new DOMMatrix(endFrame.transform as string);
    rectAfter = {
      width: parseVal(endFrame.width),
      height: parseVal(endFrame.height),
      left: afterMatrix.e,
      top: afterMatrix.f,
    };
  }

  return {
    before: rectBefore,
    after: rectAfter,
  };
}

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
      console.warn(
        "Failed to optimize view transition animation",
        animation,
        err,
      );
    }
  });

  return optimizedViewTransitionNames;
}
