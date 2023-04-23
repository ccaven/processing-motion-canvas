import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all} from '@motion-canvas/core/lib/flow';

import * as g from "../processing-motion-canvas/processing";

export default makeScene2D(function* (view) {
    g.setView(view);

    g.background("rgb(10, 10, 10)")

    g.stroke("darkred");
    g.strokeWeight(10);

    let frame = g.pushMatrix();

    let r1 = g.rect(-50, -50, 100, 100, 50, 25, 0, 25);
    let r2 = g.rect(50, 50, 100, 100, 0, 50, 0, 25);

    g.popMatrix();

    g.pushMatrix();

        g.translate({ x: -200, y: 0 });

        g.beginShape();

            g.vertex(-50, -50);
            g.vertex(50, -50);
            g.vertex(50, 50);
            g.bezierVertex(10, 10, -10, 10, -50, 50);
            g.vertex(-75, 0);

        let spline = g.endShape(false);

    g.popMatrix();

    yield* spline().start(1.0, 1.0).to(0.0, 1.0);

    yield* frame().rotation(45, 1);

    yield* frame().position([100, 100], 2.0);
    
    yield* all(
        r1().radius([-75, 50, 0, 50], 2),
        r2().radius([0, 50, -75, 50], 2)
    );
});

