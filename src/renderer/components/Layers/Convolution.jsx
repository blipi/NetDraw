'use strict';

import React from 'react';
import Layer from './Layer';
import * as Types from './Types';

export default class Convolution extends Layer {

    static getLayerType () {
        return Types.VISION;
    }

    getDefaultParams () {
        return {
            weight_filler: {
                type: 'constant',
                value: '0'
            },
            convolution_param: {
                bias_term: true,
                pad: 0,
                pad_h: 0,
                pad_w: 0,
                stride: 1,
                stride_h: 1,
                stride_w: 1,
                group: 1
            }
        };
    }

    checkRequiredParams (params) {
        return 'convolution_param' in params &&
            'num_output' in params.convolution_param &&
            ('kernel_size' in params.convolution_param || (
                'kernel_h' in params.convolution_param &&
                'kernel_w' in params.convolution_param
            ));
    }

    disambiguate (params) {
        if (allParams.convolution_param.kernel_size != 0) {
            allParams.convolution_param.kernel_h = allParams.convolution_param.kernel_size;
            allParams.convolution_param.kernel_w = allParams.convolution_param.kernel_size;
        }

        if (allParams.convolution_param.pad != 0) {
            allParams.convolution_param.pad_h = allParams.convolution_param.pad;
            allParams.convolution_param.pad_w = allParams.convolution_param.pad;
        }

        if (allParams.convolution_param.stride != 1) {
            allParams.convolution_param.stride_h = allParams.convolution_param.stride;
            allParams.convolution_param.stride_w = allParams.convolution_param.stride;
        }

        return params;
    }

    processInput (n, c, h, w, params) {
        assert(checkRequiredParams(params));

        allParams = getDefaultParams();
        Object.assign(allParams, params);
        allParams = disambiguate(allParams);

        let h_o = (h + 2 * allParams.convolution_param.pad_h - allParams.convolution_param.kernel_h) /
            allParams.convolution_param.stride_h + 1;
        let w_o = (w + 2 * allParams.convolution_param.pad_w - allParams.convolution_param.kernel_w) /
            allParams.convolution_param.stride_w + 1;

        return [n, allParams.convolution_param.num_output, h_o, w_o];
    }
}
