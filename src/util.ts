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
