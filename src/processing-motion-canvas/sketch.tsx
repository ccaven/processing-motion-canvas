import { Circle, Grid, Knot, Node, Rect, ShapeProps, Spline, Txt, View2D } from "@motion-canvas/2d/lib/components";
import { PossibleCanvasStyle } from "@motion-canvas/2d/lib/partials";
import { SignalValue, SimpleSignal, createSignal } from "@motion-canvas/core/lib/signals";
import { PossibleColor, PossibleVector2, Vector2 } from "@motion-canvas/core/lib/types";
import { Reference, createRef, makeRef } from "@motion-canvas/core/lib/utils";

type PossibleVertex = {
    type: "vertex" | "bezierVertex" | "curveVertex",
    position: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlA?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlB?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> }
};

function referenceNodeOrCreate(stack: Node[], node?: Node): Reference<Node> {
    node = node || <Node/>;
    stack.unshift(node);
    return () => node;
}

class Node2 extends Node {
    public ref(): Reference<this> {
        const ref = createRef<typeof this>();
        ref(this);
        return ref;
    }
}

let myNode = new Node2({});
let myNodeRef = myNode.ref();

export default class Sketch {

    nodeStack: Node[] = [];
    styleStack: ShapeProps[] = [{}];
    vertices: PossibleVertex[] = [];

    constructor(private view: View2D) {}

    getRoot = () => this.nodeStack[0] || this.view;
    getStyleProps = () => this.styleStack[0];
    antialiased = (antialiased: SignalValue<boolean>)  => this.styleStack[0].antialiased = antialiased;
    lineDash = (dash: SignalValue<number>[]) => this.styleStack[0].lineDash = dash;
    lineCap = (cap: SignalValue<CanvasLineCap>) => this.styleStack[0].lineCap = cap;
    lineJoin = (join: SignalValue<CanvasLineJoin>) => this.styleStack[0].lineJoin = join;
    lineWidth = (width: SignalValue<number>) => this.styleStack[0].lineWidth = width;
    textAlign = (align: SignalValue<CanvasTextAlign>) => this.styleStack[0].textAlign = align;
    fontSize = (size: SignalValue<number>) => this.styleStack[0].fontSize = size;
    fontFamily = (font: SignalValue<string>) => this.styleStack[0].fontFamily = font;
    letterSpacing = (spacing: SignalValue<number>) => this.styleStack[0].letterSpacing = spacing;
    strokeFirst = (first: SignalValue<boolean>) => this.styleStack[0].strokeFirst = first;
    clip = (clip: SignalValue<boolean>) => this.styleStack[0].clip = clip;
    fill = (fill: SignalValue<PossibleCanvasStyle>) => this.styleStack[0].fill = fill;
    noFill = () => this.fill(null);
    stroke = (stroke: SignalValue<PossibleCanvasStyle>) => this.styleStack[0].stroke = stroke;
    noStroke = () => this.stroke(null);
    background = (background: SignalValue<PossibleCanvasStyle>) => this.view.fill(background);
    pushStyle = () => this.styleStack.unshift(Object.assign({}, this.styleStack[0]));
    popStyle = () => this.styleStack.shift();

    // TODO: Change these once motion-canvas releases new version
    pushMatrix = (node?: Node) => {
        this.nodeStack.unshift(node || new Node({}));
        let ref = createRef<Node>();
        return ref(this.nodeStack[0]), ref;
    };

    popMatrix = () => {
        let node = this.nodeStack.shift();
        this.getRoot().add(node);
    }

    /* ============================ */

    /*
    pushMatrix(node?: Node) {
        if (!node) {
            let nodeRef = createRef<Node>();
            this.nodeStack.unshift(<Node ref={nodeRef} />);
            return nodeRef;
        }

        else {
            let nodeRef = () => node;
            this.nodeStack.unshift(node);
            return nodeRef;
        }
    }

    popMatrix() {
        let lastNode = this.nodeStack.shift();
        this.getRoot().add(lastNode);
    }
    */

    translate(x: SignalValue<number>, y: SignalValue<number>) {
        let xSignal = createSignal(x);
        let ySignal = createSignal(y);

        let positionSignal = this.getRoot().position;

        let newPosition = () => ({
            x: positionSignal().x + xSignal(),
            y: positionSignal().y + ySignal()
        });

        this.getRoot().position(newPosition);
    }

    rotate(angle: SignalValue<number>) {
        let angleSignal = createSignal(angle);

        let newAngle = () => angleSignal() + this.getRoot().rotation();

        this.getRoot().rotation(newAngle);
    }

    scale(x: SignalValue<number>, y: SignalValue<number>) {
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

    beginShape() {
        this.vertices = [];
    }

    vertex(x: SignalValue<number>, y: SignalValue<number>) {
        this.vertices.push({
            type: "vertex",
            position: { x: createSignal(x), y: createSignal(y) }
        });
    }

    bezierVertex(cx1: SignalValue<number>, cy1: SignalValue<number>, cx2: SignalValue<number>, cy2: SignalValue<number>, x2: SignalValue<number>, y2: SignalValue<number>) {
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

    rect(x: SignalValue<number>, y: SignalValue<number>, w: SignalValue<number>, h: SignalValue<number>, r1: SignalValue<number> = 0, r2: SignalValue<number> = 0, r3: SignalValue<number> = 0, r4: SignalValue<number> = 0) {
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

    ellipse(x: SignalValue<number>, y: SignalValue<number>, w: SignalValue<number>, h: SignalValue<number>) {
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

    grid(x: SignalValue<number>, y: SignalValue<number>, spacingX: SignalValue<number>, spacingY: SignalValue<number>) {
        let ref = createRef<Grid>();

        let xSignal = createSignal(spacingX);
        let ySignal = createSignal(spacingY);

        this.getRoot().add(<Grid
            ref={ref}
            x={x}
            y={y}
            spacing={() => [ xSignal(), ySignal() ]}
            {...this.getStyleProps()}
        />);

        return ref;
    }

    text(txt: SignalValue<string>, x: SignalValue<number>, y: SignalValue<number>) {
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

    empty(x?: SignalValue<number>, y?: SignalValue<number>) {
        let ref = createRef<Node>();

        this.getRoot().add(<Node 
            x={x}
            y={y}
            ref={ref}
        />);

        return ref;
    }

    line(x1: SignalValue<number>, y1: SignalValue<number>, x2: SignalValue<number>, y2: SignalValue<number>) {
        this.beginShape();
        this.vertex(x1, y1);
        this.vertex(x2, y2);
        this.endShape(false);
    }

    bezier(x1: SignalValue<number>, y1: SignalValue<number>, cx1: SignalValue<number>, cy1: SignalValue<number>, cx2: SignalValue<number>, cy2: SignalValue<number>, x2: SignalValue<number>, y2: SignalValue<number>) {
        this.beginShape();
        this.vertex(x1, y1);
        this.bezierVertex(cx1, cy1, cx2, cy2, x2, y2);
        this.endShape(false);
    }
}
