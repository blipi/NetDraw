'use strict';

import React from 'react';

import Actuator from '../Actuator';

export default class Relationship extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            from: {
                x: 0, // this.props.from.state.pos.x,
                y: 0 // this.props.from.state.pos.y
            },
            to: {
                x: this.props.to.state.pos.x - this.props.from.state.pos.x,
                y: this.props.to.state.pos.y - this.props.from.state.pos.y
            }
        };

        let dx = this.state.to.x - this.state.from.x;
        let dy = this.state.to.y - this.state.from.y;

        this.state.width = Math.sqrt(dx * dx + dy * dy);
        this.state.rot = Math.atan2(dy, dx) * 180 / Math.PI;
    }

    move () {
        let x = this.props.to.state.pos.x - this.props.from.state.pos.x;
        let y = this.props.to.state.pos.y - this.props.from.state.pos.y;
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
