import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { all, waitFor } from '@motion-canvas/core/lib/flow';

import { color, createGraphics } from "../processing-motion-canvas";
import { createKhanLogo } from '../processing-motion-canvas/examples';

import khanLogoTextSvg from '../processing-motion-canvas/examples/khan_academy_logo.svg';
import { Img } from '@motion-canvas/2d/lib/components';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';

export default makeScene2D(function* (view) {
    const g = createGraphics(view);
    
    g.background(color(250, 250, 250));

    const mainColor = color(108, 199, 162);

    

    const logoRef = createKhanLogo(g, mainColor);

    let logoTextRef = createRef<Img>();
    
    yield view.add(<Img src={khanLogoTextSvg} ref={logoTextRef} scale={4.0} x={375}/>);

    let t = createSignal(0);
    
    logoRef().position.x(() => -300 * t());
    logoTextRef().position.x(() => 375 - 300 * t());
    logoTextRef().opacity(() => t());

    yield* logoRef().scale(2.0, 1.0).to(1.0, 1.0);

    yield* t(1.0, 1.0);

    yield* waitFor(1.0);
});
