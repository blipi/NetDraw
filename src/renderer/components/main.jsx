'use strict';

import System from 'systemjs';
import React from 'react';
import shell from 'shell';

import LayerChooser from './GUI/LayerChooser';
import * as Layers from './Layers/ALL';

export class Main extends React.Component {
    state = {
        message: 'Hello, Electron'
    }

    constructor () {
        super();
    }

    render () {
        return (
            <LayerChooser layers={Layers} />
        );
    }
}
