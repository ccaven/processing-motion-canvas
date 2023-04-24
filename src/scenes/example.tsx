import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, waitFor } from '@motion-canvas/core/lib/flow/'
import { easeInBack, easeInCubic, easeInOutBack, easeInOutBounce, easeInOutCubic, easeOutCubic, tween } from '@motion-canvas/core/lib/tweening';

import { color, createGraphics } from "../processing-motion-canvas/";
import Sketch from 'processing-motion-canvas/sketch';
import { Reference } from '@motion-canvas/core/lib/utils';
import { Node } from '@motion-canvas/2d/lib/components';

export default makeScene2D(function* (view) {

    let g = createGraphics(view);
    
    g.background(color(250, 250, 250));

    let logos: Reference<Node>[] = [];

    for (let i = 400; i >= -400; i -= 200) {
        let logo = createKhanLogo(g);
        logo().position(i);

        logos.push(logo);
    }
    
    yield* waitFor(1.0);

    yield* all(
        ...logos.map((logoRef, i) => {
            let p = logoRef().position().x;
            return tween(5, t => {
                t = easeInOutCubic(t) * 360;

                let a = Math.abs(i-2) * t;
                let ct = Math.cos(a / 180 * Math.PI);
                let st = Math.sin(a / 180 * Math.PI);

                logoRef().position([
                    ct * p - st * p,
                    ct * p + st * p
                ]);
            });
        })
    );

    yield* waitFor(1.0);

    g.fill("black");
    g.textSize(100);
    g.useFont("sans-serif")

    let txt = g.text("Khan Academy", -300, 300);

    txt().scale(0);

    yield* txt().scale(1.0, 1.0, easeOutCubic);
    
    yield* waitFor(1.0);

});

function createKhanLogo(g: Sketch) {
    const mainColor = color(108, 199, 162);
    const darkColor = color(108 - 20, 199 - 20, 162 - 20);
    const lightColor = color(108 + 20, 199 + 20, 162 + 20);
    
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

        g.fill(color(250, 250, 250));

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

    return logo;
}