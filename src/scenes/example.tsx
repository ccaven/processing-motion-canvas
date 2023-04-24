import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {all} from '@motion-canvas/core/lib/flow';
import {createGraphics} from "../processing-motion-canvas/";

export default makeScene2D(function* (view) {

    let g = createGraphics(view);

    const mainColor = "rgb(108, 199, 162)"; // you can play around with this if you like
    const darkColor = "rgb(88, 179, 142)";
    const lightColor = "rgb(128, 219, 182)"
    
    g.background("rgb(250, 250, 250)");
    g.noStroke();

    g.fill(mainColor);
    g.noStroke();
    
    g.clip();

    g.beginShape();

    g.vertex(200 - 200, 350 - 200);
    g.vertex(70 - 200, 275 - 200);
    g.vertex(70 - 200, 125 - 200);
    g.vertex(200 - 200, 50 - 200);
    g.vertex(330 - 200, 125 - 200);
    g.vertex(330 - 200, 275 - 200);

    let logo = g.endShape();

    g.withRoot(logo(), () => {
        g.fill(darkColor);

        g.beginShape();
            g.vertex(180 - 200, 160 - 200);
            g.vertex(180 - 200, 338 - 200);
            g.vertex(70 - 200, 275 - 200);
            g.vertex(70 - 200, 160 - 200);
        g.endShape();

        g.rect(270, 140, 60, 120);

        g.fill(lightColor);

        g.beginShape();
            g.vertex(200 - 200, 50 - 200);
            g.vertex(230 - 200, 67 - 200);
            g.vertex(230 - 200, 120 - 200);
            g.vertex(120 - 200, 120 - 200);
            g.vertex(120 - 200, 96 - 200);
        g.endShape();

        g.rect(240, 240, 50, 40);

        g.fill("rgb(250, 250, 250)");

        g.beginShape();
            g.vertex(200 - 200, 300 - 200);
            g.bezierVertex(250 - 200, 300 - 200, 310 - 200, 280 - 200, 310 - 200, 180 - 200);
            g.bezierVertex(290 - 200, 180 - 200, 200 - 200, 200 - 200, 200 - 200, 300 - 200);
        g.endShape();

        g.beginShape();
            g.vertex(200 - 200, 300 - 200);
            g.bezierVertex(150 - 200, 300 - 200, 90 - 200, 280 - 200, 90 - 200, 180 - 200);
            g.bezierVertex(110 - 200, 180 - 200, 200 - 200, 200 - 200, 200 - 200, 300 - 200);
        g.endShape();

        g.ellipse(200 - 200, 150 - 200, 80, 80);
        
    });
    
    yield* logo().scale(2, 1.0).to(1.0, 1.0);
    yield* logo().rotation(90, 1.0).to(-90, 1.0).to(0, 1.0);

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