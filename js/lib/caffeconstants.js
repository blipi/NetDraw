
var Version = {
    DEPRECATED: -1,
    V0: 0,
    V1: 1
};

var Phase = {
    MENU: -1,
    TEST: 0,
    TRAIN: 1
};

var V1LayerParameter = {
    LayerType: {
        NONE: -1,
        ACCURACY: 0,
        BNLL: 1,
        CONCAT: 2,
        CONVOLUTION: 3,
        DATA: 4,
        DROPOUT: 5,

        EUCLIDEAN: 6,
        EUCLIDEAN_LOSS: 6,

        HINGE: 7,
        HINGE_LOSS: 7,

        FLATTEN: 8,
        HDF5_DATA: 9,
        HDF5_OUTPUT: 10,
        IM2COL: 11,
        IMAGE_DATA: 12,
        INFOGAIN_LOSS: 13,
        INNER_PRODUCT: 14,
        LRN: 15,
        MULTINOMIAL_LOGISTIC_LOSS: 16,
        POOLING: 17,
        RELU: 18,
        SIGMOID: 19,
        SOFTMAX: 20,
        SOFTMAX_LOSS: 21,
        SPLIT: 22,
        TANH: 23,
        WINDOW_DATA: 24,

        ABSVAL: 25,
        POWER: 26,
        MEMORY_DATA: 27,
        DUMMY_DATA: 28,
        SLICE: 29
    },

    MaxLayers: 30
};

var GetPhase = function (phase) {
    for (var name in Phase) {
        if (name == phase) {
            return Phase[name];
        }
    }
}

var UpgradeV0LayerType = function (type) {
    // By CONSTANT usage
    for (var name in V1LayerParameter.LayerType) {
        if (name == type) {
            return V1LayerParameter.LayerType[name];
        }
    }

    // By name
    if (type == 'accuracy') {
        return V1LayerParameter.LayerType.ACCURACY;
    } else if (type == 'bnll') {
        return V1LayerParameter.LayerType.BNLL;
    } else if (type == 'concat') {
        return V1LayerParameter.LayerType.CONCAT;
    } else if (type == 'conv') {
        return V1LayerParameter.LayerType.CONVOLUTION;
    } else if (type == 'data') {
        return V1LayerParameter.LayerType.DATA;
    } else if (type == 'dropout') {
        return V1LayerParameter.LayerType.DROPOUT;
    } else if (type == 'euclidean_loss') {
        return V1LayerParameter.LayerType.EUCLIDEAN_LOSS;
    } else if (type == 'flatten') {
        return V1LayerParameter.LayerType.FLATTEN;
    } else if (type == 'hdf5_data') {
        return V1LayerParameter.LayerType.HDF5_DATA;
    } else if (type == 'hdf5_output') {
        return V1LayerParameter.LayerType.HDF5_OUTPUT;
    } else if (type == 'im2col') {
        return V1LayerParameter.LayerType.IM2COL;
    } else if (type == 'images') {
        return V1LayerParameter.LayerType.IMAGE_DATA;
    } else if (type == 'infogain_loss') {
        return V1LayerParameter.LayerType.INFOGAIN_LOSS;
    } else if (type == 'innerproduct') {
        return V1LayerParameter.LayerType.INNER_PRODUCT;
    } else if (type == 'lrn') {
        return V1LayerParameter.LayerType.LRN;
    } else if (type == 'multinomial_logistic_loss') {
        return V1LayerParameter.LayerType.MULTINOMIAL_LOGISTIC_LOSS;
    } else if (type == 'pool') {
        return V1LayerParameter.LayerType.POOLING;
    } else if (type == 'relu') {
        return V1LayerParameter.LayerType.RELU;
    } else if (type == 'sigmoid') {
        return V1LayerParameter.LayerType.SIGMOID;
    } else if (type == 'softmax') {
        return V1LayerParameter.LayerType.SOFTMAX;
    } else if (type == 'softmax_loss') {
        return V1LayerParameter.LayerType.SOFTMAX_LOSS;
    } else if (type == 'split') {
        return V1LayerParameter.LayerType.SPLIT;
    } else if (type == 'tanh') {
        return V1LayerParameter.LayerType.TANH;
    } else if (type == 'window_data') {
        return V1LayerParameter.LayerType.WINDOW_DATA;
    } else {
        return V1LayerParameter.LayerType.NONE;
    }
};

