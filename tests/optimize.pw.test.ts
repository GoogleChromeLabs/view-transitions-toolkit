/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";

test.describe("Animation Optimization", () => {
  test("optimizeGroupAnimations should return the names of the optimized animations", async ({
    page,
  }) => {
    // Go to the page with 3 boxes + root participating
    await page.goto("http://localhost:7357/tests/spa/boxes.html");

    // Start a VT and get the optimized animation names
    const optimizedNames = await page.evaluate(async () => {
      const { optimizeGroupAnimations } = await import(
        "/dist/optimize.js"
      );

      const t = document.startViewTransition(() => {});
      await t.ready;

      return optimizeGroupAnimations(t, "*");
    });

    // Expect the names to be root, box1, box2, and box3 in any order
    expect(optimizedNames).toHaveLength(4);
    expect(optimizedNames).toEqual(
      expect.arrayContaining(["root", "box1", "box2", "box3"]),
    );
  });
});
