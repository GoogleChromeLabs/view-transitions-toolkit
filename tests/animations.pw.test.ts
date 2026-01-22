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

  test("getAnimations should throw for an invalid identifier", async ({
    page,
  }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/rootonly.html");

    // Start a VT and try to get animations with invalid identifiers
    const result = await page.evaluate(async () => {
      const { getAnimations } = await import("/dist/extract-animations.js");

      const t = document.startViewTransition(() => {});
      await t.ready;

      const errors: { identifier: string; message: string }[] = [];
      const identifiersToTest = ["123", "", "initial", "--foo"];

      for (const identifier of identifiersToTest) {
        try {
          // @ts-expect-error
          getAnimations(t, identifier);
        } catch (e: any) {
          errors.push({ identifier, message: e.message });
        }
      }

      return errors;
    });

    expect(result).toHaveLength(2);
    expect(result[0].identifier).toBe("123");
    expect(result[0].message).toBe(
      `'123' is not a valid view-transition-name.`,
    );
    expect(result[1].identifier).toBe("");
    expect(result[1].message).toBe(`'' is not a valid view-transition-name.`);
  });
});
