/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Cache storage: Maps a ViewTransition instance to its related CSSAnimations
const animationsCache = new WeakMap<ViewTransition, CSSAnimation[]>();

/**
 * Enum representing the specific parts of the View Transition pseudo-element tree.
 */
export enum ViewTransitionPart {
  Group = "::view-transition-group",
  ImagePair = "::view-transition-image-pair",
  Old = "::view-transition-old",
  New = "::view-transition-new",
}

// Interface extension to support the modern 'transitionRoot' property
// which may not exist in standard lib.dom.d.ts yet.
interface ViewTransitionWithRoot extends ViewTransition {
  transitionRoot?: Element; // Usually HTMLElement or the DocumentElement
}

/**
 * Retrieves all CSSAnimations associated with a specific View Transition identifier.
 * * @param vt - The ViewTransition instance.
 * @param identifier - The view-transition-name to filter by. Defaults to "*" (all).
 * @returns An array of CSSAnimation instances.
 */
export function getAnimations(
  vt: ViewTransition,
  identifier: string = "*",
  part: ViewTransitionPart | null = null,
): CSSAnimation[] {
  // 1. Check if we have already cached the animations for this specific ViewTransition
  let animations = animationsCache.get(vt);

  // 2. If not in cache, perform the expensive DOM lookup
  if (!animations) {
    const vtModern = vt as ViewTransitionWithRoot;
    let allAnimations: Animation[];

    // Modern approach: Scoped View Transitions
    if (vtModern.transitionRoot) {
      allAnimations = vtModern.transitionRoot.getAnimations({ subtree: true });
    }
    // Fallback: Global View Transitions
    else {
      allAnimations = document.getAnimations();
    }

    // Filter down to ONLY View Transition animations
    animations = allAnimations.filter((anim): anim is CSSAnimation => {
      if (!(anim instanceof CSSAnimation)) return false;

      const effect = anim.effect;
      if (!(effect instanceof KeyframeEffect)) return false;

      const pseudo = effect.pseudoElement;
      // We only care about pseudo-elements starting with ::view-transition
      return !!(pseudo && pseudo.startsWith("::view-transition"));
    });

    // Store the filtered list in the cache
    animationsCache.set(vt, animations);
  }

  let filteredAnimations = animations;

  // 3. Perform the cheap filter based on the identifier argument
  // This runs against the cached array, not the document
  if (identifier !== "*") {
    filteredAnimations = filteredAnimations.filter((anim) => {
      // We know effect is KeyframeEffect from the cache step
      const effect = anim.effect as KeyframeEffect;
      return effect.pseudoElement?.includes(`(${identifier})`);
    });
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
 * Retrieves a single specific CSSAnimation for a given View Transition identifier and part.
 * Builds on top of getAnimations().
 * * @param vt - The ViewTransition instance.
 * @param identifier - The view-transition-name (e.g., "header", "root").
 * @param part - The specific pseudo-element part (e.g., Old, New, Group).
 * @returns The matching CSSAnimation or undefined if not found.
 */
export function getAnimation(
  vt: ViewTransition,
  identifier: string,
  part: ViewTransitionPart,
): CSSAnimation | undefined {
  // 1. Get all animations for this specific identifier
  const animations = getAnimations(vt, identifier, part);

  if (animations.length === 1) {
    return animations[0];
  } else {
    return undefined;
  }
}

/*
// Assuming a view transition is currently running
const transition = document.startViewTransition(() => {
  // DOM update logic
});

await transition.ready;

// Get ALL view transition animations
const allVtAnimations = getAnimations(transition);

// Get animations specifically for the "header" area
// (Assuming you have CSS: view-transition-name: header;)
const headerAnimations = getAnimations(transition, "header");

// Get card old animation
const cardExitAnim = getAnimation(
  transition, 
  "card", 
  ViewTransitionPart.Old
);

console.log(headerAnimations, cardExitAnim);
*/
