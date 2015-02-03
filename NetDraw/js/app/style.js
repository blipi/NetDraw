define([], function(){
    return {
       featuresMapping: {
            'convolution' : {
                fillStyle: '#256fb3',
                strokeWidth: 4,
                strokeStyle: '#000',

                text : {
                    name: 'Conv',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                },

                default: {
                    convolution_param: {
                        num_output: 0,
                        kernel_size: 0,
                        weight_filter: {
                            type: 'constant',
                            value: 0
                        },
                        bias_term: true,
                        pad: 0,
                        stride: 1,
                        group: 1,
                        bias_filler: {
                            type: "constant",
                            value: 0.2
                        }
                    }
                }
            },

            'pooling': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Pooling',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                },

                default: {
                    pooling_param: {
                        kernel_size: 0,
                        pool: 'MAX',
                        pad: 0,
                        stride: 1
                    }
                }
            },

            'lrn': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'LRN',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'im2col': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'im2col',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'softmax': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'SoftMax',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'euclidean': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Euclidean',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'hinge': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Hinge',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'sigmoid_gain': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Sigmoid Gain',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'infogain': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'InfoGain',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'accuracy': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Accuracy',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'relu': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'ReLU',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'sigmoid': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Sigmoid',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'tanh': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'TanH',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'absval': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'AbsVal',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'power': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Power',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'bnll': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'BNLL',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'data': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Database',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'memory': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Memory',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'hdf5': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'HDF5',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'image': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Image',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'window': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Window',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'dummy': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Dummy',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'inner_product': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Inner Product',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'split': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Split',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'flatten': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Flatten',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'concat': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Concat',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },

            'slice': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    name: 'Slice',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 25,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },
        }
    }
});
