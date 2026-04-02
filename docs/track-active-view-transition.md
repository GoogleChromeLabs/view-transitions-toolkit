# Shim `document.activeViewTransition`

[View Demo](https://chrome.dev/view-transitions-toolkit/scroll-driven-view-transition/)

Shim support for `document.activeViewTransition`. If supported natively, this won’t override whatever that was installed.

Because of their different nature, installation is different for use with Same-Document View Transitions and Cross-Document View Transitions.

- Same-Document View Transitions: Invoke the following before you rely on `document.activeViewTransition`:

    ```js
    import { trackActiveViewTransition } from "view-transitions-toolkit/track-active-view-transition";
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
