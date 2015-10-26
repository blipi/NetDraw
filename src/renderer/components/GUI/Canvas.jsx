'use strict';

import React from 'react';
import shell from 'shell';

import * as Types from '../Layers/Types';

import AppDispatcher from '../Events/AppDispatcher';
import Constants from '../Events/Constants';
import Actuator from '../Actuator';

const SPACING = 20;
const SELF_HEIGHT = 60;

export default class LayerChooser extends React.Component {
    state = {
        layers: []
    }

    constructor (props) {
        super(props);
    }

    componentDidMount () {
        AppDispatcher.register((payload) => {
            switch (payload.actionType) {

                case Constants.LAYER_ADD:
                    this.state.layers.push({
                        layer: payload.layer,
                        position: payload.position
                    });

                    this.setState({layers: this.state.layers});
                    break;

                case Constants.LAYERS_ERASE:
                    this.setState({layers: []});
                    break;

                default:
                    break;
            }
        });

        window.addEventListener('click', () => {
            Actuator.doRelationship(null);
        });
    }

    getAllLayers () {
        let layers = [];
        for (let i = 0; i < this.state.layers.length; ++i) {
            layers.push(this.refs['layer_' + i]);
        }

        return layers;
    }

    render () {
        return <div className='canvas'>
            {[...Array(this.state.layers.length)].map((x,i) =>
                React.createElement(this.state.layers[i].layer, {
                    key: i,
                    ref: 'layer_' + i,
                    pos: this.state.layers[i].position
                })
            )}
        </div>;
    }
}
