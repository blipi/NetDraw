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
    }

    render () {
        return <div className='canvas'></div>;
    }
}
