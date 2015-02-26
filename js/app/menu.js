define(['jquery', 'protobuf.2', 'app/layer', 'app/relationship', 'app/controller', 'caffeconstants'], function($, pb, layer, relationship, controller, caffe){

    var canvas = controller.getCanvas();
    var instances = {};
    var menuY = 50;
    var menuSeparatorX = 150;

    var Menu = {


        createNet: function(net) {
            console.log("[createNet]");

            var levelMapper = {};

            var exists = function(needle, haystack) {
                for (var i = 0, len = haystack.length; i < len; ++i) {
                    if (haystack[i].value == needle) {
                        return i;
                    }
                }

                return -1;
            }

            var findLayer = function(search) {
                var i = net.length;
                while (--i >= 0) {
                    var layer = net[i]['layer'];

                    if (('top' in layer && 
                                (('value' in layer.top && search == layer.top.value) || 
                                ($.isArray(layer.top) && exists(search, layer.top) >= 0))
                            ) && 
                        /*layer.top != layer.bottom &&*/
                        layer.name.value in levelMapper) {

                        return layer;
                    }
                }

                return null;
            }

            var i = 0;
            var n = net.length;
            var levels = {};
            var currentLevel = 0;
            for (; i < n; ++i) {
                var current = net[i]['layer'];
                var found = false;

                if ('bottom' in current) {
                    var bottomName = current.bottom.value;
                    if ($.isArray(current.bottom))
                    {
                        // Simply use the 1st one, we are not interested in relationships (yet)
                        // only in jerarchy
                        bottomName = current.bottom[0].value;
                    }  

                    if (bottomName != current.name.value) {
                        var top = findLayer(bottomName);
                        if (top != null) {
                            currentLevel = levelMapper[top.name.value][0] + 1;
                            found = true;
                        }
                    }
                }

                levelMapper[current.name.value] = [currentLevel, current];

                if (!(currentLevel in levels)) {
                    levels[currentLevel] = [];
                }

                levels[currentLevel].push(i);
            }

            // Find out the max number of layers in a level of the net
            var layerSeparation = {x: 160, y: -100}
            var maxLayersPerLevel = 0;
            var levelsCount = 0;
            for (level in levels) {
                ++levelsCount;
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

                if ('top' in netLayer) {
                    if ('value' in netLayer.top) {
                        _addTop(netLayer.top.value);
                    }
                    else if ($.isArray(netLayer.top))
                    {
                        for (k in netLayer.top) {
                            _addTop(netLayer.top[k].value);
                        }
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

                if ('bottom' in netLayer) {
                    if ('value' in netLayer.bottom) {
                        _create(netLayer.bottom.value);
                    }
                    else if ($.isArray(netLayer.bottom))
                    {
                        for (k in netLayer.bottom) {
                            _create(netLayer.bottom[k].value);
                        }
                    }
                }
            }

            var totalHeight = parseInt(canvas.css('height'));
            var needHeight = levelsCount * 100;
            totalHeight = needHeight > totalHeight ? needHeight : totalHeight;
            canvas.css('height', totalHeight);

            var centerX = (parseInt(canvas.css('width')) - 170) / 2 - maxWidth / 2;
            var y = totalHeight - 75;
            for (level in levels) {
                var layersInLevel = levels[level];

                console.log("===============");
                console.log("Level " + level);

                var len = levels[level].length;
                var x = 170 + centerX + (maxWidth / 2) - (len * layerSeparation.x / 2);
                for (var i = 0; i < len; ++i) {
                    var current = net[levels[level][i]]['layer'];
                    var outLayer = layer.createDefinitive(x, y, current.type.value, current.name.value, current);

                    createRelationship(current, outLayer);
                    addToNetLayers(current, outLayer);          

                    x += 160;
                }

                y -= 100;
            }

            canvas.drawLayers();
        },

        create: function() {

            groups = {};
            groups['Vision Layers'] = [
                V1LayerParameter.LayerType.CONVOLUTION, 
                V1LayerParameter.LayerType.POOLING,
                V1LayerParameter.LayerType.LRN,
                V1LayerParameter.LayerType.IM2COL
            ];

            groups['Loss Layers'] = [
                V1LayerParameter.LayerType.SOFTMAX_LOSS,
                V1LayerParameter.LayerType.EUCLIDEAN_LOSS,
                V1LayerParameter.LayerType.HINGE,
                V1LayerParameter.LayerType.SIGMOID,
                V1LayerParameter.LayerType.INFOGAIN_LOSS,
                V1LayerParameter.LayerType.ACCURACY
            ];

            groups['Activation Layers'] = [
                V1LayerParameter.LayerType.RELU,
                V1LayerParameter.LayerType.DROPOUT,
                V1LayerParameter.LayerType.SIGMOID,
                V1LayerParameter.LayerType.TANH,
                V1LayerParameter.LayerType.ABSVAL,
                V1LayerParameter.LayerType.POWER,
                V1LayerParameter.LayerType.BNLL
            ];

            groups['Data Layers'] = [
                V1LayerParameter.LayerType.DATA,
                V1LayerParameter.LayerType.MEMORY_DATA,
                V1LayerParameter.LayerType.HDF5_DATA,
                V1LayerParameter.LayerType.IMAGE_DATA,
                V1LayerParameter.LayerType.WINDOW_DATA,
                V1LayerParameter.LayerType.DUMMY_DATA
            ];

            groups['Common Layers'] = [
                V1LayerParameter.LayerType.INNER_PRODUCT,
                V1LayerParameter.LayerType.SPLIT,
                V1LayerParameter.LayerType.FLATTEN,
                V1LayerParameter.LayerType.CONCAT,
                V1LayerParameter.LayerType.SLICE
            ];

            console.log(groups);

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
                            var parser = new ProtoBuf();
                            var net = parser.compile($(this).val());
                            net = parser.upgrade(net);
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

            var menuObj = $('#menu');

            // Import button
            canvas.drawRectInto(menuObj, {
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
            canvas.drawTextInto(box, {
                layer: true,
                draggable: false,
                fillStyle: "#000",
                strokeStyle: "#000",
                strokeWidth: 0,
                fromCenter: false,
                x: 20, y: 0,
                fontSize: 13,
                fontFamily: 'Verdana, sans-serif',
                text: "Import prototxt",

                click: showImport
            });

            var menu_onclick = function(layer){
                if (!instances[layer.g][3]) {
                    /* Expand */
                    for (g in instances) {

                        this.animateLayer(instances[g][0], {
                            y: menuY - 3
                        }, 'medium', 'swing');

                        if (instances[g][0] == layer || instances[g][1] == layer) {
                            canvas.bringToFront(instances[g][0]);
                            canvas.bringToFront(instances[g][1]);
                        }
                    }

                    for (l in instances[layer.g][2]) {
                        instances[layer.g][2][l].visible = true;
                        instances[layer.g][2][l].node.textElement.visible = true;
                    }
                } else {
                    var ey = menuY;
                    
                    for (l in instances[layer.g][2]) {
                        instances[layer.g][2][l].visible = false;
                        instances[layer.g][2][l].node.textElement.visible = false;
                    }

                    /* Expand */
                    for (g in instances) {

                        this.animateLayer(instances[g][0], {
                            y: ey - 3
                        }, 'medium', 'swing');

                        ey += 25;
                    }
                }

                instances[layer.g][3] = !instances[layer.g][3];
            };

            var ey = menuY;
            for (group in groups) {

                /* Box */
                canvas.drawRectInto(menu, {
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
                    
                    expanded: false,
                    g: group,

                    click: menu_onclick
                });

                var box = canvas.getLayer(-1);

                /* Text */
                canvas.drawTextInto(box, {
                    layer: true,
                    draggable: false,
                    fillStyle: "#000",
                    strokeStyle: "#000",
                    strokeWidth: 0,
                    fromCenter: false,
                    x: 10, y: 0,
                    fontSize: 13,
                    fontFamily: 'Verdana, sans-serif',
                    text: group,

                    expanded: false,
                    g: group,
                });

                var text = canvas.getLayer(-1);
                
                console.log("================");
                console.log(group);

                var layers = [];
                var i = 0;
                for (var k = 0, len = groups[group].length; k < len; ++k) {
                    var layerType = UpgradeV1LayerType(parseInt(groups[group][k]));

                    layers.push(layer.create(25, menuY + 25 + 60*i, layerType, false, menu));
                    i += 1;
                }

                instances[group] = [box, text, layers, false];

                ey += 25;
            }
        }
    };

    return Menu;
});
