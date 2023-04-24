# processing-motion-canvas

ProcessingJS-like interface for building [motion-canvas](https://motioncanvas.io/) projects.

## Overview

Before:
```ts
view.add(<Rect width={100} height={100}>);
```

After:
```ts
g.rect(0, 0, 100, 100);
```

Mostly a stylistic preference, may make prototyping easier in some cases.

View the [example](/src/scenes/example.tsx) for more information on usage.

## Usage

Download and copy the `src/processing-motion-canvas` folder into your project's `src` folder, then in your scene file:
```ts
import { createGraphics } from '../processing-motion-canvas';

export default makeScene2D(function* (view) {
    const g = createGraphics(view);

    g.background(color(10, 10, 10));

    g.fill(color(240, 20, 20));

    // Create a rectangle with two rounded corners
    let rectRef = g.rect(0, 0, 100, 100, 50, 0, 50, 0);

    // Animate the corners switching roundness over 1.0 seconds
    yield* rectRef().radius([0, 50, 0, 50], 1.0);
});
```