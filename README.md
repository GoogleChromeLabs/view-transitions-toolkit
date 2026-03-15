# View Transitions Toolkit

A collection of utility functions to more easily work with View Transitions

## Installation

```bash
npm i view-transitions-toolkit
```

## The Toolkit

The Toolkit consists of several modules, each providing a set of utility functions:

- **[Feature Detection](./docs/feature-detection.md)**: Get information about whether certain View Transitions subfeatures are supported.
- **[Shim `document.activeViewTransition`](./docs/track-active-view-transition.md)**: Shim support for `document.activeViewTransition`.
- **[Animations](./docs/animations.md)**: Utilities for extracting, measuring, and optimizing animations.
- **[Transition Playback Control](./docs/playback-control.md)**: Pause, Resume, or Scrub the playback of a View Transition.
- **[Automatic Page Navigation Types](./docs/navigation.md)**: Automatically inject View Transition Types based on navigation origin/destination.
- **[Misc Utilities](./docs/misc.md)**: Other helper functions like `setTemporaryViewTransitionNames` and `extractViewTransitionName`.

## Demos

Demos are included in this repository. Run `npm run start` and visit `http://127.0.0.1:3000/` to see the demos.

```bash
npm run dev
```

## License

`view-transitions-toolkit` is released under the Apache 2.0 License. See the enclosed [`LICENSE`](./LICENSE) for details.

## Contributing

We'd love to accept your patches and contributions to this project. See the enclosed [`CONTRIBUTING`](./CONTRIBUTING.md) for details.

## Disclaimer

This is not an officially supported Google product. This project is not eligible for the [Google Open Source Software Vulnerability Rewards Program](https://bughunters.google.com/open-source-security).
