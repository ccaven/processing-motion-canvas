import { makeScene2D } from '@motion-canvas/2d/lib/scenes';

import { color, createGraphics } from "../processing-motion-canvas";
import { createKhanLogo } from '../processing-motion-canvas/examples';

export default makeScene2D(function* (view) {
    let g = createGraphics(view);
    
    g.background(color(250, 250, 250));

    const mainColor = color(108, 199, 162);

    const logo = createKhanLogo(g, mainColor);

    yield* logo().scale(1.5, 1.0).to(1.0, 1.0);
});
