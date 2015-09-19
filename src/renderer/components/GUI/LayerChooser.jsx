'use strict';

import React from 'react';
import shell from 'shell';
import * as Types from '../Layers/Types';

const SPACING = 20;
const SELF_HEIGHT = 60;

export default class LayerChooser extends React.Component {

    defaultProps = {
    }

    constructor (props) {
        super(props);

        this.state = {
            layers: this.props.layers,
            categories: {}
        };

        // Read all types and create categories
        for (let i in Types) {
            this.state.categories[Types[i].toString()] = [];
        }

        // Assign layer types to categories
        for (let i in this.state.layers) {
            let layer = this.state.layers[i];
            let type = layer.getLayerType();

            console.log(layer.name + ` [Type=(${Number(type)}, ` +
                `${type.toString()})]`);

            this.state.categories[type.toString()].push(layer);
        }

        // Bind
        this.render = this.render.bind(this);
    }

    render () {
        let categories = this.state.categories;
        let keys = Object.keys(categories);

        // TODO: Read current style JSON values
        let layerWidth = 80;
        let layerHeight = 40;

        return <div className='layer_chooser'>

            <div className='category_chooser'>

            </div>
            <div className='category_displayer'>

                {/* Render categories */}
                {[...Array(keys.length)].map((x, i) =>
                    <div key={keys[i]} className='category' style={{
                            width: (categories[keys[i]].length * layerWidth +
                                (categories[keys[i]].length + 1)  * SPACING) + 'px'
                        }}>

                        {/* Render categories' layers */}
                        {[...Array(categories[keys[i]].length)].map((y,j) =>
                            React.createElement(categories[keys[i]][j], {
                                key: j,
                                pos: {
                                    x: SPACING + j * layerWidth + j * SPACING,
                                    y: SELF_HEIGHT / 2 - layerHeight / 2
                                }
                            })
                        )}

                    </div>
                )}
                </div>
            </div>
        ;
    }
}
