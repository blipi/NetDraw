'use strict';

import React from 'react';
import shell from 'shell';
import * as Types from '../Layers/Types';

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
    }

    render () {
        let categories = this.state.categories;
        let keys = Object.keys(categories);

        return <div className='layer_chooser'>

            {/* Render categories */}
            {[...Array(keys.length)].map((x, i) =>
                <div key={keys[i]} data-children={categories[keys[i]].length} className='category'>

                    {/* Render categories' layers */}
                    {[...Array(categories[keys[i]].length)].map((y,j) =>
                        React.createElement(categories[keys[i]][j], {key: j})
                    )}

                </div>
            )}
            </div>
        ;
    }
}
