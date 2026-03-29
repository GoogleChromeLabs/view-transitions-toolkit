import { getAnimations } from "../js/animations.js";

const positions = ["start", "end", "center"];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomize() {
  document.body.style.alignContent = positions[randomBetween(0, 2)];
  document.body.style.justifyContent = positions[randomBetween(0, 2)];

  const newSize = `${randomBetween(10, 20)}vmin`;
  document.querySelector(".box").style.inlineSize = newSize;
  document.querySelector(".box").style.blockSize = newSize;
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
    randomize();
  } else {
    const t = document.startViewTransition(() => {
      randomize();
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
