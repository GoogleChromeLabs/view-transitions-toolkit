/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  optimizeGroupAnimations,
  getAnimations,
  ViewTransitionPart,
} from "../js/animations.js";

// Add intermittent Jank to the page
setInterval(() => {
  const start = performance.now();
  document.documentElement.classList.add("jank");
  document.documentElement.offsetHeight;

  setTimeout(() => {
    while (start + 1000 > performance.now()) {
      window.a = performance.now();
    }

    document.documentElement.classList.remove("jank");
  }, 100);
}, 5000);

// Helper functions and vars, supporting the VT
function mutateTheDOM() {
  const curAlignItems = document.body.style.alignItems;
  document.body.style.alignItems = curAlignItems == "end" ? "start" : "end";
  document.body.querySelectorAll(".box").forEach(($box) => {
    $box.classList.toggle("bigger");
  });
}

// Start a VT whenever the
document.body.addEventListener("click", async (e) => {
  if (!document.startViewTransition) {
    mutateTheDOM();
  } else {
    const t = document.startViewTransition(() => {
      mutateTheDOM();
    });
    await t.ready;

    optimizeGroupAnimations(t, "box-optimized");

    // Dump the generated keyframes
    const animations = getAnimations(t, "*", ViewTransitionPart.Group);
    const animationKeyframes = {
      regular: animations[0].effect.getKeyframes(),
      optimized: animations[1].effect.getKeyframes(),
    };
    document.getElementById("debug").innerText = JSON.stringify(
      animationKeyframes,
      null,
      4,
    );
  }
});
