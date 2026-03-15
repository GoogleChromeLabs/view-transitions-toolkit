# View Transitions Toolkit

A collection of utility functions to more easily work with View Transitions

## Installation

```bash
npm i view-transitions-toolkit
```

## The Toolkit

### Feature Detection

Get information about whether certain View Transitions subfeatures are supported or not.

```js
import { supports } from "view-transitions-toolkit/feature-detection";
console.log(supports);
```

```js
{
  sameDocument: true,           // Support for Same-Document View Transitions
  types: true,                  // Support for View Transition Types
  crossDocument: false,         // Support for Cross-Document View Transitions
  elementScoped: false,         // Support for Element-Scoped View Transitions
  activeViewTransition: false,  // Support for document.activeViewTransition
};
```

### Shim `document.activeViewTransition`

Shim support for `document.activeViewTransition`. If supported natively, this won’t override whatever that was installed.

Because of their different nature, installation is different for use with Same-Document View Transitions and Cross-Document View Transitions.

- Same-Document View Transitions: Invoke the following before you rely on `document.activeViewTransition`:

    ```js
    import { trackActiveViewTransition } "view-transitions-toolkit/track-active-view-transition";
    trackActiveViewTransition();
    ```

- Cross-Document View Transitions: Include the following scripts in your HTML, before you rely on any `document.activeViewTransition` functionality:

    ```html
    <script type="module" blocking="render">
      import { trackActiveViewTransition } from "view-transitions-toolkit/track-active-view-transition";
      window.trackActiveViewTransition = trackActiveViewTransition();
    </script>
    <script>
      window.addEventListener("pageswap", (e) => {
        if (e.viewTransition) {
          window.trackActiveViewTransition(e.viewTransition);
        }
      });
      window.addEventListener("pagereveal", (e) => {
        if (e.viewTransition) {
          window.trackActiveViewTransition(e.viewTransition);
        }
      });
    </script>
    ```

    _TIP: Most likely you won’t need this_

### Extract Animations

Get the animations linked to a View Transition

- Get all animations:

    ```js
    import { getAnimations } from "view-transitions-toolkit/extract-animations";

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
    import { getAnimations } from "view-transitions-toolkit/extract-animations";

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
    import { getAnimations } from "view-transitions-toolkit/extract-animations";

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
    import { getAnimations, ViewTransitionPart } from "view-transitions-toolkit/extract-animations";

    const t = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the `::view-transition-group(box)` pseudo.
    const animations = getAnimations(t, "box", ViewTransitionPart.Group);
    ```

    ```js
    // @TODO: Include Output here
    ```

    _(TIP: If you want to capture all `::view-transition-group()` animations, call `getAnimations(viewTransition, '*', ViewTransitionPart.Group)`)_

### Transition Playback Control

Control the playback of a View Transition

```js
import { pause, resume, scrub } from "view-transitions-toolkit/playback-control";

const t = document.startViewTransition(() => { … });
await t.ready;

pause(t); // Pauses all VT animations
resume(t); // Resumses all VT animations
scrub(t, 0.5); // Sets all VT animations to 50% playback (and pauses them along the way)
```

### Measuring Tools

```js
import { getAnimations, ViewTransitionPart } from "view-transitions-toolkit/extract-animations";
import { extractGeometry } from "view-transitions-toolkit/extract-geometry";

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

### Animation Optimization

The Animation Optimization feature allows you to change the underlying animations of a View Transition's `::view-transition-group` pseudo-elements. Instead of animating `width` and `height`, this utility function will animate the element's `transform` instead to achieve the same visual effect. This is a more performant way to handle size+position changes in View Transitions.

You can optimize the animations for all `::view-transition-group`s at once, or target specific ones.

You can choose from several optimization strategies, which control:

- `OPTIMIZATION_STRATEGY.SCALE`: (Default) Animates both position and size using `transform` and `scale`.
- `OPTIMIZATION_STRATEGY.SLIDE`: Animates the position using `transform` but does not scale the element. The `width` and `height` are set to the final size.
- `OPTIMIZATION_STRATEGY.NONE`: Disables optimization for the selected elements.

The default is `OPTIMIZATION_STRATEGY.SCALE`, as that is the most performant. It can, however, visually distort things.

#### Automatically optimizing all `::view-transition-group` animations

```js
import { optimizeGroupAnimations, OPTIMIZATION_STRATEGY } from "view-transitions-toolkit/optimize";

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

