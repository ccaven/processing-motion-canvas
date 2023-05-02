import { Circle, Knot, Node, Rect, ShapeProps, Spline, Txt, View2D } from "@motion-canvas/2d/lib/components";
import { PossibleCanvasStyle } from "@motion-canvas/2d/lib/partials";
import { SignalValue, SimpleSignal, createSignal } from "@motion-canvas/core/lib/signals";
import { createRef } from "@motion-canvas/core/lib/utils";

type PossibleVertex = {
    type: "vertex" | "bezierVertex" | "curveVertex",
    position: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlA?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> },
    controlB?: { x: SimpleSignal<number, void>, y: SimpleSignal<number, void> }
};

function createRefAndReturn<T>(value: T) {
    let ref = createRef<T>();
    ref(value);
    return ref;
}

export default class Sketch {

    nodeStack: Node[] = [];
    styleStack: ShapeProps[] = [{}];
    vertices: PossibleVertex[] = [];

    constructor(private view: View2D) {}

    getRoot = () => this.nodeStack[0] || this.view;
    addNode = (node: Node) => this.getRoot().add(node);
    getStyle = () => this.styleStack[0];
    antialiased = (antialiased: SignalValue<boolean>)  => this.getStyle().antialiased = antialiased;
    lineDash = (dash: SignalValue<number>[]) => this.getStyle().lineDash = dash;
    lineCap = (cap: SignalValue<CanvasLineCap>) => this.getStyle().lineCap = cap;
    lineJoin = (join: SignalValue<CanvasLineJoin>) => this.getStyle().lineJoin = join;
    lineWidth = (width: SignalValue<number>) => this.getStyle().lineWidth = width;
    textAlign = (align: SignalValue<CanvasTextAlign>) => this.getStyle().textAlign = align;
    fontSize = (size: SignalValue<number>) => this.getStyle().fontSize = size;
    fontFamily = (font: SignalValue<string>) => this.getStyle().fontFamily = font;
    letterSpacing = (spacing: SignalValue<number>) => this.getStyle().letterSpacing = spacing;
    strokeFirst = (first: SignalValue<boolean>) => this.getStyle().strokeFirst = first;
    clip = (clip: SignalValue<boolean>) => this.getStyle().clip = clip;
    fill = (fill: SignalValue<PossibleCanvasStyle>) => this.getStyle().fill = fill;
    noFill = () => this.fill(null);
    stroke = (stroke: SignalValue<PossibleCanvasStyle>) => this.getStyle().stroke = stroke;
    noStroke = () => this.stroke(null);
    background = (background: SignalValue<PossibleCanvasStyle>) => this.view.fill(background);
    pushStyle = () => this.styleStack.unshift(Object.assign({}, this.getStyle()));
    popStyle = () => this.styleStack.shift();
    pushMatrix = (node?: Node) => (this.nodeStack.unshift(node || new Node({})), createRefAndReturn(this.nodeStack[0]));
    popMatrix = () => this.addNode(this.nodeStack.shift());

    translate(x: SignalValue<number>, y: SignalValue<number>) {

        // TODO: Find way to make x() and y() depend on previous value

        this.getRoot().position.x(x);
        this.getRoot().position.y(y);
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

    curveVertex(x: SignalValue<number>, y: SignalValue<number>) {
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

        let spline = new Spline({
            closed: closed,
            ...this.getStyle(),
            children: knots
        });

        splineRef(spline);

        return splineRef;
    }

    rect(x: SignalValue<number>, y: SignalValue<number>, w: SignalValue<number>, h: SignalValue<number>, r1: SignalValue<number> = 0, r2: SignalValue<number> = 0, r3: SignalValue<number> = 0, r4: SignalValue<number> = 0) {
        let ref = createRef<Rect>();

        let r1s = createSignal(r1);
        let r2s = createSignal(r2);
        let r3s = createSignal(r3);
        let r4s = createSignal(r4);

        let rect = new Rect({
            x, y,
            width: w,
            height: h,
            radius: () => [r1s(), r2s(), r3s(), r4s()],
            smoothCorners: true,
            ...this.getStyle()
        });

        ref(rect);

        this.getRoot().add(rect);

        return ref;
    }

    ellipse(x: SignalValue<number>, y: SignalValue<number>, w: SignalValue<number>, h: SignalValue<number>) {
        let ref = createRef<Circle>();

        let circle = new Circle({
            x, y,
            width: w,
            height: h,
            ...this.getStyle()
        });

        ref(circle);

        this.getRoot().add(circle);

        return ref;
    }

    text(txt: SignalValue<string>, x: SignalValue<number>, y: SignalValue<number>) {
        let ref = createRef<Txt>();

        let node = new Txt({
            x, y,
            text: txt,
            ...this.getStyle(),
            children: "",
        });

        ref(node)

        this.getRoot().add(node);

        return ref;
    }

    empty(x?: SignalValue<number>, y?: SignalValue<number>) {
        let ref = createRef<Node>();

        let node = new Node({
            x, y
        });

        ref(node);
        
        this.getRoot().add(node);

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
