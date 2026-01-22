/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Type Definitions for Cross-Document Events
// These might not be in standard TypeScript lib files yet.
interface PageSwapEvent extends Event {
  viewTransition?: ViewTransition | null;
}

interface PageRevealEvent extends Event {
  viewTransition?: ViewTransition | null;
}

declare global {
  interface WindowEventMap {
    pageswap: PageSwapEvent;
    pagereveal: PageRevealEvent;
  }
}

/**
 * Type for the state setter function used internally by the shims.
 */
type ActiveTransitionSetter = (vt: ViewTransition) => void;

/**
 * Logic for Same-Document View Transitions (SPA).
 * Intercepts document.startViewTransition to capture the returned object.
 */
function shimSameDocument(setActiveTransition: ActiveTransitionSetter) {
  // Guard: If startViewTransition doesn't exist, we can't shim anything.
  if (!("startViewTransition" in document)) return;

  const nativeStartViewTransition = document.startViewTransition.bind(document);

  document.startViewTransition = function (
    callbackOrOptions?: any,
  ): ViewTransition {
    // 1. Call native
    const vt = nativeStartViewTransition(callbackOrOptions);

    // 2. Update state
    setActiveTransition(vt);

    return vt;
  };
}

/**
 * Logic for Cross-Document View Transitions (MPA).
 * Listens for pageswap (outgoing) and pagereveal (incoming) events.
 */
function shimCrossDocument(setActiveTransition: ActiveTransitionSetter) {
  // Guard: SSR safety
  if (typeof window === "undefined") return;

  // 1. Listen for Outgoing (Page Swap)
  window.addEventListener("pageswap", (e: PageSwapEvent) => {
    if (e.viewTransition) {
      setActiveTransition(e.viewTransition);
    }
  });

  // 2. Listen for Incoming (Page Reveal)
  window.addEventListener("pagereveal", (e: PageRevealEvent) => {
    if (e.viewTransition) {
      setActiveTransition(e.viewTransition);
    }
  });
}

/**
 * Main Installation Function.
 * Sets up the activeViewTransition property and initializes both shims.
 */
export function installActiveViewTransitionShim(): void {
  // @TODO: Figure out how this stacks against the native implementation …

  // 1. Abort if the feature is not supported at all
  // (We need at least basic View Transition support to track anything)
  if (!("startViewTransition" in document)) {
    return;
  }

  // 2. Abort if fully supported natively
  // If the browser already has the activeViewTransition property, we don't need to interfere.
  if ("activeViewTransition" in Document.prototype) {
    return;
  }

  // 3. Centralized State Management
  let activeTransition: ViewTransition | null = null;

  // 4. Define the property on the document
  Object.defineProperty(document, "activeViewTransition", {
    get: () => activeTransition,
    configurable: true,
    enumerable: true,
  });

  // 5. Create the Setter/Cleanup Logic
  // This function is passed to the sub-shims so they can update the central state.
  const handleNewTransition: ActiveTransitionSetter = (vt: ViewTransition) => {
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

  // 6. Initialize both subsystems
  shimSameDocument(handleNewTransition);
  shimCrossDocument(handleNewTransition);
}
