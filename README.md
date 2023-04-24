# processing-motion-canvas

ProcessingJS-like interface for building [motion-canvas](https://motioncanvas.io/) projects.

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