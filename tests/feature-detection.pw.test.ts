/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect, type Page } from "@playwright/test";
import { expectedResults } from "./test-data.js";

test.describe("Feature Support", () => {
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
