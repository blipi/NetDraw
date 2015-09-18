'use strict';

import React from 'react';
import Layer from './Layer';
import * as Types from './Types';

export default class LRN extends Layer {

    static getLayerType () {
        return Types.VISION;
    }

    getDefaultParams () {
        return {
            lrn_param: {
                local_size: 5,
                alpha: 1,
                beta: 5,
                norm_region: 'ACROSS_CHANNELS'
            }
        };
    }

    checkRequiredParams (params) {
        return true;
    }

    disambiguate (params) {
        return params;
    }

    processInput (n, c, h, w, params) {
        assert(checkRequiredParams(params));
        return [n, c, h, w];
    }
}
