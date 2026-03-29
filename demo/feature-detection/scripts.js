import { supports } from "../js/feature-detection.js";

const labels = {
  sameDocument:
    "Same-Document View Transitions (<code>document.startViewTransition</code>)",
  types: "View Transition Types (<code>transition.types</code>)",
  crossDocument:
    "Cross-Document View Transitions (<code>@view-transition</code> rule)",
  elementScoped:
    "Element-Scoped View Transitions (<code>Element.startViewTransition</code>)",
  activeViewTransition:
    "Active View Transition tracking (<code>document.activeViewTransition</code>)",
};

const statusLights = document.getElementById("status-lights");
statusLights.innerHTML = Object.entries(supports)
  .map(
    ([key, value]) => `
    <div class="light-item">
      <span class="light-dot ${value ? "on" : "off"}"></span>
      <span class="light-label">${labels[key] || key}</span>
    </div>
  `,
  )
  .join("");

document.getElementById("output").innerText = JSON.stringify(supports, null, 4);
