/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from "@playwright/test";

test.describe("Active Tracker", () => {
  test("It should set/unset document.activeViewTransition (SPA)", async ({
    page,
  }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/spa/rootonly.html");

    // Start a VT and get the activeViewTransition at various stages
    const result = await page.evaluate(async () => {
      const { setupActiveViewTransitionTracking } =
        await import("/dist/active-tracker.js");
      setupActiveViewTransitionTracking("same-document");

      const activeViewTransitionBeforeOK =
        document.activeViewTransition === null;

      const t = document.startViewTransition(() => {});
      await t.ready;
      const activeViewTransitionDuringOK = document.activeViewTransition === t;

      await t.finished;
      const activeViewTransitionAfterOK =
        document.activeViewTransition === null;

      return {
        activeViewTransitionBeforeOK,
        activeViewTransitionDuringOK,
        activeViewTransitionAfterOK,
      };
    });

    expect(result.activeViewTransitionBeforeOK).toBe(true);
    expect(result.activeViewTransitionDuringOK).toBe(true);
    expect(result.activeViewTransitionAfterOK).toBe(true);
  });

  test("It should set the correct document.activeViewTransition when starting consecutive VTs (SPA)", async ({
    page,
  }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/spa/rootonly.html");

    // Start a VT and get the activeViewTransition at various stages
    const result = await page.evaluate(async () => {
      const { setupActiveViewTransitionTracking } =
        await import("/dist/active-tracker.js");
      setupActiveViewTransitionTracking("same-document");

      const t1 = document.startViewTransition(() => {});
      await t1.ready;
      const activeViewTransitionDuringVT1OK =
        document.activeViewTransition === t1;

      const t2 = document.startViewTransition(() => {});
      await t2.ready;
      const activeViewTransitionDuringVT2OK =
        document.activeViewTransition === t2;

      return {
        activeViewTransitionDuringVT1OK,
        activeViewTransitionDuringVT2OK,
      };
    });

    expect(result.activeViewTransitionDuringVT1OK).toBe(true);
    expect(result.activeViewTransitionDuringVT2OK).toBe(true);
  });

  test("It should set/unset document.activeViewTransition (MPA)", async ({
    page,
  }, testInfo) => {
    // Go to start of MPA
    await page.goto("http://localhost:7357/tests/mpa/index.html");

    // Navigate to next page
    await page.getByRole("link").click();
    await page.waitForURL("**/index2.html");

    // Start a VT and get the activeViewTransition at various stages
    const result = await page.evaluate(async () => {
      return {
        nativeCrossDocumentViewtransitionSupport,
        nativeActiveViewTransitionSupport,
        thereWasAViewTransitionDuringPageReveal,
        thereWasAnActiveViewTransitionDuringPageReveal,
        theViewTransitionDuringPageRevealMatchedTheActiveViewTransition,
      };
    });

    test.skip(
      !result.nativeCrossDocumentViewtransitionSupport,
      `Browser has no support for Cross-Document View Transitions`,
    );
    test.skip(
      result.nativeActiveViewTransitionSupport,
      `Browser has native support for document.activeViewTransition`,
    );

    expect(result.thereWasAViewTransitionDuringPageReveal).toBe(true);
    expect(result.thereWasAnActiveViewTransitionDuringPageReveal).toBe(true);
    expect(
      result.theViewTransitionDuringPageRevealMatchedTheActiveViewTransition,
    ).toBe(true);
  });
});
