'use strict';

import React from 'react';
import shell from 'shell';

import LayerChooser from './GUI/LayerChooser';
import Canvas from './GUI/Canvas';
import * as Layers from './Layers/ALL';
import Actuator,{TRAINING,TESTING} from './Actuator';

import Constants from './Events/Constants';
import Actions from './Events/Actions';
import AppDispatcher from './Events/AppDispatcher';

export class Main extends React.Component {
    state = {
        phase: Actuator.getPhase()
    }

    constructor () {
        super();

        this.changePhase = this.changePhase.bind(this);
        this.doImport = this.doImport.bind(this);
        this.importDone = this.importDone.bind(this);
    }

    doImport () {
        document.getElementById('animated').open();
        document.getElementById('dialog-import').onclick = this.importDone;
    }

    importDone () {
        this.setState({phase: Actuator.togglePhase()});
        Actions.clearLayers();
    }

    changePhase () {
        this.setState({phase: Actuator.togglePhase()});
    }

    render () {
        return <div className='expand'>
                <LayerChooser layers={Layers} />
                <Canvas />

                <div id='phase-display'>
                    <div className='vertical-text'>{this.state.phase}</div>
                </div>

                <paper-fab id='fab-import' icon='create' title='done'
                    tabIndex='0' className='blue' onClick={this.doImport} />

                <paper-fab id='fab-done' icon='done' title='done' tabIndex='0' className='green'></paper-fab>

                <paper-fab id='fab-swap' icon='swap-vertical-circle' title='swap'
                    tabIndex='0' className='orange' onClick={this.changePhase} />
            </div>
        ;
    }
}
