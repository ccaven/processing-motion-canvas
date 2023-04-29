import { View2D } from "@motion-canvas/2d/lib/components";
import { Color } from "@motion-canvas/core/lib/types";

import Sketch from "./sketch";

export function createGraphics(view: View2D) {
    return new Sketch(view);
}

export function color(r: number, g: number, b: number) {
    return new Color(r << 16 | g << 8 | b);
}

export { Sketch };