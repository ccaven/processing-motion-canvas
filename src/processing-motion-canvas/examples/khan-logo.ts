import { color, Sketch } from "..";
import { Color, PossibleColor } from "@motion-canvas/core/lib/types";

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

    g.withRoot(logo(), () => {
        // Dark accents
        g.fill(darkColor);
        g.rect(-75, 50, 55 * 2, 90 * 2);
        g.rect(70, -60, 60, 120);

        // Light accents
        g.fill(lightColor);
        g.rect(40, 40, 50, 40);
        g.rect(-25, -120, 55 * 2, 80);

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
        
    });

    return logo;
}