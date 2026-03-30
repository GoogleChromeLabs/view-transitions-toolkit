import { getAnimations } from "../js/animations.js";

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

// Converts an array to an object with the specified key
const toObject = (arr, key, mapper = (item) => item) => {
  return arr.reduce((acc, item) => {
    acc[item[key]] = mapper(item);
    return acc;
  }, {});
};

document.body.addEventListener("click", async (e) => {
  if (!document.startViewTransition) {
    moveTo(e.clientX, e.clientY);
  } else {
    const t = document.startViewTransition(() => {
      moveTo(e.clientX, e.clientY);
    });

    await t.ready;

    const animations = getAnimations(t, "box");

    document.getElementById("debug").innerText = JSON.stringify(
      toObject(animations, "animationName", (a) => ({
        pseudo: a.effect.pseudoElement,
        keyframes: a.effect.getKeyframes(),
      })),
      null,
      4,
    );
  }
});
