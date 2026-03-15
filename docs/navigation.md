# Automatic Page Navigation Types

To automatically inject `from-<name>` and `to-<name>` classes into the `ViewTransition` based on the navigation origin and destination, you can use the `useAutoTypes` utility.

This utility listens for `pageswap` and `pagereveal` events and uses a `routeMap` to determine the route names.

## Example

```js
import { useAutoTypes } from "view-transitions-toolkit/navigation";

// Define your routes using URLPattern syntax
const routeMap = {
    "index": "/",
    "detail": "/detail/:id",
    "about": "/about"
};

// Initialize the automatic types
useAutoTypes(routeMap);
```

> [!IMPORTANT]
> To use `useAutoTypes`, you MUST put this code in a render blocking module.
> 
> You can do either:
> 
> ```html
> <script type="module" src="script.js" blocking="render" async></script>
> ```
> 
> Or:
> 
> ```html
> <script type="module" blocking="render" async>
> import { useAutoTypes } from "view-transitions-toolkit/navigation";
> 
> …
> </script>
> ```

In your CSS, you can then target these types using the `:active-view-transition-type` pseudo-class:

```css
/* Target transitions originating from the index page */
:active-view-transition-type(from-index) {
    /* ... */
}

/* Target transitions navigating to a detail page */
:active-view-transition-type(to-detail) {
    /* ... */
}

/* Target transitions from index to about */
:active-view-transition-type(from-index):active-view-transition-type(to-about) {
    /* ... */
}
```
