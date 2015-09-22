'use strict';

import Dag from 'dag-map';

export default class Actuator {
    static showError (err) {
        let obj = document.querySelector('#toast_err');
        obj.text = err;
        obj.show();
    }

    static _checkRelationshipsOf (from, dest) {
        for (let i = 0; i < from.state.relationships.length; ++i) {
            let to = from.state.relationships[i];

            if (to.state.id == dest.state.id) {
                return false;
            }
        }

        return true;
    }

    static doLayer (layer) {
        Actuator._dag.add(layer);
    }

    static doRelationship (layer) {
        if (!Actuator._isDisabled) {
            if (layer && !Actuator._drawingRelationship) {
                Actuator._drawingFrom = layer;
                Actuator._drawingRelationship = true;
                return; // Avoid unsetting
            } else if (layer && Actuator._drawingFrom && layer.state.id == Actuator._drawingFrom.state.id) {
                this.showError('Cannot connect a layer with itself');
            } else if (layer) {
                // Check if it already exists
                let valid = this._checkRelationshipsOf(Actuator._drawingFrom, layer) &&
                    this._checkRelationshipsOf(layer, Actuator._drawingFrom);

                if (valid) {
                    try {
                        Actuator._dag.addEdge(Actuator._drawingFrom, layer);
                        Actuator._drawingFrom.addRelationship(layer);
                    } catch (e) {
                        this.showError('This union would create a cycle');
                    }
                } else {
                    this.showError('Cannot have duplicate connections');
                }
            }
        }

        Actuator._drawingRelationship = false;
    }

    static setDisabled (disabled) {
        Actuator._isDisabled = disabled;
    }

    static isVertical () {
        return Actuator._isVertical;
    }

    static layerDims () {
        // TODO: Fetch from theme JSON
        return {width: 80, height: 40};
    }
}

class LayersDag {
    _dag = new Dag();

    _idOf (layer) {
        return 'v' + layer.state.id;
    }

    add (layer) {
        this._dag.add(this._idOf(layer));
    }

    addEdge (from, to) {
        this._dag.addEdge(this._idOf(from), this._idOf(to));
    }
}

// HACK: Until ES7 we don't have static attributes
Actuator._dag = new LayersDag();

Actuator._drawingRelationship = false;
Actuator._drawingFrom = null;
Actuator._isDisabled = false;

Actuator._isVertical = false;
