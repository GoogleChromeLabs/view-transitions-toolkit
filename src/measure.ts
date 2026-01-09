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
  transform: string;
}

/**
 * Detects if the current browser environment is exhibiting Chromium bug #387030974.
 * In affected versions, the end keyframes for ::view-transition-group
 * often contain missing or "auto" dimensions instead of absolute pixel values.
 *
 * @param frame - The last keyframe of the animation.
 * @returns True if the keyframe data is incomplete/untrustworthy.
 */
function isBuggyChromium(frame: Keyframe): boolean {
  // If width or height are missing, empty, or "auto", we cannot use them for geometry.
  if (!frame.width || !frame.height) return true;
  if (frame.width === "auto" || frame.height === "auto") return true;

  return false;
}

/**
 * Extracts the start and end geometry from a View Transition CSSAnimation.
 * Automatically handles browser bugs where keyframe data might be missing.
 *
 * @param animation - The CSSAnimation instance.
 * @returns An object containing the start and end geometry.
 */
export function extractGeometry(animation: CSSAnimation): {
  start: ViewTransitionGeometry;
  end: ViewTransitionGeometry;
} {
  const effect = animation.effect;
  if (!(effect instanceof KeyframeEffect)) {
    throw new Error("Animation effect is not a KeyframeEffect");
  }

  const keyframes = effect.getKeyframes();
  if (keyframes.length < 2) {
    throw new Error("Animation does not have enough keyframes");
  }

  const startFrame = keyframes[0];
  const endFrame = keyframes[keyframes.length - 1];

  // Helper to safely parse pixel strings ("100px")
  const parseVal = (val: string | number | null | undefined): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") return parseFloat(val);
    return 0;
  };

  // 1. Extract Start Geometry
  const start: ViewTransitionGeometry = {
    width: parseVal(startFrame.width),
    height: parseVal(startFrame.height),
    transform: (startFrame.transform as string) || "none",
  };

  // 2. Extract End Geometry
  let end: ViewTransitionGeometry;

  if (isBuggyChromium(endFrame) && effect.pseudoElement) {
    // FALLBACK: Scrub to the end and read computed styles directly from the DOM
    const originalTime = animation.currentTime;
    const timing = effect.getComputedTiming();

    // Move playhead to the end
    animation.currentTime = (timing.duration as number) || 0;

    // Read live style
    const style = window.getComputedStyle(
      document.documentElement,
      effect.pseudoElement,
    );

    end = {
      width: parseVal(style.width),
      height: parseVal(style.height),
      transform: style.transform !== "none" ? style.transform : "none",
    };

    // Restore playhead
    animation.currentTime = originalTime;
  } else {
    // STANDARD: Read directly from keyframes
    end = {
      width: parseVal(endFrame.width),
      height: parseVal(endFrame.height),
      transform: (endFrame.transform as string) || "none",
    };
  }

  return { start, end };
}
