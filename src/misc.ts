/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts the view transition name from a pseudo-element.
 *
 * @param pseudo - The pseudo-element to extract the name from.
 * @returns The view transition name, or null if not found.
 */
export function extractViewTransitionName(
  pseudo: string | undefined,
): string | null {
  if (!pseudo) {
    return null;
  }

  const match = pseudo.match(
    /^::view-transition-(?:root|group|group-children|image-pair|old|new)\(([^)]+)\)$/,
  );
  if (!match) {
    return null;
  }
  return match[1] ?? null;
}

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
  for (const [$el, name] of entries) {
    $el.style.viewTransitionName = name;
  }

  try {
    await vtPromise;
  } finally {
    for (const [$el] of entries) {
      $el.style.viewTransitionName = "";
    }
  }
};
