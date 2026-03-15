# Transition Playback Control

Control the playback of a View Transition

```js
import { pause, resume, scrub } from "view-transitions-toolkit/playback-control";

const t = document.startViewTransition(() => { … });
await t.ready;

pause(t); // Pauses all VT animations
resume(t); // Resumses all VT animations
scrub(t, 0.5); // Sets all VT animations to 50% playback (and pauses them along the way)
```
