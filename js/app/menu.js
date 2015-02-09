define(['jquery', 'protobuf', 'app/layer', 'app/relationship', 'app/controller'], function($, pb, layer, relationship, controller){

    var canvas = controller.getCanvas();
    var instances = {};
    var menuY = 50;
    var menuSeparatorX = 150;

    var Menu = {
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
                'softmax_loss': {},
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
                'dropout': {

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

        createNet: function(net) {
            console.log("[createNet]");

            var levelMapper = {};

            var findLayer = function(search) {
                var i = net['layers'].length;
                while (--i >= 0) {
                    var layer = net['layers'][i];

                    if (('top' in layer && 
                                ((typeof layer.top === 'string' && search == layer.top) || 
                                ($.isArray(layer.top) && $.inArray(search, layer.top) >= 0))
                            ) && 
                        /*layer.top != layer.bottom &&*/
                        layer.name in levelMapper) {

                        return layer;
                    }
                }

                return null;
            }

            var i = 0;
            var n = net['layers'].length;
            var levels = {};
            var currentLevel = 0;
            for (; i < n; ++i) {
                var current = net['layers'][i];
                var found = false;

                var bottomName = current.bottom;
                if ($.isArray(current.bottom))
                {
                    // Simply use the 1st one, we are not interested in relationships (yet)
                    // only in jerarchy
                    bottomName = current.bottom[0];
                }  

                if (current.bottom && bottomName != current.name) {
                    var top = findLayer(bottomName);
                    if (top != null) {
                        currentLevel = levelMapper[top.name][0] + 1;
                        found = true;
                    }
                }

                levelMapper[current.name] = [currentLevel, current];

                if (!(currentLevel in levels)) {
                    levels[currentLevel] = [];
                }

                levels[currentLevel].push(i);
            }

            // Find out the max number of layers in a level of the net
            var layerSeparation = {x: 160, y: -100}
            var maxLayersPerLevel = 0;
            for (level in levels) {
                if (levels[level].length > maxLayersPerLevel)
                    maxLayersPerLevel = levels[level].length;
            }

            var maxWidth = maxLayersPerLevel*layerSeparation.x;

            var netToLayers = {};
            var addToNetLayers = function(netLayer, outLayer) {
                var _addTop = function(top) {
                    if (netLayer.include) {
                        if (!netToLayers[top] || !$.isArray(netToLayers[top]))
                        {
                            netToLayers[top] = [];
                        }
                        netToLayers[top].push(outLayer);
                    }
                    else {
                        netToLayers[top] = outLayer;
                    }
                }

                if (typeof netLayer.top === 'string') {
                    _addTop(netLayer.top);
                }
                else if ($.isArray(netLayer.top))
                {
                    for (k in netLayer.top) {
                        _addTop(netLayer.top[k]);
                    }
                }  
            }

            var createRelationship = function(netLayer, outLayer) {
                var _create = function(bottom) {
                    if ($.isArray(netToLayers[bottom])) {
                        for (k in netToLayers[bottom]) {
                            relationship.create(netToLayers[bottom][k], outLayer);
                        }
                    }
                    else {
                        relationship.create(netToLayers[bottom], outLayer);
                    }
                }

                if (typeof netLayer.bottom === 'string') {
                    _create(netLayer.bottom);
                }
                else if ($.isArray(netLayer.bottom))
                {
                    for (k in netLayer.bottom) {
                        _create(netLayer.bottom[k]);
                    }
                }   
            }


            var centerX = (parseInt(canvas.css('width')) - 170) / 2 - maxWidth / 2;
            var y = parseInt(canvas.css('height'));
            for (level in levels) {
                var layersInLevel = levels[level];

                console.log("===============");
                console.log("Level " + level);

                var len = levels[level].length;
                var x = 170 + centerX + (maxWidth / 2) - (len * layerSeparation.x / 2);
                for (var i = 0; i < len; ++i) {
                    var current = net['layers'][levels[level][i]];
                    var outLayer = layer.createDefinitive(x, y, current.type.toLowerCase(), current.name, current);

                    createRelationship(current, outLayer);
                    addToNetLayers(current, outLayer);          

                    x += 160;
                }

                y -= 100;
            }

            canvas.drawLayers();
        },

        create: function() {

            var showImport = function() {
                if ($('#import_prototxt').is(':visible'))
                    return;

                var textX = menuSeparatorX + 10;
                var input = $('<textarea>');
                input.attr({
                    id: 'import_prototxt'
                })
                .css({
                    position: 'absolute',
                    left: textX,
                    top: 10,
                    width: 'calc(100% - ' + (textX + 20) + 'px)',
                    height: 'calc(100% - 28px)',
                    border: '2px solid #000',
                    'border-radius': '2px'
                })
                .keydown(function(e){
                    var code = e.keyCode || e.which;
                    if (code == 13 && e.ctrlKey){
                            var net = pb.parseProto($(this).val());
                            Menu.createNet(net);
                        try {
                        }
                        catch (err) {
                            alert("Could not parse net prototxt file");
                        }

                        $(this).remove();
                    }

                    // Avoid keys such as "DEL" to reach window
                    e.stopPropagation();
                })
                .bind('mousewheel', function(e){
                    e.stopPropagation();
                })
                .appendTo('body');
            }

            // Import button
            canvas.drawRect({
                layer: true,
                draggable: false,
                fromCenter: false,
                x: -3, y: 12,
                width: 153,
                height: 20,
                cornerRadius: 0,

                strokeStyle: "#000000",
                strokeWidth: 2,
                fillStyle: "#63ab2a",

                click: showImport
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
                x: 20, y: 15,
                fontSize: 13,
                fontFamily: 'Verdana, sans-serif',
                text: "Import prototxt",

                click: showImport
            });


            var ey = menuY;
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
                                    y: menuY - 3
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][1], {
                                    y: menuY + 7
                                }, 'medium', 'swing');
                                $(this).animateLayer(instances[g][2], {
                                    y: menuY
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
                            var ey = menuY;
                            
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
                    layers.push(layer.create(25, menuY + 25 + 60*i, l, false));
                    i += 1;
                }

                instances[group] = [box, poly, text, layers];

                ey += 25;
            }

            canvas.drawLine({
                strokeStyle: '#000',
                layer: true,
                strokeWidth: 3,
                x1: menuSeparatorX, y1: 0,
                x2: menuSeparatorX, y2: 9000,
            });
        }
    };

    return Menu;
});
