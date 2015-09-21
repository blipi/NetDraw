import AppDispatcher from './AppDispatcher';
import Constants from './Constants';

export default class Actions {
    static addLayer (layer, position) {
        return AppDispatcher.dispatch({
            actionType: Constants.LAYER_ADD,
            layer: layer.constructor,
            position: position
        });
    }

    static movingLayer (layer) {
        return AppDispatcher.dispatch({
            actionType: Constants.LAYER_MOVING,
            layer: layer
        });
    }
}
