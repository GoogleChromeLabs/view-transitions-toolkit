/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";

test.describe("Animation Geometry Extraction", () => {
  test("extractGeometry should return the correct boxes", async ({
    page,
  }) => {
    // Go to the page with 3 boxes + root participating
    await page.goto("http://localhost:7357/tests/spa/boxes.html");

    // Start a VT and get the optimized animation names
    const geometries = await page.evaluate(async () => {
      const { extractGeometry } = await import("/dist/measure.js");
      const { getAnimations, ViewTransitionPart } = await import("/dist/extract-animations.js");

      const t = document.startViewTransition(() => {
        document.querySelector('#box1')?.classList.toggle('big');
      });
      await t.ready;

      const box1Animation = getAnimations(t, 'box1', ViewTransitionPart.Group)[0];
      const box2Animation = getAnimations(t, 'box2', ViewTransitionPart.Group)[0];

      return {
        box1: extractGeometry(box1Animation),
        box2: extractGeometry(box2Animation),
      };
    });

    // Box1 has changed
    expect(geometries.box1.before.width).toEqual(20);
    expect(geometries.box1.before.height).toEqual(20);
    expect(geometries.box1.after.width).toEqual(40);
    expect(geometries.box1.after.height).toEqual(40);

    // Box2 has not changed
    expect(geometries.box2.before.width).toEqual(20);
    expect(geometries.box2.before.height).toEqual(20);
    expect(geometries.box2.after.width).toEqual(20);
    expect(geometries.box2.after.height).toEqual(20);
  });
});
