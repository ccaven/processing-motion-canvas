import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all} from '@motion-canvas/core/lib/flow';

import * as g from "../processing-motion-canvas/processing";
import { debug } from '@motion-canvas/core/lib/utils';

export default makeScene2D(function* (view) {

    g.setView(view);

    const mainColor = "rgb(108, 199, 162)"; // you can play around with this if you like
    const darkColor = "rgb(88, 179, 142)";
    const lightColor = "rgb(128, 219, 182)"
    
    g.background("rgb(250, 250, 250)");
    g.noStroke();

    g.fill(mainColor);
    g.noStroke();
    
    g.clip();
    g.beginShape();

    g.vertex(200, 350);
    g.vertex(70, 275);
    g.vertex(70, 125);
    g.vertex(200, 50);
    g.vertex(330, 125);
    g.vertex(330, 275);

    let hex = g.endShape();
    
    console.log(hex());
    
    g.withRoot(hex(), () => {
        g.fill(darkColor);

        g.beginShape();
            g.vertex(180, 160);
            g.vertex(180, 338);
            g.vertex(70, 275);
            g.vertex(70, 160);
        g.endShape();

        g.rect(270, 140, 60, 120);

        g.fill(lightColor);

        g.beginShape();
            g.vertex(200, 50);
            g.vertex(230, 67);
            g.vertex(230, 120);
            g.vertex(120, 120);
            g.vertex(120, 96);
        g.endShape();

        g.rect(240, 240, 50, 40);

        g.fill("rgb(250, 250, 250)");

        g.beginShape();
            g.vertex(200, 300);
            g.bezierVertex(250, 300, 310, 280, 310, 180);
            g.bezierVertex(290, 180, 200, 200, 200, 300);
        g.endShape();

        g.beginShape();
            g.vertex(200, 300);
            g.bezierVertex(150, 300, 90, 280, 90, 180);
            g.bezierVertex(110, 180, 200, 200, 200, 300);
        g.endShape();

        g.ellipse(200, 150, 80, 80);

        g.fill(230);

        g.beginShape();
            g.vertex(200, 350);
            g.vertex(330, 362);
            g.vertex(330, 378);
            g.vertex(200, 390);
            g.vertex(70, 378);
            g.vertex(70, 362);
        g.endShape();
    });
    
});


/*
export default makeScene2D(function* (view) {
    g.setView(view);

    g.background("rgb(10, 10, 10)")

    g.fill("darkgray")

    g.stroke("darkred");
    g.strokeWeight(10);
    g.strokeFirst();

    let frame = g.pushMatrix();

    g.clip();

    let r1 = g.rect(-50, -50, 100, 100, 50, 25, 0, 25);

    g.noClip();

    g.withRoot(r1(), () => {

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
*/