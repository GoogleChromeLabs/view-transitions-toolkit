import { getAnimations, ViewTransitionPart } from "../js/extract-animations.js";
import { extractGeometry } from "../js/measure.js";

const positions = ["start", "end", "center"];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function setRandomAlignments() {
  document.body.style.alignContent = positions[getRandomInt(3)];
  document.body.style.justifyContent = positions[getRandomInt(3)];
}

document.body.addEventListener("click", async (e) => {
  if (!document.startViewTransition) {
    setRandomAlignments();
  } else {
    const t = document.startViewTransition(() => {
      setRandomAlignments();
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
