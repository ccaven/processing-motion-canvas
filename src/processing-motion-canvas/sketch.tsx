import { Circle, Grid, Knot, Node, Rect, ShapeProps, Spline, Txt, View2D } from "@motion-canvas/2d/lib/components";
import { PossibleCanvasStyle } from "@motion-canvas/2d/lib/partials";
import { SignalValue, SimpleSignal, createSignal } from "@motion-canvas/core/lib/signals";
import { PossibleColor, PossibleVector2, Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";

type NumberSignal = SignalValue<number>;
type ColorSignal = SignalValue<PossibleCanvasStyle>;
type BooleanSignal = SignalValue<boolean>;

type PossibleVertex = {
    type: "vertex" | "bezierVertex" | "curveVertex",
    position: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlA?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlB?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> }
};


export default class Sketch {

    view: View2D;
    nodeStack: Node[] = [];
    styleStack: ShapeProps[] = [{}];
    vertices: PossibleVertex[] = [];

    constructor(view: View2D) {
        this.view = view;
    }

    /* ============================ */

    getRoot() {
        if (this.nodeStack.length > 0) {
            return this.nodeStack[this.nodeStack.length - 1];
        } else { 
            return this.view;
        }
    }

    getStyleProps() {
        return this.styleStack[this.styleStack.length - 1];
    }

    withRoot(node: Node, callback: () => void) {
        this.nodeStack.push(node);
        callback();
        this.nodeStack.pop();
    }

    /* ============================ */

    background(color: PossibleColor) {
        this.view.fill(color);
    }

    fill(color: ColorSignal) {
        this.styleStack[this.styleStack.length - 1].fill = color;
    }

    noFill() {
        this.styleStack[this.styleStack.length - 1].fill = null;
    }

    stroke(color: ColorSignal) {
        this.styleStack[this.styleStack.length - 1].stroke = color;
    }

    noStroke() {
        this.styleStack[this.styleStack.length - 1].stroke = null;
    }

    strokeWeight(weight: NumberSignal) {
        this.styleStack[this.styleStack.length - 1].lineWidth = weight;
    }

    clip() {
        this.styleStack[this.styleStack.length - 1].clip = true;
    }

    noClip() {
        this.styleStack[this.styleStack.length - 1].clip = false;
    }

    strokeFirst() {
        this.styleStack[this.styleStack.length - 1].strokeFirst = true;
    }

    strokeLast() {
        this.styleStack[this.styleStack.length - 1].strokeFirst = false;
    }

    textSize(size: NumberSignal) {
        this.styleStack[this.styleStack.length - 1].fontSize = size;
    }

    useFont(fontFamily: string) {
        this.styleStack[this.styleStack.length - 1].fontFamily = fontFamily;
    }

    /* ============================ */

    pushMatrix(node?: Node) {
        if (!node) {
            let nodeRef = createRef<Node>();
            this.nodeStack.push(<Node ref={nodeRef} />);
            return nodeRef;
        }

        else {
            let nodeRef = () => node;
            this.nodeStack.push(node);
            return nodeRef;
        }
    }

    popMatrix() {
        let lastNode = this.nodeStack.pop();
        this.getRoot().add(lastNode);
    }

    translate(x: NumberSignal, y: NumberSignal) {
        let xSignal = createSignal(x);
        let ySignal = createSignal(y);

        let positionSignal = this.getRoot().position;

        let newPosition = () => ({
            x: positionSignal().x + xSignal(),
            y: positionSignal().y + ySignal()
        });

        this.getRoot().position(newPosition);
    }

    rotate(angle: NumberSignal) {
        let angleSignal = createSignal(angle);

        let newAngle = () => angleSignal() + this.getRoot().rotation();

        this.getRoot().rotation(newAngle);
    }

    scale(x: NumberSignal, y: NumberSignal) {
        let xSignal = createSignal(x);
        let ySignal = createSignal(y);

        let scaleSignal = this.getRoot().scale;

        let newScale = () => ({
            x: scaleSignal().x + xSignal(),
            y: scaleSignal().y + ySignal()
        });

        this.getRoot().scale(newScale);
    }

    /* ============================ */

    pushStyle() {
        const clone = Object.assign({}, this.styleStack[this.styleStack.length - 1]);
        this.styleStack.push(clone);
    }

    popStyle() {
        this.styleStack.pop();
    }

    /* ============================ */

