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
});
