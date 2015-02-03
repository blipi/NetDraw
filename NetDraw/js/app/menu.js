define(['jquery', 'app/layer', 'app/controller'], function($, layer, controller){

    var canvas = controller.getCanvas();
    var instances = {};

    return {
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
            var ey = 15;
            for (group in this.groups) {

                /* Box */
                canvas.drawRect({
                    layer: true,
                    draggable: false,
                    fromCenter: false,
                    x: -3, y: -3 + ey,
                    width: 153,
                    height: 20,
                    cornerRadius: 0,

                    strokeStyle: "#000000",
                    strokeWidth: 2,
                    fillStyle: "#ea940e",
                });

                var box = canvas.getLayer(-1);

                /* Text */
                canvas.drawText({
                    layer: true,
                    draggable: false,
                    fillStyle: "#000",
                    strokeStyle: "#000",
                    strokeWidth: 0,
                    fromCenter: false,
                    x: 10, y: ey,
                    fontSize: 13,
                    fontFamily: 'Verdana, sans-serif',
                    text: group,
                });

                var text = canvas.getLayer(-1);

                // Draw a shield-like shape
                $('canvas').drawPolygon({
                    layer: true,
                    fillStyle: '#eadebc',
                    strokeStyle: '#000000',
                    strokeWidth: 1,
                    x: 138, y: ey + 7,
                    radius: 5,
                    sides: 3,
                    concavity: -0.5,
                    rotate: 180,

                    b: box,
                    g: group,
                    t: text,

                    click: function(layer){
                        if (layer.rotate == 180) {
                            /* Expand */
                            for (g in instances) {
                                $(this).animateLayer(instances[g][0], {
                                    y: 12
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][1], {
                                    y: 23
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][2], {
                                    y: 15
                                }, 'medium', 'swing');
                            }

                            $(this).animateLayer(layer, {
                                fillStyle: '#eaae0e',
                                rotate: 0
                            }, 'slow', 'swing');

                            var top = canvas.getLayers().length;
                            canvas.moveLayer(layer.b, top);
                            canvas.moveLayer(layer, top);
                            canvas.moveLayer(layer.t, top);

                            for (l in instances[layer.g][3]) {
                                instances[layer.g][3][l].visible = true;
                                instances[layer.g][3][l].node.textElement.visible = true;
                            }
                        } else {
                            var ey = 15;
                            
                            for (l in instances[layer.g][3]) {
                                instances[layer.g][3][l].visible = false;
                                instances[layer.g][3][l].node.textElement.visible = false;
                            }

                            /* Expand */
                            for (g in instances) {

                                $(this).animateLayer(instances[g][0], {
                                    y: ey - 3
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][1], {
                                    y: ey + 7
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][2], {
                                    y: ey
                                }, 'medium', 'swing');
                            
                                ey += 25;
                            }

                            $(this).animateLayer(layer, {
                                fillStyle: '#eadebc',
                                rotate: 180
                            }, 'slow', 'swing');
                        }
                    }
                });

                var poly = canvas.getLayer(-1);

                var layers = [];
                var i = 0;
                
                console.log("================");
                console.log(group);

                for (l in this.groups[group]) {
                    layers.push(layer.create(25, 40 + 60*i, l, false));
                    i += 1;
                }

                instances[group] = [box, poly, text, layers];

                ey += 25;
            }

            canvas.drawLine({
                strokeStyle: '#000',
                layer: true,
                strokeWidth: 3,
                x1: 150, y1: 0,
                x2: 150, y2: 9000,
            });
        }
    }
});
