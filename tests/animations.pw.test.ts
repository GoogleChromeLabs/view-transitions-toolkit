/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from "@playwright/test";

test.describe("Extract Animations", () => {
  test("getAnimations should only get the VT animations", async ({ page }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/rootonly.html");

    // Start a VT and get some numbers
    const result = await page.evaluate(async () => {
      const { getAnimations } = await import("/dist/extract-animations.js");

      const numAnimationsBefore = document.getAnimations().length;

      const t = document.startViewTransition(() => {});
      await t.ready;

      const numVTAnimations = getAnimations(t).length;
      const numAnimationsDuringVT = document.getAnimations().length;

      return {
        numAnimationsBefore,
        numAnimationsDuringVT,
        numVTAnimations,
      };
    });

    expect(result.numVTAnimations).toBeGreaterThan(0);
    expect(result.numAnimationsDuringVT).toBe(
      result.numAnimationsBefore + result.numVTAnimations,
    );
  });

  test("getAnimations should be able to filter using an identifier", async ({
    page,
  }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/rootonly.html");

    // Find out how many animations the browser creates per VT pseudo
    // @note: this is (currently) 5, but that might change over time …
    // So that’s why we determine it programmatically.
    const numAnimationsForOneElement = await page.evaluate(async () => {
      const { getAnimations } = await import("/dist/extract-animations.js");

      const t = document.startViewTransition(() => {});
      await t.ready;

      return getAnimations(t).length;
    });

    // Go to the page with 3 boxes + root participating
    await page.goto("http://localhost:7357/tests/boxes.html");

    // Start a VT and get the number
    const numAnimationsForElements = await page.evaluate(async () => {
      const { getAnimations } = await import("/dist/extract-animations.js");

      const t = document.startViewTransition(() => {});
      await t.ready;

      return {
        all: getAnimations(t).length,
        root: getAnimations(t, "root").length,
      };
    });

    expect(numAnimationsForElements.all).toBe(numAnimationsForOneElement * 4);
    expect(numAnimationsForElements.root).toBe(numAnimationsForOneElement);
  });
});
