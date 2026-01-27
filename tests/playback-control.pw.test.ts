/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";
import { ViewTransitionPart } from "../src/extract-animations.js";

test.describe("Playback Control", () => {
  test("It should correctly play/pause/scrub a transition", async ({
    page,
  }) => {
    // Go to the page with only the root participating in the VT
    await page.goto("http://localhost:7357/tests/spa/rootonly.html");

    // Start a VT and get the activeViewTransition at various stages
    const result = await page.evaluate(async (viewTransitionPartGroup) => {
      const { pause, resume, scrub } =
        await import("/dist/playback-control.js");
      const { getAnimations } = await import("/dist/extract-animations.js");

      let progressAtPause = -1;
      let progressAtScrub = -1;

      const t = document.startViewTransition(async () => {
        // No DOM change needed, we only want to control the animation.
      });
      await t.ready;

      pause(t);
      await new Promise((resolve) => setTimeout(resolve, 100));
      progressAtPause = await getAnimations(
        t,
        "root",
        viewTransitionPartGroup,
      )[0].effect.getComputedTiming().progress;

      scrub(t, 0.5);
      await new Promise((resolve) => setTimeout(resolve, 100));
      progressAtScrub = await getAnimations(
        t,
        "root",
        viewTransitionPartGroup,
      )[0].effect.getComputedTiming().progress;

      resume(t);
      await t.finished;

      return {
        progressAtPause,
        progressAtScrub,
      };
    }, ViewTransitionPart.Group);

    expect(result.progressAtPause).toBe(0);
    expect(result.progressAtScrub).toBe(0.5);
  });
});
