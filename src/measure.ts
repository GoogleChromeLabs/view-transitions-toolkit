/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Represents the geometric state of a View Transition Group at a specific point in time.
 */
export interface ViewTransitionGeometry {
  width: number;
  height: number;
  left: number;
  top: number;
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
