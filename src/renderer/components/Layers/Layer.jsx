'use strict';

import React from 'react';
import shell from 'shell';

export default class Layer extends React.Component {
    state = {
        pos: {x: 0, y: 0},
        dragging: false,
        rel: null // position relative to the cursor
    }

    constructor (props) {
        /* TODO: Not yet in babel
        // Abstract class
        if (new.target === Layer) {
            throw new TypeError('Cannot construct Layer instances directly');
        }
        */

        super(props);

        if ('pos' in this.props) {
            this.state.pos = this.props.pos;
        }

        // Abstract methods
        if (typeof this.checkRequiredParams !== 'function') {
            throw new TypeError('Must override checkRequiredParams');
        }
        if (typeof this.getDefaultParams !== 'function') {
            throw new TypeError('Must override getDefaultParams');
        }
        if (typeof this.disambiguate !== 'function') {
            throw new TypeError('Must override disambiguate');
        }
        if (typeof this.processInput !== 'function') {
            throw new TypeError('Must override processInput');
        }

        // Bind
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    // etc.
    componentDidUpdate (props, state) {
        if (this.state.dragging && !state.dragging) {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        } else if (!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    }

    // calculate relative position to the mouse and set dragging=true
    onMouseDown (e) {
        // only left mouse button
        if (e.button !== 0) {
            return;
        }

        let self = $(React.findDOMNode(this));

        // Update current selection
        $('.layer.last').removeClass('last');
        self.addClass('last');

        // Update relative position
        var pos = self.position();
        this.setState({
            dragging: true,
            rel: {
                x: e.pageX - pos.left,
                y: e.pageY - pos.top
            }
        });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseUp (e) {
        this.setState({dragging: false});

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove (e) {
        if (!this.state.dragging) {
            return;
        }

        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        });

        e.stopPropagation();
        e.preventDefault();
    }

    render () {
        return (
            <div
                className={'layer ' + this.constructor.name}
                onMouseDown={this.onMouseDown}
                style={{
                        position: 'absolute',
                        left: this.state.pos.x + 'px',
                        top: this.state.pos.y + 'px'
                    }} />
            );
    }
}