    beginShape() {
        this.vertices = [];
    }

    vertex(x: NumberSignal, y: NumberSignal) {
        this.vertices.push({
            type: "vertex",
            position: { x: createSignal(x), y: createSignal(y) }
        });
    }

    bezierVertex(cx1: NumberSignal, cy1: NumberSignal, cx2: NumberSignal, cy2: NumberSignal, x2: NumberSignal, y2: NumberSignal) {
        this.vertices.push({
            type: "bezierVertex",
            controlA: { x: createSignal(cx1), y: createSignal(cy1) },
            controlB: { x: createSignal(cx2), y: createSignal(cy2) },
            position: { x: createSignal(x2), y: createSignal(y2) }
        });
    }

    curveVertex(x: number, y: number) {
        this.vertices.push({
            type: "curveVertex",
            position: { x: createSignal(x), y: createSignal(y) }
        });
    }

    endShape(closed: boolean = true) {
        // Take _currentVertices array
        let splineRef = createRef<Spline>();

        let knots: Knot[] = [];

        for (let i = 0; i < this.vertices.length; i ++) {
            let { position, type } = this.vertices[i];

            let positionSignal = () => ({
                x: position.x(),
                y: position.y()
            });
            
            // By default, the start/end handle are the neighboring vertices
            let startHandleAbsolute = this.vertices[(i - 1 + this.vertices.length) % this.vertices.length].position;
            let endHandleAbsolute = this.vertices[(i + 1 + this.vertices.length) % this.vertices.length].position;

            if (type == "bezierVertex") {
                startHandleAbsolute = this.vertices[i].controlB;
            }

            if (i < this.vertices.length - 1 && this.vertices[i + 1].type == "bezierVertex") {
                endHandleAbsolute = this.vertices[i + 1].controlA;
            }

            let startHandle = () => ({
                x: startHandleAbsolute.x() - positionSignal().x,
                y: startHandleAbsolute.y() - positionSignal().y
            });

            let endHandle = () => ({
                x: endHandleAbsolute.x() - positionSignal().x,
                y: endHandleAbsolute.y() - positionSignal().y
            });

            // curveVertex uses automatically calculated start/end handles
            if (type != "curveVertex") {
                knots.push(new Knot({
                    position: positionSignal,
                    startHandle,
                    endHandle
                }));
            } else {
                knots.push(new Knot({
                    position: positionSignal
                }));
            }
        }

        this.getRoot().add(<Spline
            closed={closed}
            ref={splineRef}
            {...this.getStyleProps()}
        >
            {knots}
        </Spline>)

        return splineRef;
    }

    /* ============================ */

    rect(x: NumberSignal, y: NumberSignal, w: NumberSignal, h: NumberSignal, r1: NumberSignal = 0, r2: NumberSignal = 0, r3: NumberSignal = 0, r4: NumberSignal = 0) {
        let ref = createRef<Rect>();

        let r1s = createSignal(r1);
        let r2s = createSignal(r2);
        let r3s = createSignal(r3);
        let r4s = createSignal(r4);

        this.getRoot().add(<Rect
            x={x}
            y={y}
            width={w}
            height={h}
            radius={() => [r1s(), r2s(), r3s(), r4s()]}
            smoothCorners
            ref={ref}
            {...this.getStyleProps()}
        />);

        return ref;
    }

    ellipse(x: number, y: number, w: number, h: number) {
        let ref = createRef<Circle>();

        this.getRoot().add(<Circle
            x={x}
            y={y}
            width={w}
            height={h}
            ref={ref}
            {...this.getStyleProps()}
        />);

        return ref;
    }

    grid(x: number, y: number, spacingX: number, spacingY: number) {
        let ref = createRef<Grid>();

        this.getRoot().add(<Grid
            ref={ref}
            x={x}
            y={y}
            spacing={[spacingX, spacingY]}
            {...this.getStyleProps()}
        />);

        return ref;
    }

    text(txt: string, x: number, y: number) {
        let ref = createRef<Txt>();

        this.getRoot().add(<Txt
            text={txt}
            x={x}
            y={y}

            {...this.getStyleProps()}
            
            children=""
            
            ref={ref}
        />);

        return ref;
    }

    empty(x?: NumberSignal, y?: NumberSignal) {
        let ref = createRef<Node>();

        this.getRoot().add(<Node 
            x={x}
            y={y}
            ref={ref}
        />);

        return ref;
    }
}