#### Manually optimizing all `::view-transition-group` animations

```js
import { getAnimations, ViewTransitionPart } from "view-transitions-toolkit/extract-animations";
import { extractGeometry } from "view-transitions-toolkit/measure";
import { optimizeAnimation } from "view-transitions-toolkit/optimize";

const t = document.startViewTransition(() => { … });
await t.ready;

const groupAnimations = getAnimations(t, "*", ViewTransitionPart.Group);
groupAnimations.forEach((a) => {
  const geometry = extractGeometry(a);
  optimizeAnimation(a, geometry);
});
```

#### Needed CSS

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
import { optimizeGroupAnimations } from "view-transitions-toolkit/optimize";

const t = document.startViewTransition(() => { … });
await t.ready;

const optimizedGroups = optimizeGroupAnimations(t, "*");
const cssRules = [];
optimizedGroups.forEach(optimizedGroupName => {
  cssRules.push(buildCSSForViewTransitionName(optimizedGroupName));
});
injectCSS(cssRules);
```

### Automatic Page Navigation Types

```js
// @TODO
```

### Misc Utilities

#### `setTemporaryViewTransitionNames`

When using the `pageswap` and `pagereveal` events, you can use this function to temporarily set the `view-transition-name` of elements and clean them up after the transition promise resolves or rejects.

- Without this utility:

  ```js
  window.addEventListener('pageswap', async (e) => {
    if (e.viewTransition) {
      const targetUrl = new URL(e.activation.entry.url);

      // Navigating to a profile page
      if (isProfilePage(targetUrl)) {
        const profile = extractProfileNameFromUrl(targetUrl);

        // Set view-transition-name values on the clicked row
        document.querySelector(`#${profile} span`).style.viewTransitionName = 'name';
        document.querySelector(`#${profile} img`).style.viewTransitionName = 'avatar';

        // Remove view-transition-names after snapshots have been taken
        // (this to deal with BFCache)
        await e.viewTransition.finished;
        document.querySelector(`#${profile} span`).style.viewTransitionName = 'none';
        document.querySelector(`#${profile} img`).style.viewTransitionName = 'none';
      }
    }
  });
  ```

- With this utility:

  ```js
  import { setTemporaryViewTransitionNames } from "view-transitions-toolkit/misc";

  window.addEventListener('pageswap', async (e) => {
    if (e.viewTransition) {
      const targetUrl = new URL(e.activation.entry.url);

      // Navigating to a profile page
      if (isProfilePage(targetUrl)) {
        const profile = extractProfileNameFromUrl(targetUrl);

        // Set view-transition-name values on the clicked row
        // Clean up after the page got replaced
        setTemporaryViewTransitionNames([
          [document.querySelector(`#${profile} span`), 'name'],
          [document.querySelector(`#${profile} img`), 'avatar'],
        ], e.viewTransition.finished);
      }
    }
  });
  ```

#### `extractViewTransitionName`

Extracts the view transition name from a VT pseudo-element selector;

```js
import { extractViewTransitionName } from "view-transitions-toolkit/misc";

const name = extractViewTransitionName('::view-transition-new(box-flip)');
console.log(name); // 'box-flip'
```

## Demos

Demos are included in this repository. Run `npm run start` and visit `http://127.0.0.1:3000/` to see the demos.

```bash
npm run dev
```

## License

`view-transitions-utilities` is released under the Apache 2.0 License. See the enclosed [`LICENSE`](./LICENSE) for details.

## Contributing

We'd love to accept your patches and contributions to this project. See the enclosed [`CONTRIBUTING`](./CONTRIBUTING) for details.

## Disclaimer

This is not an officially supported Google product. This project is not eligible for the [Google Open Source Software Vulnerability Rewards Program](https://bughunters.google.com/open-source-security).
