/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const supports = {
  sameDocument: !!document.startViewTransition,
  types: "ViewTransitionTypeSet" in window,
  crossDocument: "CSSViewTransitionRule" in window,
  activeViewTransition: "activeViewTransition" in Document.prototype,
};

export { supports };
