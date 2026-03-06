/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from "@playwright/test";
import { extractViewTransitionName } from "../src/util.js";

test.describe("util", () => {
  test("extractViewTransitionName", () => {
    expect(extractViewTransitionName("::view-transition-group(thing)")).toBe(
      "thing",
    );
    expect(extractViewTransitionName("::view-transition-old(thing)")).toBe(
      "thing",
    );
    expect(
      extractViewTransitionName("::view-transition-new(thing-with-hyphen)"),
    ).toBe("thing-with-hyphen");
    expect(
      extractViewTransitionName("::view-transition-image-pair(thing)"),
    ).toBe("thing");
    expect(
      extractViewTransitionName("::view-transition-group-children(root)"),
    ).toBe("root");
    expect(extractViewTransitionName("::view-transition-foo(bar)")).toBe(null);
    expect(extractViewTransitionName("::view-transition-group()")).toBe(null);
    expect(extractViewTransitionName("not-a-vt-pseudo")).toBe(null);
    expect(extractViewTransitionName(undefined)).toBe(null);
    expect(
      extractViewTransitionName("::view-transition-old(thing)garbage"),
    ).toBe(null);
    expect(
      extractViewTransitionName("garbage::view-transition-old(thing)"),
    ).toBe(null);
  });
});
