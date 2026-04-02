# Feature Detection

[View Demo](https://chrome.dev/view-transitions-toolkit/feature-detection/)

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
