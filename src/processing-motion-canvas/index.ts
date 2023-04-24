import { View2D } from "@motion-canvas/2d/lib/components";
import Sketch from "./sketch";
import { Color } from "@motion-canvas/core/lib/types";

export function createGraphics(view: View2D) {
    return new Sketch(view);
}

export function color(r: number, g: number, b: number) {
    return new Color(`rgb(${r}, ${g}, ${b})`);
}