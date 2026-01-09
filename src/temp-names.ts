/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Temporarily assigns view-transition-names to elements and cleans them up
 * after the transition promise resolves or rejects.
 *
 * @param entries - An array of tuples: [HTMLElement, string]
 * @param vtPromise - The ViewTransition promise to wait for (usually transition.finished)
 */
export const setTemporaryViewTransitionNames = async (
  entries: [HTMLElement, string][],
  vtPromise: Promise<unknown>,
): Promise<void> => {
  // 1. Set the temporary names
  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = name;
  }

  try {
    // 2. Wait for the specific transition phase
    await vtPromise;
  } finally {
    // 3. Clean up names (runs on success OR failure)
    for (const [$el] of entries) {
      $el.style.viewTransitionName = "";
    }
  }
};
