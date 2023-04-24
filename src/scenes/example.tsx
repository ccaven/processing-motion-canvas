import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, waitFor } from '@motion-canvas/core/lib/flow';

import { color, createGraphics } from "../processing-motion-canvas";
import { createKhanLogo } from '../processing-motion-canvas/examples';

import khanLogoTextSvg from '../processing-motion-canvas/examples/khan_academy_logo.svg';
import { Img } from '@motion-canvas/2d/lib/components';
import { createRef } from '@motion-canvas/core/lib/utils';

export default makeScene2D(function* (view) {
    let g = createGraphics(view);
    
    g.background(color(250, 250, 250));

    const mainColor = color(108, 199, 162);

    const logoRef = createKhanLogo(g, mainColor);

    let logoTextRef = createRef<Img>();
    
    yield view.add(<Img src={khanLogoTextSvg} ref={logoTextRef} scale={4.0} x={375}/>);

    logoTextRef().opacity(0);

    yield* logoRef().scale(2.0, 1.0).to(1.0, 1.0);

    yield* all(
        logoRef().position.x(-300, 1.0),
        logoTextRef().opacity(1, 1.0),
        logoTextRef().position.x(75, 1.0)
    );

    yield* waitFor(1.0);
});
