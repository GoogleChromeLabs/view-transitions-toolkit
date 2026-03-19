/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// This demo is a scroll-driven view transition demo, which starts a View Transition
// to adjust the size of the card when scrolling up and down.

// It starts a VT that remains active and updates the VT’s animations based on the scroll position via scrollTop.
// It re-initializes everything on resize, as ongoing VTs get cancelled on resize.
// It only creates the VT when in range.

import { trackActiveViewTransition } from "../js/track-active-view-transition.js";
import { getAnimations } from "../js/animations.js";
import { pause, scrub } from "../js/playback-control.js";

// Make sure document.activeViewTransition is tracked
trackActiveViewTransition();

const go = () => {
  let isReverse = false; // Boolean that keeps track if the animation are playing forwards or in reverse.

  const $card = document.querySelector(".card");
  const $tracks = document.querySelector(".tracks");

  const cardHeight = $card.offsetHeight;
  const cardWidth = $card.offsetWidth;
  const cardHeightSmall = 120; // @TODO: Make this dynamic

  document.documentElement.style.setProperty("--card-large", `${cardHeight}px`);
  document.documentElement.style.setProperty(
    "--card-small",
    `${cardHeightSmall}px`,
  );

  // Determine things to track
  let scrollTimelineStart = 0;
  let scrollTimelineEnd = cardHeight - cardHeightSmall;

  // Make the card faux-sticky, and offset the tracks
  $card.style.width = `${cardWidth}px`;
  $card.style.position = "fixed";
  $card.style.zIndex = "1";
  $card.style.top = "0";
  $tracks.style.paddingTop = `${cardHeight}px`;

  const scrollDistance = scrollTimelineEnd - scrollTimelineStart;

  // Method that starts the View Transition
  const startViewTransition = async () => {
    // Determine if we are going back or not
    isReverse = document.querySelector(".small") ? true : false;

    // Start the View Transition
    document.startViewTransition(() => {
      document.querySelector(".card").classList.toggle("small");
    });
    await document.activeViewTransition.ready;

    // Reverse the individual animations if needed
    if (isReverse) {
      for (const anim of getAnimations(document.activeViewTransition)) {
        anim.reverse();
      }
    }

    // Immediately pause all animations linked to the View Transition
    pause(document.activeViewTransition);

    // Make sure all animations their currentTime is up-to-date
    updateAnimations();

    // The VT finishes when all the animations have reached 100%,
    // i.e. when having scroll past the scrollTimelineEnd offset.
    await document.activeViewTransition.finished;

    // Make sure the card has the correct end state
    if (document.documentElement.scrollTop > scrollTimelineStart) {
      document.querySelector(".card").classList.add("small");
    } else {
      document.querySelector(".card").classList.remove("small");
    }
  };

  // Method that updates the tracked animations
  const updateAnimations = () => {
    // No need to do anything when there are no animations being tracked
    if (!document.activeViewTransition) return;

    // Determine scroll Progress (ranging from 0 to 1)
    const scrollProgress =
      (document.documentElement.scrollTop - scrollTimelineStart) /
      scrollDistance;

    // Scrub The View Transition
    scrub(
      document.activeViewTransition,
      isReverse ? 1 - scrollProgress : scrollProgress,
    );
  };

  const checkScrollPosition = async () => {
    // In-range: start or update the VT
    if (
      document.documentElement.scrollTop > scrollTimelineStart &&
      document.documentElement.scrollTop < scrollTimelineEnd
    ) {
      if (!document.activeViewTransition) {
        startViewTransition();
      } else {
        updateAnimations();
      }
    }

    // Outside of the range: clean up the VT
    else {
      // Explicitly clear the VT when outside the range.
      // This because when undershooting the scrollTimelineStart offset, the VT doesn’t finish automatically
      // (When overshooting the scrollTimelineEnd offset it does cancel automatically)
      if (document.activeViewTransition) {
        document.activeViewTransition.skipTransition();
      }

      // Make sure the card has the correct class depending on the scroll offset
      if (document.documentElement.scrollTop >= scrollTimelineEnd) {
        document.querySelector(".card:not(.small)")?.classList.add("small");
      } else {
        document.querySelector(".card.small")?.classList.remove("small");
      }
    }
  };

  // Add a scroll listener, and update the viewTransition based on the active offset
  window.addEventListener("scroll", checkScrollPosition);

  // On resize View Transitions get cancelled, so we need to make sure we’re at the correct state again
  // @TODO: Debounce this
  window.addEventListener("resize", checkScrollPosition);

  // Make sure the card has the correct class when already at the specific offset
  checkScrollPosition();
};

window.addEventListener("load", () => {
  go();
});
