# Animations

This section covers utilities for extracting, measuring, and optimizing animations in View Transitions.

## Extract Animations

[View Demo](https://chrome.dev/view-transitions-toolkit/get-animations/)

Get the animations linked to a View Transition

- Get all animations:

    ```js
    import { getAnimations } from "view-transitions-toolkit/animations";

    const t = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to any VT-pseudo
    const animations = getAnimations(t);
    ```

    ```js
    // @TODO: Include Output here
    ```

- Get animations linked to a all VT-pseudos of a specific captured element (based on its `view-transition-name`):

    ```js
    import { getAnimations } from "view-transitions-toolkit/animations";

    const t = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the box VT-pseudos
    const animations = getAnimations(t, "box");
    ```

    ```js
    // @TODO: Include Output here
    ```

    The passed in value must be a valid `view-transition-name` value. Using `*` is also accepted, which is the equivalent of `getAnimations(viewTransition)`.

- Get animations linked to a all VT-pseudos of a an array of specific captured elements (based on its `view-transition-name`):

    ```js
    import { getAnimations } from "view-transitions-toolkit/animations";

    const t = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the box1 and box2 VT-pseudos
    const animations = getAnimations(t, ["box1", "box2"]);;
    ```

    ```js
    // @TODO: Include Output here
    ```

    The passed in value must be an array with valid `view-transition-name` values.

- Get animations linked to a specific VT-pseudo of a specific captured element (based on its `view-transition-name`):

    ```js
    import { getAnimations, ViewTransitionPart } from "view-transitions-toolkit/animations";

    const t = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the `::view-transition-group(box)` pseudo.
    const animations = getAnimations(t, "box", ViewTransitionPart.Group);
    ```

    ```js
    // @TODO: Include Output here
    ```

    _(TIP: If you want to capture all `::view-transition-group()` animations, call `getAnimations(viewTransition, '*', ViewTransitionPart.Group)`)_

## Measuring Tools

[View Demo](https://chrome.dev/view-transitions-toolkit/measure/)

```js
import { getAnimations, ViewTransitionPart, extractGeometry } from "view-transitions-toolkit/animations";

const t = document.startViewTransition(() => { … });
await t.ready;

const boxGroupAnimation = getAnimations(t, "box", ViewTransitionPart.Group)[0];
const boxGroupGeometry = extractGeometry(boxGroupAnimation);

console.log(boxGroupGeometry);
```

```json
{
    "before": {
        "width": 199.391,
        "height": 199.391,
        "left": 1504.5,
        "top": 24
    },
    "after": {
        "width": 199.391,
        "height": 199.391,
        "left": 1504.5,
        "top": 399
    }
}
```

## Animation Optimization

[View Demo](https://chrome.dev/view-transitions-toolkit/optimize/)

The Animation Optimization feature allows you to change the underlying animations of a View Transition's `::view-transition-group` pseudo-elements. Instead of animating `width` and `height`, this utility function will animate the element's `transform` instead to achieve the same visual effect. This is a more performant way to handle size+position changes in View Transitions.

You can optimize the animations for all `::view-transition-group`s at once, or target specific ones.

You can choose from several optimization strategies, which control:

- `OPTIMIZATION_STRATEGY.SCALE`: (Default) Animates both position and size using `transform` and `scale`.
- `OPTIMIZATION_STRATEGY.SLIDE`: Animates the position using `transform` but does not scale the element. The `width` and `height` are set to the final size.
- `OPTIMIZATION_STRATEGY.NONE`: Disables optimization for the selected elements.

The default is `OPTIMIZATION_STRATEGY.SCALE`, as that is the most performant. It can, however, visually distort things.

### Automatically optimizing all `::view-transition-group` animations

```js
import { optimizeGroupAnimations, OPTIMIZATION_STRATEGY } from "view-transitions-toolkit/animations";

const t = document.startViewTransition(() => { … });
await t.ready;

// Optimize all Group Animations using the default SCALE strategy
optimizeGroupAnimations(t, "*");

// Optimize only the `::view-transition-group(box-flip)` animation using the SLIDE strategy
optimizeGroupAnimations(t, "box-flip", OPTIMIZATION_STRATEGY.SLIDE);

// Get the names of the optimized animations
const optimizedNames = optimizeGroupAnimations(t, "*", OPTIMIZATION_STRATEGY.SCALE);
console.log(optimizedNames); // e.g., ['root', 'box-flip']
```

### Manually optimizing all `::view-transition-group` animations

```js
import { getAnimations, ViewTransitionPart, extractGeometry, optimizeAnimation } from "view-transitions-toolkit/animations";

const t = document.startViewTransition(() => { … });
await t.ready;

const groupAnimations = getAnimations(t, "*", ViewTransitionPart.Group);
groupAnimations.forEach((a) => {
  const geometry = extractGeometry(a);
  optimizeAnimation(a, geometry);
});
```

### Needed CSS

To use this optimization, you must include the following CSS in your stylesheet. This CSS is necessary because the optimization logic relies on it to properly contain the transformed pseudo-element.

```css
::view-transition-new(*),
::view-transition-old(*) {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
```

If you don’t want to apply this broad CSS to _all_ `::view-transition-old` and `::view-transition-new` pseudo-elements, you will need to construct and inject the required CSS yourself. The `optimizeGroupAnimations` function returns an array of the `view-transition-name`s of the animations that were successfully optimized. If you loop over that array, you can construct your own (more limited) CSS rules to manually inject. If no groups were optimized, the result is an empty array.
When manually calling `optimizeGroupAnimation`, the result of that function is the name of the group that was optimized. If no group was optimized, the result is `false`.

```js
import { optimizeGroupAnimations } from "view-transitions-toolkit/animations";

const t = document.startViewTransition(() => { … });
await t.ready;

const optimizedGroups = optimizeGroupAnimations(t, "*");
const cssRules = [];
optimizedGroups.forEach(optimizedGroupName => {
  cssRules.push(buildCSSForViewTransitionName(optimizedGroupName));
});
injectCSS(cssRules);
```
