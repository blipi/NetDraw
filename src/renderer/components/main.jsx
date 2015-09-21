'use strict';

import React from 'react';
import shell from 'shell';

import LayerChooser from './GUI/LayerChooser';
import Canvas from './GUI/Canvas';
import * as Layers from './Layers/ALL';

export class Main extends React.Component {
    constructor () {
        super();
    }

    render () {
        return <div className='expand'>
                <LayerChooser layers={Layers} />
                <Canvas />
            </div>
        ;
    }
}
