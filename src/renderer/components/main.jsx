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

    doImport () {
        document.getElementById('animated').open();
    }

    render () {
        return <div className='expand'>
                <LayerChooser layers={Layers} />
                <Canvas />

                <paper-fab id='fab-import' icon='create' title='done'
                    tabIndex='0' className='blue' onClick={this.doImport}/>

                <paper-fab id='fab-done' icon='done' title='done' tabIndex='0' className='green'></paper-fab>
            </div>
        ;
    }
}
