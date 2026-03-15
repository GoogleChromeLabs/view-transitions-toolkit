# Misc Utilities

## `setTemporaryViewTransitionNames`

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

## `extractViewTransitionName`

Extracts the view transition name from a VT pseudo-element selector;

```js
import { extractViewTransitionName } from "view-transitions-toolkit/misc";

const name = extractViewTransitionName('::view-transition-new(box-flip)');
console.log(name); // 'box-flip'
```
