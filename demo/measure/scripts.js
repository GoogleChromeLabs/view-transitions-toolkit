/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getAnimations,
  ViewTransitionPart,
  extractGeometry,
} from "../js/animations.js";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function moveTo(x, y) {
  const box = document.querySelector(".box");
  box.style.left = `${x}px`;
  box.style.top = `${y}px`;

  const newSize = `${randomBetween(10, 20)}vmin`;
  box.style.inlineSize = newSize;
  box.style.blockSize = newSize;
}

document.body.addEventListener("click", async (e) => {
  if (!document.startViewTransition) {
    moveTo(e.clientX, e.clientY);
  } else {
    const t = document.startViewTransition(() => {
      moveTo(e.clientX, e.clientY);
    });

    await t.ready;

    const boxGroupAnimation = getAnimations(
      t,
      "box",
      ViewTransitionPart.Group,
    )[0];
    const boxGroupGeometry = extractGeometry(boxGroupAnimation);

    document.getElementById("debug").innerText = JSON.stringify(
      boxGroupGeometry,
      null,
      4,
    );
  }
});
