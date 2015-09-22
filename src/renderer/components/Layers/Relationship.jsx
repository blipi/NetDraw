'use strict';

import React from 'react';

import Actuator from '../Actuator';

export default class Relationship extends React.Component {

    constructor (props) {
        super(props);

        let adjust = {
            x: Actuator.isVertical() ?
                Actuator.layerDims().width / 2 - Actuator.layerDims().height :
                Actuator.layerDims().width / 2,
            y: Actuator.isVertical() ?
                0 :
                Actuator.layerDims().height
        };

        this.state = {
            from: {
                x: Actuator.layerDims().width / 2,
                y: 0
            },
            to: {
                x: this.props.to.state.pos.x - this.props.from.state.pos.x + adjust.x,
                y: this.props.to.state.pos.y - this.props.from.state.pos.y + adjust.y
            }
        };

        let dx = this.state.to.x - this.state.from.x;
        let dy = this.state.to.y - this.state.from.y;

        this.state.width = Math.sqrt(dx * dx + dy * dy);
        this.state.rot = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    move () {
        let adjust = {
            x: Actuator.isVertical() ?
                -Actuator.layerDims().height :
                0,
            y: Actuator.isVertical() ?
                0 :
                Actuator.layerDims().width / 2
        };

        let x = this.props.to.state.pos.x - this.props.from.state.pos.x + adjust.x;
        let y = this.props.to.state.pos.y - this.props.from.state.pos.y + adjust.y;
        let width = Math.sqrt(x * x + y * y);
        let rot = Math.atan2(y, x) * 180 / Math.PI;

        this.setState({
            to: {x: x, y: y},
            width: width,
            rot: rot
        });
    }

    render () {
        return <div
            className='relationship'
            style={{
                left: this.state.from.x,
                top: this.state.from.y,
                width: this.state.width,
                transform: 'rotate(' +
                    (this.state.rot - (Actuator.isVertical() ? 90 : 0))
                    + 'deg)'
            }}>
        </div>;
    }

}
