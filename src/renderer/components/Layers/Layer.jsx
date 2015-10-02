'use strict';

import React from 'react';
import shell from 'shell';

import Relationship from './Relationship';
import Actuator,{TRAINING,TESTING} from '../Actuator';

import Constants from '../Events/Constants';
import Actions from '../Events/Actions';
import AppDispatcher from '../Events/AppDispatcher';

export default class Layer extends React.Component {
    state = {
        id: Layer.id++,
        phase: Actuator.getPhase(),
        relationships: [],
        drawing: false,
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
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    componentDidMount () {
        Actuator.doLayer(this);

        AppDispatcher.register((payload) => {
            switch (payload.actionType) {
                case Constants.LAYER_MOVING:
                    this.moveRelationships(payload.layer);
                    break;
            }
        });
    }

    // we could get away with not having this (and just having the listeners on
    // our div), but then the experience would be possibly be janky. If there's
    // anything w/ a higher z-index that gets in the way, then you're toast,
    // etc.
    componentDidUpdate (props, state) {
        if ((this.state.dragging && !state.dragging) || this.state.drawing) {
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        } else if (!this.state.dragging && state.dragging) {
            document.removeEventListener('mousemove', this.onMouseMove);
            document.removeEventListener('mouseup', this.onMouseUp);
        }
    }

    getAdjust (force) {
        return {
            x: (force || !this.props.isMenu) && Actuator.isVertical()
                ? Actuator.layerDims().width / 2 : 0,
            y: 0,
        };
    }

    onClick (e) {
        if (!this.props.isMenu) {
            Actuator.doRelationship(this);

            e.stopPropagation();
            e.preventDefault();
        }

        Actuator.setDisabled(false); // Prevent drag click
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
        let pos = self.position();
        let offset = self.offset();
        let adjust = this.getAdjust();

        this.setState({
            dragging: true,
            rel: {
                x: e.pageX - pos.left - adjust.x,
                y: e.pageY - pos.top - adjust.y
            },
            offset: {
                x: e.pageX - offset.left,
                y: e.pageY - offset.top
            },
        });

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseUp (e) {
        if (this.props.isMenu && this.state.dragging) {
            let adjust = this.getAdjust(true);

            if (e.pageY < $('.canvas').position().top) {
                Actuator.showError('Layers must be dragged to editor area');
            } else {
                Actions.addLayer(this, {
                    x: e.pageX - this.state.offset.x + adjust.x * 1.5,
                    y: e.pageY - this.state.offset.y + adjust.y
                });
            }

            this.setState({
                pos: this.props.pos
            });
        }

        this.setState({dragging: false});

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseMove (e) {
        if (!this.state.dragging) {
            if (this.state.drawing)
            {
                this.startDrawing({x: e.pageX, y: e.pageY});
            }
            return;
        }

        Actuator.setDisabled(true); // Prevent drag click

        let oldPos = {x: this.state.pos.x, y: this.state.pos.y};
        this.setState({
            pos: {
                x: e.pageX - this.state.rel.x,
                y: e.pageY - this.state.rel.y
            }
        });

        let relMov = {
            x: this.state.pos.x - oldPos.x,
            y: this.state.pos.y - oldPos.y
        };

        // Update positions
        if (!this.props.isMenu) {
            this.moveRelationships();
        }

        // Update positions from dest
        Actions.movingLayer();

        e.stopPropagation();
        e.preventDefault();
    }

    moveRelationships (layer) {
        layer = layer || false;

        for (let i = 0; i < this.state.relationships.length; ++i) {
            let obj = this.refs['rel_' + i];
            if (!layer || obj.props.from.state.id == layer.state.id) {
                obj.move();
            }
        }
    }

    startDrawing (pos) {
        pos = pos || {
            x: this.state.pos.x,
            y: this.state.pos.y
        };

        let moveAdjust = Relationship.getMoveAdjust();
        let initialAdjust = Relationship.getInitialAdjust();
        pos.x -= moveAdjust.x + initialAdjust.x;
        pos.y -= moveAdjust.y;

        this.setState({
            drawing: {
                state: {
                    pos: pos
                }
            }
        });

        if (this.refs.drawing_rel)
        {
            this.refs.drawing_rel.move();
        }
    }

    stopDrawing () {
        this.setState({drawing: false});
    }

    addRelationship (to) {
        this.state.relationships.push(to);
        this.setState({relationships: this.state.relationships});
    }

    render () {
        return (
            (this.props.isMenu || Actuator.checkPhase(this.state.phase)) &&
            <div
                className={'layer ' + this.constructor.name}
                onMouseDown={this.onMouseDown}
                onClick={this.onClick}
                data-id={this.state.id}
                style={{
                        left: this.state.pos.x + 'px',
                        top: this.state.pos.y + 'px'
                    }} >

                {[...Array(this.state.relationships.length)].map((x,i) =>
                    <Relationship
                        ref={'rel_' + i}
                        key={i}
                        from={this}
                        to={this.state.relationships[i]} />
                )}

                { this.state.drawing &&
                    <Relationship temp={true} from={this} to={this.state.drawing} ref='drawing_rel' /> }
            </div>
        );
    }
}

Layer.id = 0;
