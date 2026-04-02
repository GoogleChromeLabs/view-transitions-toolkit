/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAutoTypes } from "/dist/navigation.js";

const routeMap = {
  index: `/tests/navigation-types/`,
  detail: `/tests/navigation-types/detail/:id`,
  about: `/tests/navigation-types/about`,
};

useAutoTypes(routeMap);

// For debugging purposes:
window.addEventListener("pageswap", (e) => {
  if (e.viewTransition) {
    localStorage.setItem(
      "pageswapResult",
      JSON.stringify({
        types: e.viewTransition.types ? Array.from(e.viewTransition.types) : [],
        url: window.location.href,
      }),
    );
  }
});

window.addEventListener("pagereveal", (e) => {
  if (e.viewTransition) {
    localStorage.setItem(
      "pagerevealResult",
      JSON.stringify({
        types: e.viewTransition.types ? Array.from(e.viewTransition.types) : [],
        url: window.location.href,
      }),
    );
  }
});
