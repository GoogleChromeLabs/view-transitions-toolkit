import { optimizeGroupAnimations } from "../js/optimize.js";

// Add intermittent Jank to the page
setInterval(() => {
  const start = performance.now();
  document.documentElement.classList.add("jank");
  document.documentElement.offsetHeight;

  setTimeout(() => {
    while (start + 1000 > performance.now()) {
      window.a = performance.now();
    }

    document.documentElement.classList.remove("jank");
  }, 100);
}, 5000);

// Helper functions and vars, supporting the VT
function mutateTheDOM() {
  const curAlignItems = document.body.style.alignItems;
  document.body.style.alignItems = curAlignItems == "end" ? "start" : "end";
  document.body.querySelectorAll(".box").forEach(($box) => {
    $box.classList.toggle("bigger");
  });
}

// Start a VT whenever the
document.body.addEventListener("click", async (e) => {
  if (!document.startViewTransition) {
    mutateTheDOM();
  } else {
    const t = document.startViewTransition(() => {
      mutateTheDOM();
    });
    await t.ready;

    optimizeGroupAnimations(t, "box-flip");
  }
});
