'use strict';

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
                    Actuator._drawingFrom.addRelationship(layer);
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

// HACK: Until ES7 we don't have static attributes
Actuator._drawingRelationship = false;
Actuator._drawingFrom = null;
Actuator._isDisabled = false;

Actuator._isVertical = false;
