import { blur } from "@motion-canvas/2d/lib/partials";
import { color, Sketch } from "..";
import { Color, PossibleColor } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";
import { Node } from "@motion-canvas/2d/lib/components";

function brightenUniform(c: Color, amount: number) {
    let [ r, g, b ] = c.rgb();

    r += amount;
    g += amount;
    b += amount;

    return color(r, g, b);
}

export function createKhanLogo(g: Sketch, mainColor: PossibleColor) {
    mainColor = new Color(mainColor);
    
    const darkColor = brightenUniform(mainColor, -20);
    
    const lightColor = brightenUniform(mainColor, 20);
    
    g.noStroke();

    g.fill(mainColor);
    g.noStroke();
    
    g.clip();

    // Outline hexagon
    g.beginShape();

    g.vertex(200 - 200, 350 - 200);
    g.vertex(70 - 200, 275 - 200);
    g.vertex(70 - 200, 125 - 200);
    g.vertex(200 - 200, 50 - 200);
    g.vertex(330 - 200, 125 - 200);
    g.vertex(330 - 200, 275 - 200);

    let logo = g.endShape();

    g.pushMatrix(logo());

        let nodeRef = g.empty();

        nodeRef().filters.blur(20);

        g.pushMatrix(nodeRef());

            // Dark accents
            g.fill(darkColor);
            g.rect(-75, 50, 55 * 2, 90 * 2);
            g.rect(70, -60, 60, 120);
            g.rect(20, -60, 60, 120);

            // Light accents
            g.fill(lightColor);
            g.rect(50, 40, 100, 40);
            g.rect(-25, -120, 95 * 2, 80);
            g.rect(100, 120, 105 * 2, 100);

            g.fill(mainColor);
            g.rect(-100, 70, 40, 50);
            g.rect(60, -80, 40, 20);
        
        g.popMatrix();

        // Khan Academy logo
        g.fill(color(250, 250, 250));

        g.beginShape();
            g.vertex(0, 100);
            g.bezierVertex(50, 100, 110, 80, 110, -20);
            g.bezierVertex(90, -20, 0, 0, 0, 100);
        g.endShape();

        g.beginShape();
            g.vertex(0, 100);
            g.bezierVertex(-50, 100, -110, 80, -110, -20);
            g.bezierVertex(-90, -20, 0, 0, 0, 100);
        g.endShape();

        g.ellipse(0, -50, 80, 80);
        
    g.popMatrix();

    return logo;
}