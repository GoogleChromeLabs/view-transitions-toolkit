/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from "@playwright/test";

type SupportsData = {
  sameDocument: boolean;
  types: boolean;
  crossDocument: boolean;
  activeViewTransition: boolean;
};

type SupportsMatrix = {
  [key: string]: SupportsData;
};

test.describe("Feature Support", () => {
  const expectedResults: SupportsMatrix = {
    chromium: {
      sameDocument: true,
      types: true,
      crossDocument: true,
      activeViewTransition: true,
    },
    firefox: {
      sameDocument: true,
      types: false,
      crossDocument: false,
      activeViewTransition: false,
    },
    webkit: {
      sameDocument: true,
      types: true,
      crossDocument: true,
      activeViewTransition: true,
    },
    "chromium-140": {
      sameDocument: true,
      types: true,
      crossDocument: true,
      activeViewTransition: false,
    },
    "webkit-18": {
      sameDocument: true,
      types: true,
      crossDocument: true,
      activeViewTransition: false,
    },
    "firefox-142": {
      sameDocument: false,
      types: false,
      crossDocument: false,
      activeViewTransition: false,
    },
  };

  test("It should correctly feature detect features", async ({
    page,
  }, testInfo) => {
    // Go to just about any page
    await page.goto("http://localhost:7357/tests/index.html");

    // Start a VT and get the activeViewTransition at various stages
    const result = await page.evaluate(async () => {
      const { supports } = await import("/dist/feature-detection.js");
      return supports;
    });

    expect(result).toEqual(expectedResults[testInfo.project.name]);
  });
});
