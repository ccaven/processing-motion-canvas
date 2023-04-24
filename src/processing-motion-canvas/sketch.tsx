import { Circle, Grid, Knot, Node, Rect, ShapeProps, Spline, Txt, View2D } from "@motion-canvas/2d/lib/components";
import { PossibleColor, PossibleVector2, Vector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";

type PossibleVertex = {
    type: "vertex" | "bezierVertex" | "curveVertex",
    position: { x: number, y: number },
    controlA?: { x: number, y: number },
    controlB?: { x: number, y: number }
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

    fill(color: PossibleColor) {
        this.styleStack[this.styleStack.length - 1].fill = color;
    }

    noFill() {
        this.styleStack[this.styleStack.length - 1].fill = null;
    }

    stroke(color: PossibleColor) {
        this.styleStack[this.styleStack.length - 1].stroke = color;
    }

    noStroke() {
        this.styleStack[this.styleStack.length - 1].stroke = null;
    }

    strokeWeight(weight: number) {
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

    textSize(size: number) {
        this.styleStack[this.styleStack.length - 1].fontSize = size;
    }

    useFont(fontFamily: string) {
        this.styleStack[this.styleStack.length - 1].fontFamily = fontFamily;
    }

    /* ============================ */

    pushMatrix() {
        let nodeRef = createRef<Node>();
        this.nodeStack.push(<Node ref={nodeRef} />);
        return nodeRef;
    }

    popMatrix() {
        let lastNode = this.nodeStack.pop();
        this.getRoot().add(lastNode);
    }

    translate(x: number, y: number) {
        this.getRoot().position(this.getRoot().position().add(new Vector2(x, y)));
    }

    rotate(angle: number) {
        this.getRoot().rotation(this.getRoot().rotation() + angle);
    }

    scale(x: number, y: number) {
        this.getRoot().scale([x, y]);
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

    vertex(x: number, y: number) {
        this.vertices.push({
            type: "vertex",
            position: { x, y }
        });
    }

    bezierVertex(cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number) {
        this.vertices.push({
            type: "bezierVertex",
            controlA: { x: cx1, y: cy1 },
            controlB: { x: cx2, y: cy2 },
            position: { x: x2, y: y2 }
        });
    }

    curveVertex(x: number, y: number) {
        this.vertices.push({
            type: "curveVertex",
            position: { x, y }
        });
    }

    endShape(closed: boolean = true) {
        // Take _currentVertices array
        let splineRef = createRef<Spline>();

        let knots: Knot[] = [];

        for (let i = 0; i < this.vertices.length; i ++) {
            let { position, type } = this.vertices[i];
            
            // By default, the start/end handle are the neighboring vertices
            let startHandleAbsolute = this.vertices[(i - 1 + this.vertices.length) % this.vertices.length].position;
            let endHandleAbsolute = this.vertices[(i + 1 + this.vertices.length) % this.vertices.length].position;

            if (type == "bezierVertex") {
                startHandleAbsolute = this.vertices[i].controlB;
            }

            if (i < this.vertices.length - 1 && this.vertices[i + 1].type == "bezierVertex") {
                endHandleAbsolute = this.vertices[i + 1].controlA;
            }

            let startHandle = {
                x: startHandleAbsolute.x - position.x,
                y: startHandleAbsolute.y - position.y
            };

            let endHandle = {
                x: endHandleAbsolute.x - position.x,
                y: endHandleAbsolute.y - position.y
            };

            // curveVertex uses automatically calculated start/end handles
            if (type != "curveVertex") {
                knots.push(new Knot({
                    position,
                    startHandle,
                    endHandle
                }));
            } else {
                knots.push(new Knot({
                    position
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

    rect(x: number, y: number, w: number, h: number, r1: number = 0, r2: number = 0, r3: number = 0, r4: number = 0) {
        let ref = createRef<Rect>();

        this.getRoot().add(<Rect
            x={x}
            y={y}
            width={w}
            height={h}
            radius={[r1, r2, r3, r4]}
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
}
