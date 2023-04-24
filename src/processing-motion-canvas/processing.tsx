import { Circle, Knot, LayoutProps, Node, NodeProps, Rect, ShapeProps, Spline, View2D } from "@motion-canvas/2d/lib/components";
import { PossibleColor, PossibleVector2 } from "@motion-canvas/core/lib/types";
import { createRef } from "@motion-canvas/core/lib/utils";

let _view: View2D | null = null;

let _nodeStack: Node[] = [];
let _styleStack: ShapeProps[] = [{}];

type PossibleVertex = {
    type: "vertex" | "bezierVertex" | "curveVertex",
    position: { x: number, y: number },
    controlA?: { x: number, y: number },
    controlB?: { x: number, y: number }
};

let _currentVertices: PossibleVertex[] = [];

function getRoot(): Node {
    if (_nodeStack.length > 0) {
        return _nodeStack[_nodeStack.length - 1];
    }

    if (_view) {
        return _view;
    }

    throw new Error("_view cache is null");
}

function getStyleProps(): ShapeProps {
    return _styleStack[_styleStack.length - 1];
}

export function withRoot(node: Node, callback: () => void) {
    _nodeStack.push(node);

    callback();

    _nodeStack.pop();
}

export function setView(view: View2D) {
    _view = view;
}

export function rect(x: number, y: number, w: number, h: number, r1: number = 0, r2: number = 0, r3: number = 0, r4: number = 0) {
    let ref = createRef<Rect>();
    getRoot().add(<Rect 
        x={x} 
        y={y} 
        width={w} 
        height={h}
        radius={[r1, r2, r3, r4]}
        smoothCorners
        ref={ref}
        {...getStyleProps()}
    />);
    return ref;
}

export function ellipse(x: number, y: number, w: number, height: number) {
    let ref = createRef<Circle>();
    getRoot().add(<Circle
        x={x}
        y={y}
        width={w}
        height={height}
        ref={ref}
        {...getStyleProps()}   
    />);
    return ref;
}

export function background(color: PossibleColor) {
    _view.fill(color);
}

export function fill(color: PossibleColor) {
    _styleStack[_styleStack.length - 1].fill = color;
}

export function noFill() {
    _styleStack[_styleStack.length - 1].fill = null;
}

export function stroke(color: PossibleColor) {
    _styleStack[_styleStack.length - 1].stroke = color;
}

export function noStroke() {
    _styleStack[_styleStack.length - 1].stroke = null;
}

export function strokeWeight(weight: number) {
    _styleStack[_styleStack.length - 1].lineWidth = weight;
}

export function pushMatrix() {
    let nodeRef = createRef<Node>();
    _nodeStack.push(<Node ref={nodeRef} />);
    return nodeRef;
}

export function popMatrix() {
    let lastNode = _nodeStack.pop();
    getRoot().add(lastNode);
}

export function translate(vector: PossibleVector2) {
    getRoot().position(vector);
}

export function rotate(angle: number) {
    getRoot().rotation(getRoot().rotation() + angle);
}

export function beginShape() {
    _currentVertices = [];
}

export function vertex(x: number, y: number) {
    _currentVertices.push({
        type: "vertex",
        position: { x, y }
    });
}

export function bezierVertex(cx1: number, cy1: number, cx2: number, cy2: number, x2: number, y2: number) {
    _currentVertices.push({
        type: "bezierVertex",
        controlA: { x: cx1, y: cy1 },
        controlB: { x: cx2, y: cy2 },
        position: { x: x2, y: y2 }
    });
}

export function curveVertex(x: number, y: number) {
    _currentVertices.push({
        type: "curveVertex",
        position: { x, y }
    });
}

export function endShape(closed: boolean = true) {
    // Take _currentVertices array
    let splineRef = createRef<Spline>();

    let knots: Knot[] = [];

    for (let i = 0; i < _currentVertices.length; i ++) {
        let { position, type } = _currentVertices[i];
        
        // By default, the start/end handle are the neighboring vertices
        let startHandleAbsolute = _currentVertices[(i - 1 + _currentVertices.length) % _currentVertices.length].position;
        let endHandleAbsolute = _currentVertices[(i + 1 + _currentVertices.length) % _currentVertices.length].position;

        if (type == "bezierVertex") {
            startHandleAbsolute = _currentVertices[i].controlB;
        }

        if (i < _currentVertices.length - 1 && _currentVertices[i + 1].type == "bezierVertex") {
            endHandleAbsolute = _currentVertices[i + 1].controlA;
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

    getRoot().add(<Spline 
        closed={closed}
        ref={splineRef}
        {...getStyleProps()}
    >
        {knots}
    </Spline>)

    return splineRef;
}

export function clip() {
    _styleStack[_styleStack.length - 1].clip = true;
}

export function noClip() {
    _styleStack[_styleStack.length - 1].clip = false;
}

export function pushStyle() {
    _styleStack.push(Object.assign({}, _styleStack[_styleStack.length - 1]));
}

export function popStyle() {
    if (_styleStack.length > 1) {
        _styleStack.pop();
    }
}

export function strokeFirst() {
    _styleStack[_styleStack.length - 1].strokeFirst = true;
}

export function strokeLast() {
    _styleStack[_styleStack.length - 1].strokeFirst = false;
}