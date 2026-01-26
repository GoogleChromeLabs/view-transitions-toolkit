/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export type SupportsData = {
  sameDocument: boolean;
  types: boolean;
  crossDocument: boolean;
  activeViewTransition: boolean;
};

export type SupportsMatrix = {
  [key: string]: SupportsData;
};

export const expectedResults: SupportsMatrix = {
  chromium: {
    sameDocument: true,
    types: true,
    crossDocument: true,
    activeViewTransition: true,
  },
  firefox: {
    sameDocument: true,
    types: false,
    crossDocument: false,
    activeViewTransition: false,
  },
  webkit: {
    sameDocument: true,
    types: true,
    crossDocument: true,
    activeViewTransition: true,
  },
  "chromium-140": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    activeViewTransition: false,
  },
  "webkit-18": {
    sameDocument: true,
    types: true,
    crossDocument: true,
    activeViewTransition: false,
  },
  "firefox-142": {
    sameDocument: false,
    types: false,
    crossDocument: false,
    activeViewTransition: false,
  },
};
