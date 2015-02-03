define([], function(){
    return {
        instances: {},
        groups: {
            'Vision Layers': {
                'convolution' : {
                    'in': ['n', 'c_i', 'h_i', 'w_i'],
                    'out': ['n', 'c_o', 'h_o', 'w_o'],

                    'pre_conditions': 'num_output && (kernel_size || (kernel_h && kernel_w))',
                    'pre_transform': [
                        'var kernel_h = kernel_h || kernel_size',
                        'var kernel_w = kernel_w || kernel_size',
                        'var pad_h = pad_h || pad || 0',
                        'var pad_w = pad_w || pad || 0',
                        'var stride_h = stride_h || stride || 1',
                        'var stride_w = stride_w || stride || 1',
                    ],
                    'transform_rules' : {
                        'h_o': '(h_i + 2 * pad_h - kernel_h) / stride_h + 1',
                        'w_o': '(h_i + 2 * pad_h - kernel_w) / stride_h + 1',
                    },
                },

                'pooling' : {
                    'in': ['n', 'c', 'h_i', 'w_i'],
                    'out': ['n', 'c', 'h_o', 'w_o'],

                    'pre_conditions': 'kernel_size || (kernel_h && kernel_w)',
                    'pre_transform': [
                        'var kernel_h = kernel_h || kernel_size',
                        'var kernel_w = kernel_w || kernel_size',
                        'var pad_h = pad_h || pad || 0',
                        'var pad_w = pad_w || pad || 0',
                        'var stride_h = stride_h || stride || 1',
                        'var stride_w = stride_w || stride || 1',
                    ],
                    'transform_rules' : {
                        'h_o': '(h_i + 2 * pad_h - kernel_h) / stride_h + 1',
                        'w_o': '(h_i + 2 * pad_h - kernel_w) / stride_h + 1',
                    },
                },

                'lrn' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w'],
                },

                'im2col' : {
                    'in': ['n', 'c', 'h_i', 'w_i'],
                    'out': ['n', 'c', 'h_o', 'w_o'],
                },
            },


            'Loss Layers': {
                'softmax': {},
                'euclidean': {},
                'hinge': {},
                'sigmoid_gain': {},
                'infogain': {},
                'accuracy': {},
            },

            'Activation Layers': {
                'relu' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },
                'sigmoid' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },
                'tanh' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },
                'absval' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },
                'power' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },

                'bnll' : {
                    'in': ['n', 'c', 'h', 'w'],
                    'out': ['n', 'c', 'h', 'w']
                },
            },

            'Data Layers': {
                'data' : {
                    'out': ['n', 'c', 'h', 'w'],

                    'pre_conditions': 'source && batch_size',
                    'pre_transform': [
                        'var n = batch_size',
                        'var c = c || 3',
                        'var w = w || 256',
                        'var h = h || 256'
                    ]
                },
                
                'memory' : {
                    'out': ['n', 'c', 'h', 'w'],

                    'pre_conditions': 'batch_size && channels && height && width',
                    'pre_transform': [
                        'var n = batch_size',
                        'var c = channels || 3',
                        'var w = width || 256',
                        'var h = height || 256'
                    ]
                },

                'hdf5' : {
                    'out': ['n', 'c', 'h', 'w'],

                    'pre_conditions': 'source && batch_size',
                    'pre_transform': [
                        'var n = batch_size',
                        'var c = c || 3',
                        'var w = w || 256',
                        'var h = h || 256'
                    ]
                },

                'image' : {
                    'out': ['n', 'c', 'h', 'w'],

                    'pre_conditions': 'source && batch_size',
                    'pre_transform': [
                        'var n = batch_size',
                        'var c = c || 3',
                        'var w = w || 256',
                        'var h = h || 256'
                    ]
                },

                'window' : {},
                'dummy' : {},
            },

            'Common Layers': {
                'inner_product' : {
                    'in': ['n', 'c_i', 'h_i', 'w_i'],
                    'out': ['n', 'c_o', '1', '1'],

                    'pre_conditions': 'num_output',
                    'pre_transform': [
                        'var c_o = num_output'
                    ]
                },
                
                'split' : {},
                'flatten' : {},
                'concat' : {},
                'slice' : {},
            },
        },

        create: function() {

        }
    }
});
