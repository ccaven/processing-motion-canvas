import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all} from '@motion-canvas/core/lib/flow';

import * as g from "../processing-motion-canvas/processing";

export default makeScene2D(function* (view) {
    g.setView(view);

    g.background("rgb(10, 10, 10)")

    g.noFill();

    g.stroke("darkred");
    g.strokeWeight(10);

    let frame = g.pushMatrix();

    g.clip();

    let r1 = g.rect(-50, -50, 100, 100, 50, 25, 0, 25);

    g.noClip();

    g.withRoot(r1(), () => {

        // Manual pushStyle/popStyle
        g.pushStyle();
        g.fill("white");
        g.noStroke();
        g.rect(-25, 25, 50, 50);
        g.popStyle();
        
    });

    let r2 = g.rect(50, 50, 100, 100, 0, 50, 0, 25);

    g.popMatrix();

    g.pushMatrix();

        g.translate({ x: -200, y: 0 });

        g.stroke("purple");

        g.beginShape();

            g.curveVertex(-50, -50);
            g.curveVertex(50, -50);
            g.curveVertex(50, 50);
            g.bezierVertex(10, 10, -10, 10, -50, 50);
            g.curveVertex(-75, 0);

        let spline = g.endShape(true);

    g.popMatrix();

    yield* all(
        spline().start(0.5, 1.0).to(0.0, 1.0),
        spline().end(0.5, 1.0).to(1.0, 1.0)
    );

    yield* frame().rotation(45, 1);

    yield* frame().position([100, 100], 2.0);
    
    yield* all(
        r1().radius([-75, 50, 0, 50], 2),
        r2().radius([0, 50, -75, 50], 2)
    );
});

