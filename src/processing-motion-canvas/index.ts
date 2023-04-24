import { View2D } from "@motion-canvas/2d/lib/components";
import Sketch from "./sketch";

export function createGraphics(view: View2D) {
    return new Sketch(view);
}