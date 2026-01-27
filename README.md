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
import { supports } from 'view-transitions-toolkit/feature-detection';
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
    import { trackActiveViewTransition } from 'view-transitions-toolkit/track-active-view-transition';
    trackActiveViewTransition();
    ```

- Cross-Document View Transitions: Include the following scripts in your HTML, before you rely on any `document.activeViewTransition` functionality:

    ```html
    <script type="module" blocking="render">
      import { trackActiveViewTransition } from "/dist/track-active-view-transition.js";
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
    import { getAnimations } from 'view-transitions-toolkit/extract-animations';

    const viewTransition = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to any VT-pseudo
    const animations = getAnimations(viewTransition);
    ```

    ```js
    // @TODO: Include Output here
    ```

- Get animations linked to a all VT-pseudos of a specific captured element (based on its `view-transition-name`):

    ```js
    import { getAnimations } from 'view-transitions-toolkit/extract-animations';

    const viewTransition = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the box VT-pseudos
    const animations = getAnimations(viewTransition, 'box');
    ```

    ```js
    // @TODO: Include Output here
    ```

    The passed in value must be a valid `view-transition-name` value. Using `*` is also accepted, which is the equivalent of `getAnimations(viewTransition)`.

- Get animations linked to a specific VT-pseudo of a specific captured element (based on its `view-transition-name`):

    ```js
    import { getAnimations, ViewTransitionPart } from 'view-transitions-toolkit/extract-animations';

    const viewTransition = document.startViewTransition(() => { … });
    await t.ready;

    // Get the animations linked to the `::view-transition-group(box)` pseudo.
    const animations = getAnimations(viewTransition, 'box', ViewTransitionPart.Group);
    ```

    ```js
    // @TODO: Include Output here
    ```

    _(TIP: If you want to capture all `::view-transition-group()` animations, call `getAnimations(viewTransition, '*', ViewTransitionPart.Group)`)_

### Transition Playback Control

Control the playback of a View Transition

```js
import { pause, resume, scrub } from '../js/playback-control.js';

pause(vt); // Pauses all VT animations
resume(vt); // Resumses all VT animations
scrub(vt, 0.5); // Sets all VT animations to 50% playback (and pauses them along the way)
```

### `setTemporaryViewTransitionNames`

```js
// @TODO
```

### Measuring Tools

```js
// @TODO
```

### Automatic Page Navigation Types

```js
// @TODO
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
