/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Type for the state setter function used internally by the shims.
 */
type ActiveTransitionSetter = (vt: ViewTransition) => void;

import { supports } from "./feature-detection.js";

/**
 * Logic for Same-Document View Transitions (SPA).
 * Intercepts document.startViewTransition to capture the returned object.
 */
function shimSameDocument(setActiveTransition: ActiveTransitionSetter) {
  // Abort if Same-Document View Transitions are not supported at all
  if (!supports.sameDocument) {
    return;
  }

  // Grab the original document.startViewTransition
  const nativeStartViewTransition = document.startViewTransition.bind(document);

  // Overwrite document.startViewTransition with a version that keeps track of the VT
  document.startViewTransition = function (
    callbackOrOptions?: any,
  ): ViewTransition {
    const vt = nativeStartViewTransition(callbackOrOptions);
    setActiveTransition(vt);
    return vt;
  };
}

const shimCrossDocument = (
  setActiveTransition: ActiveTransitionSetter,
): ActiveTransitionSetter | void => {
  // Abort if Cross-Document View Transitions are not supported at all
  if (!supports.crossDocument) return;

  // Just return the setActiveTransition which the author needs to apply themselves
  return setActiveTransition;
};

const setupActiveViewTransitionTracking = (
  mode?: string,
): ActiveTransitionSetter | void => {
  // No mode passed into this? Default to both
  if (mode === undefined) mode = "both";

  // Abort if mode is incorrect
  if (!["same-document", "cross-document", "both"].includes(mode)) {
    console.warn(
      'Tried to register the document.activeViewTransition tracker with an incorrect mode. Allowed modes are "same-document" or "cross-document". If you want both, leave the mode empty',
    );
    return;
  }

  // Abort if document.activeViewTransition is already supported
  // If the browser already has the activeViewTransition property, we don't need to interfere.
  if (supports.activeViewTransition) {
    return;
  }

  // The activeViewTransition
  let activeTransition: ViewTransition | null = null;

  // Expose document.activeViewTransition
  Object.defineProperty(document, "activeViewTransition", {
    get: () => activeTransition,
    configurable: true,
    enumerable: true,
  });

  // This function is passed to the sub-shims so they can update the central state.
  const setActiveTransition: ActiveTransitionSetter = (vt: ViewTransition) => {
    activeTransition = vt;

    // Auto-cleanup: When the transition finishes, clear the active state.
    // We use .finally() to ensure cleanup happens even if the transition skips or errors.
    vt.finished.finally(() => {
      // Only clear if this specific transition is still the active one
      // (prevents race conditions if a new transition started immediately)
      if (activeTransition === vt) {
        activeTransition = null;
      }
    });
  };

  // There was a request to shim it for same-document
  // ~> We can apply the shim directly
  if (mode === "same-document" || mode === "both") {
    shimSameDocument(setActiveTransition);
  }

  // There was a request to shim it for cross-document
  // ~> We need to return the setActiveTransition function so that the auhtor can apply it themselves
  // @NOTE: This needs to be done because of timing issues
  if (mode === "cross-document" || mode === "both") {
    // @ts-ignore
    return shimCrossDocument(setActiveTransition);
  }
};

export { setupActiveViewTransitionTracking };
