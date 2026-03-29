/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAutoTypes } from "../js/navigation.js";

// Because this demo can be hosted anywhere (in a root, or a subfolder) we need to determine the basePath
// that acts as as a prefix to the routes.
const basePath = window.location.pathname.substring(
  0,
  window.location.pathname.indexOf("/navigation-types"),
);
const routeMap = {
  index: `${basePath}/navigation-types/demo{.html}?`,
  detail: `${basePath}/navigation-types/detail/:id{.html}?`,
  about: `${basePath}/navigation-types/about{.html}?`,
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