var UpgradeV1LayerType = function (type) {
    switch (type) {
        case V1LayerParameter.LayerType.NONE:
            return 'Default';
        case V1LayerParameter.LayerType.ABSVAL:
            return 'AbsVal';
        case V1LayerParameter.LayerType.ACCURACY:
            return 'Accuracy';
        case V1LayerParameter.LayerType.ARGMAX:
            return 'ArgMax';
        case V1LayerParameter.LayerType.BNLL:
            return 'BNLL';
        case V1LayerParameter.LayerType.CONCAT:
            return 'Concat';
        case V1LayerParameter.LayerType.CONTRASTIVE_LOSS:
            return 'ContrastiveLoss';
        case V1LayerParameter.LayerType.CONVOLUTION:
            return 'Convolution';
        case V1LayerParameter.LayerType.DECONVOLUTION:
            return 'Deconvolution';
        case V1LayerParameter.LayerType.DATA:
            return 'Data';
        case V1LayerParameter.LayerType.DROPOUT:
            return 'Dropout';
        case V1LayerParameter.LayerType.DUMMY_DATA:
            return 'DummyData';
        case V1LayerParameter.LayerType.EUCLIDEAN_LOSS:
            return 'EuclideanLoss';
        case V1LayerParameter.LayerType.ELTWISE:
            return 'Eltwise';
        case V1LayerParameter.LayerType.EXP:
            return 'Exp';
        case V1LayerParameter.LayerType.FLATTEN:
            return 'Flatten';
        case V1LayerParameter.LayerType.HDF5_DATA:
            return 'HDF5Data';
        case V1LayerParameter.LayerType.HDF5_OUTPUT:
            return 'HDF5Output';
        case V1LayerParameter.LayerType.HINGE_LOSS:
            return 'HingeLoss';
        case V1LayerParameter.LayerType.IM2COL:
            return 'Im2col';
        case V1LayerParameter.LayerType.IMAGE_DATA:
            return 'ImageData';
        case V1LayerParameter.LayerType.INFOGAIN_LOSS:
            return 'InfogainLoss';
        case V1LayerParameter.LayerType.INNER_PRODUCT:
            return 'InnerProduct';
        case V1LayerParameter.LayerType.LRN:
            return 'LRN';
        case V1LayerParameter.LayerType.MEMORY_DATA:
            return 'MemoryData';
        case V1LayerParameter.LayerType.MULTINOMIAL_LOGISTIC_LOSS:
            return 'MultinomialLogisticLoss';
        case V1LayerParameter.LayerType.MVN:
            return 'MVN';
        case V1LayerParameter.LayerType.POOLING:
            return 'Pooling';
        case V1LayerParameter.LayerType.POWER:
            return 'Power';
        case V1LayerParameter.LayerType.RELU:
            return 'ReLU';
        case V1LayerParameter.LayerType.SIGMOID:
            return 'Sigmoid';
        case V1LayerParameter.LayerType.SIGMOID_CROSS_ENTROPY_LOSS:
            return 'SigmoidCrossEntropyLoss';
        case V1LayerParameter.LayerType.SILENCE:
            return 'Silence';
        case V1LayerParameter.LayerType.SOFTMAX:
            return 'Softmax';
        case V1LayerParameter.LayerType.SOFTMAX_LOSS:
            return 'SoftmaxWithLoss';
        case V1LayerParameter.LayerType.SPLIT:
            return 'Split';
        case V1LayerParameter.LayerType.SLICE:
            return 'Slice';
        case V1LayerParameter.LayerType.TANH:
            return 'TanH';
        case V1LayerParameter.LayerType.WINDOW_DATA:
            return 'WindowData';
        case V1LayerParameter.LayerType.THRESHOLD:
            return 'Threshold';
        default:
            return '';
    }
};

var GetV0LayerType = function (type) {
    switch (type) {
        case 'Default':
            return 'NONE';
        case 'AbsVal':
            return 'ABSVAL';
        case 'Accuracy':
            return 'ACCURACY';
        case 'ArgMax':
            return 'ARGMAX';
        case 'BNLL':
            return 'BNLL';
        case 'Concat':
            return 'CONCAT';
        case 'ContrastiveLoss':
            return 'CONTRASTIVE_LOSS';
        case 'Convolution':
            return 'CONVOLUTION';
        case 'Deconvolution':
            return 'DECONVOLUTION';
        case 'Data':
            return 'DATA';
        case 'Dropout':
            return 'DROPOUT';
        case 'DummyData':
            return 'DUMMY_DATA';
        case 'EuclideanLoss':
            return 'EUCLIDEAN_LOSS';
        case 'Eltwise':
            return 'ELTWISE';
        case 'Exp':
            return 'EXP';
        case 'Flatten':
            return 'FLATTEN';
        case 'HDF5Data':
            return 'HDF5_DATA';
        case 'HDF5Output':
            return 'HDF5_OUTPUT';
        case 'HingeLoss':
            return 'HINGE_LOSS';
        case 'Im2col':
            return 'IM2COL';
        case 'ImageData':
            return 'IMAGE_DATA';
        case 'InfogainLoss':
            return 'INFOGAIN_LOSS';
        case 'InnerProduct':
            return 'INNER_PRODUCT';
        case 'LRN':
            return 'LRN';
        case 'MemoryData':
            return 'MEMORY_DATA';
        case 'MultinomialLogisticLoss':
            return 'MULTINOMIAL_LOGISTIC_LOSS';
        case 'MVN':
            return 'MVN';
        case 'Pooling':
            return 'POOLING';
        case 'Power':
            return 'POWER';
        case 'ReLU':
            return 'RELU';
        case 'Sigmoid':
            return 'SIGMOID';
        case 'SigmoidCrossEntropyLoss':
            return 'SIGMOID_CROSS_ENTROPY_LOSS';
        case 'Silence':
            return 'SILENCE';
        case 'Softmax':
            return 'SOFTMAX';
        case 'SoftmaxWithLoss':
            return 'SOFTMAX_LOSS';
        case 'Split':
            return 'SPLIT';
        case 'Slice':
            return 'SLICE';
        case 'TanH':
            return 'TANH';
        case 'WindowData':
            return 'WINDOW_DATA';
        case 'Threshold':
            return 'THRESHOLD';
        default:
            return '';
    }
};
