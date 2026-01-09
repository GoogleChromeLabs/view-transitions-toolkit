/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// 1. Type Definitions
// Ensure TS knows about URLPattern and the Navigation API
declare class URLPattern {
  constructor(
    input: string | { pathname: string; baseURL?: string },
    baseURL?: string,
  );
  test(input: string | URL, baseURL?: string): boolean;
}

interface RouteMap {
  [name: string]: string; // "article-detail": "/articles/:id"
}

/**
 * Helper: Matches a URL string against the RouteMap and returns the route name.
 */
function getRouteName(
  urlStr: string | null | undefined,
  map: RouteMap,
): string | null {
  if (!urlStr) return "";

  try {
    const url = new URL(urlStr);

    for (const [name, patternStr] of Object.entries(map)) {
      // Create a pattern relative to the current origin
      const pattern = new URLPattern(patternStr, window.location.origin);

      // Check if the URL matches this pattern
      if (pattern.test(url)) {
        return name;
      }
    }
  } catch (e) {
    console.warn("Error matching route:", e);
  }

  return "";
}

/**
 * Installs listeners for 'pageswap' and 'pagereveal' to automatically
 * inject 'from-<name>' and 'to-<name>' classes into the ViewTransition.
 *
 * @param routeMap - Dictionary of route names to URLPattern strings.
 */
export function installAutomaticViewTransitionTypes(routeMap: RouteMap): void {
  // Safety check for SSR or unsupported browsers
  if (typeof window === "undefined" || !("ViewTransition" in window)) return;

  // 1. OUTGOING (Page Swap)
  // We determine types based on where we are (FROM) and where we are going (TO).
  window.addEventListener("pageswap", (e) => {
    if (!e.viewTransition) return;

    // 'e.activation' contains info about the navigation causing the swap
    const currentUrl = window.location.href; // @TODO: Is this correct?
    // @ts-ignore: e.activation seems to missing from the Types definition
    const nextUrl = e.activation?.entry?.url;

    const fromName = getRouteName(currentUrl, routeMap);
    const toName = getRouteName(nextUrl, routeMap);

    if (fromName) e.viewTransition.types.add(`from-${fromName}`);
    if (toName) e.viewTransition.types.add(`to-${toName}`);

    return null;
  });

  // 2. INCOMING (Page Reveal)
  // We determine types based on where we came from (FROM) and where we are (TO).
  window.addEventListener("pagereveal", (e) => {
    if (!e.viewTransition) return;

    // For incoming, we look at the global navigation.activation state
    // @ts-ignore: window.navigation seems to missing from the Types definition
    const fromUrl = window.navigation?.activation?.from?.url;
    const currentUrl = window.location.href; // @TODO: Is this correct?

    const fromName = getRouteName(fromUrl, routeMap);
    const toName = getRouteName(currentUrl, routeMap);

    if (fromName) e.viewTransition.types.add(`from-${fromName}`);
    if (toName) e.viewTransition.types.add(`to-${toName}`);

    return null;
  });
}
