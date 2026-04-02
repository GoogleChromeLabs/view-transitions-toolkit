/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";
import { expectedResults } from "./test-data.js";

test.describe("Navigation Types", () => {
  test("should apply types and style boxes during transition", async ({
    page,
  }, testInfo) => {
    // Skip test when run inside a GitHub action
    test.skip(!!process.env.GITHUB_RUN_ID, "Failing in GitHub Actions");

    // Skip test when no cross-document support or no types support
    test.skip(
      !expectedResults[testInfo.project.name]?.crossDocument,
      "Requires cross-document support",
    );
    test.skip(
      !expectedResults[testInfo.project.name]?.types,
      "Requires types support",
    );

    // WebKit 18 does not seem to like this test … manually skipping
    test.skip(
      testInfo.project.name === "webkit-18",
      "WebKit 18 does not like this test",
    );

    // Go to the test’s home page
    await page.goto("http://localhost:7357/tests/navigation-types/");

    // Clear localStorage before navigation
    await page.evaluate(() => {
      localStorage.removeItem("pageswapResult");
      localStorage.removeItem("pagerevealResult");
    });

    // Click 'Detail 1'
    await page.locator('a[href="/tests/navigation-types/detail/1"]').click();

    // Wait for the navigation to complete
    await page.waitForURL("**/tests/navigation-types/detail/1");

    // Read results from localStorage
    const pageswapResult = await page.evaluate(() => {
      const data = localStorage.getItem("pageswapResult");
      return data ? JSON.parse(data) : null;
    });

    const pagerevealResult = await page.evaluate(() => {
      const data = localStorage.getItem("pagerevealResult");
      return data ? JSON.parse(data) : null;
    });

    // Assert types
    expect(pageswapResult).toBeTruthy();
    expect(pagerevealResult).toBeTruthy();

    expect(pageswapResult.types).toContain("from-index");
    expect(pageswapResult.types).toContain("to-detail");

    expect(pagerevealResult.types).toContain("from-index");
    expect(pagerevealResult.types).toContain("to-detail");

    // Now navigate back to Home?
    // Detail 1 -> Home
    // from: detail -> from-detail should be active
    // to: index -> to-index should be active
    // Reset testResult for next transition
    // Clear localStorage before navigation
    await page.evaluate(() => {
      localStorage.removeItem("pageswapResult");
      localStorage.removeItem("pagerevealResult");
    });

    // Click 'Home' via relative link
    await page.locator('a[href="/tests/navigation-types/"]').click();

    // Wait for the navigation to complete
    await page.waitForURL("**/tests/navigation-types/");

    // Read results from localStorage
    const nextPageswapResult = await page.evaluate(() => {
      const data = localStorage.getItem("pageswapResult");
      return data ? JSON.parse(data) : null;
    });

    const nextPagerevealResult = await page.evaluate(() => {
      const data = localStorage.getItem("pagerevealResult");
      return data ? JSON.parse(data) : null;
    });

    // Assert types
    expect(nextPageswapResult).toBeTruthy();
    expect(nextPagerevealResult).toBeTruthy();

    expect(nextPageswapResult.types).toContain("from-detail");
    expect(nextPageswapResult.types).toContain("to-index");

    expect(nextPagerevealResult.types).toContain("from-detail");
    expect(nextPagerevealResult.types).toContain("to-index");
  });
});
