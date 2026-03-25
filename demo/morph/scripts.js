import { morph } from "../js/morph.js";

const $card = document.querySelector('#card');
const $link = document.querySelector('#card a');

$link.addEventListener('click', async (e) => {
	e.preventDefault();
	
	const t = document.startViewTransition(() => {
    $card.classList.toggle('big');
  });

  const css = morph(t, $card, [
    "border-radius",
    "border-width",
    "border-color",
    "background-color",
    "aspect-ratio",
    "font-size"
  ], { duration: 2000, easing: 'ease' });

  if (css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    try {
      await t.finished;
    } finally {
      style.remove();
    }
  }
});
