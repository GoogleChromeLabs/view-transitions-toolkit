/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type SupportsData = {
  sameDocument: boolean;
  types: boolean;
  crossDocument: boolean;
  elementScoped: boolean;
  activeViewTransition: boolean;
};

export type SupportsMatrix = {
  [key: string]: SupportsData;
};

export const expectedResults: SupportsMatrix = {
  "chromium-145": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    elementScoped: false,
    activeViewTransition: true,
  },
  "firefox-146": {
    sameDocument: true,
    types: false,
    crossDocument: false,
    elementScoped: false,
    activeViewTransition: false,
  },
  "webkit-26": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    elementScoped: false,
    activeViewTransition: true,
  },
  "chromium-140": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    elementScoped: false,
    activeViewTransition: false,
  },
  "webkit-18": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    elementScoped: false,
    activeViewTransition: false,
  },
  "firefox-142": {
    sameDocument: false,
    types: false,
    crossDocument: false,
    elementScoped: false,
    activeViewTransition: false,
  },
};
