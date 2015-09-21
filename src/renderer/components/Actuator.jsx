'use strict';

export default class Actuator {
    static doRelationship (layer) {
        if (!Actuator._isDisabled) {
            if (layer && !Actuator._drawingRelationship) {
                Actuator._drawingFrom = layer;
                Actuator._drawingRelationship = true;
                return; // Avoid unsetting
            } else if (layer && Actuator._drawingFrom && layer.state.id == Actuator._drawingFrom.state.id) {
                return; // Do nothing
            } else if (layer) {
                Actuator._drawingFrom.addRelationship(layer);
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
