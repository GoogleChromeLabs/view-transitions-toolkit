/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAutoTypes } from "../js/navigation.js";

const basePath = window.location.pathname.startsWith("/demo") ? "/demo" : "";
const routeMap = {
  index: `${basePath}/navigation-types/demo`,
  detail: `${basePath}/navigation-types/detail/:id`,
  about: `${basePath}/navigation-types/about`,
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
