define(['jquery', 'protobuf', 'app/style', 'app/controller', 'app/relationship', 'utils/mousehelper'], function($, pb, style, controller, relationship, mouse) {

    var canvas = controller.getCanvas();
    var _counter = 0;
    var _realCounter = 0;

    var Layer = {
        remove: function(layer) {

            if (layer.node.func == 'bottom') {
                console.log("[layer.remove][bottom] {" + layer.node.id + '}');

                var fromRelationships = controller.getMappingsFor('from', layer.node.parent);
                
                var n = fromRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    if (fromRelationships[i].node.bottom == layer) {
                        relationship.remove(fromRelationships[i]);
                    }
                }

                var total = layer.node.parent.node.bottom.length;
                var idx = 0;
                for (i = 0; i < total; ++i) {
                    if (layer.node.parent.node.bottom[i] == layer)
                    {
                        idx = i;
                        break;
                    }
                }

                layer.node.parent.node.bottom.splice(idx, 1);
                canvas.removeLayer(layer);

                // How many bottoms are already being used?
                --total;
                var used = 0;
                for (i = 0; i < total; ++i) {
                    if (layer.node.parent.node.bottom[i].node.used)
                        ++used;
                }

                // If all are used, create them
                if (used == total) {
                    Layer.createBottomPoint(layer.node.parent);
                }

                return;
            }

            console.log("[layer.remove] {" + layer.node.id + '}');

            // Remove layer's text and top point
            canvas.removeLayer(layer.node.textElement);

            for (i in layer.node.bottom) {
                canvas.removeLayer(layer.node.bottom[i]);
            }

            var fromRelationships = controller.getMappingsFor('from', layer);
            var toRelationships = controller.getMappingsFor('to', layer);
            
            var n = fromRelationships.length;
            var i = 0;

            // Delete all relationships starting from this node
            for (; i < n; ++i) {
                relationship.remove(fromRelationships[i]);
            }

            n = toRelationships.length;
            i = 0;

            // Delete all relationships ending to this node
            for (; i < n; ++i) {
                relationship.remove(toRelationships[i]);
            }

            // Remove layer mappings
            controller.removeLayerMappings(layer);

            // Remove line itself
            canvas.removeLayer(layer);

            if ('input' in layer.node && layer.node.input) {
                layer.node.input.remove();
            }

            if ('params_input' in layer.node && layer.node.params_input) {
                layer.node.params_input.remove();
            }
        },

        create: function(x, y, type, visibility) {
            console.log("[layer.create] {" + x + "," + y + "," + type + "}");

            var features = style.featuresMapping[type];

            var rect_click = function(layer) {
                controller.setSelection(layer);
                layer.strokeStyle = "#a23";

                if (mouse.isDoubleClick() && layer.node.func == 'main') {
                    if (layer.node.params_input)
                        return;

                    var input = $('<textarea>');
                    input.attr({
                        id: layer.node.id
                    })
                    .css({
                        position: 'absolute',
                        left: layer.x + 110,
                        top: layer.y - 20,
                        width: 200,
                        height: 100,
                        border: '2px solid #000',
                        'border-radius': '2px'
                    })
                    .keydown(function(e){
                        var code = e.keyCode || e.which;
                        if (code == 13 && e.ctrlKey){
                            layer.node.params = $(this).val();
                            $(this).remove();
                            layer.node.params_input = null;

                            //console.log(pb.getJSON(layer.node.params));
                        }

                        // Avoid keys such as "DEL" to reach window
                        e.stopPropagation();
                    })
                    .bind('mousewheel', function(e){
                        e.stopPropagation();
                    })
                    .appendTo('body')
                    .val(layer.node.params);

                    layer.node.params_input = input;
                }
            }

            /* Forward declaration of handlers */
            var rect_ondragstart = function(layer) {
                layer.dragstart = function(layer){
                    var front = canvas.getLayers().length;
                    canvas.moveLayer(layer, front);
                    controller.setSelection(layer);
                }
            };

            var rect_drag = function(layer) {
                var front = canvas.getLayers().length;

                var mappings = controller.getMappings();
                var fromRelationships = mappings['from'][layer.node.id];
                var toRelationships = mappings['to'][layer.node.id];

                var n = fromRelationships.length;
                var i = 0;
            
                for (; i < n; ++i) {
                    var line = fromRelationships[i];
                    line.x1 = line.node.bottom.x;
                    line.y1 = line.node.bottom.y;
                }

                n = toRelationships.length;
                i = 0;

                for (; i < n; ++i) {
                    var line = toRelationships[i];
                    line.x2 = line.node.top.x;
                    line.y2 = line.node.top.y;
                }

                if ('input' in layer.node.textElement.node && layer.node.textElement.node.input) {
                    layer.node.textElement.node.input.css({
                        left: layer.node.textElement.x - 45,
                        top: layer.node.textElement.y - 7
                    });
                }

                if ('params_input' in layer.node && layer.node.params_input) {
                    layer.node.params_input.css({
                        left: layer.x + 110,
                        top: layer.y - 20
                    });
                }


                /* Bring to top */
                for (i in layer.node.bottom) {
                    canvas.moveLayer(layer.node.bottom[i], front);
                }
                canvas.moveLayer(layer.node.textElement, front);
            };

            var rect_dragstop = function(layer) {
                canvasLayer = Layer.create(layer.x, layer.y, layer.node.name, true);
                Layer.createBottomPoint(canvasLayer);
                canvasLayer.node.counter = _realCounter;
                canvasLayer.node.textElement.text = canvasLayer.node.name + '_' + _realCounter;
                canvasLayer.node.textElement.node.func = 'text';
                canvasLayer.node.func = 'main';

                ++_realCounter;

                layer.x = layer.ox;
                layer.y = layer.oy;
                layer.node.textElement.x = layer.node.textElement.ox;
                layer.node.textElement.y = layer.node.textElement.oy;

                canvasLayer.dragstop = function(layer){}
                canvasLayer.click = rect_click;
            };


            /* Draw all usable elements */
            canvas.drawRect({
                layer: true,
                draggable: true,
                bringToFront: true,
                fromCenter: false,
                x: x, y: y,
                ox: x, oy: y,
                width: 100,
                height: 50,
                cornerRadius: 2,
                visible: visibility,

                strokeStyle: features['strokeStyle'],
                strokeWidth: features['strokeWidth'],
                fillStyle: features['fillStyle'],

                groups: [type + '_' + _counter],
                dragGroups: [type + '_' + _counter],

                node: {
                    func: 'reserved',
                    name: type,
                    id: type + '_' + _counter,

                    textElement: null,
                    bottom: [],
                },

                dragstart: rect_ondragstart,
                drag: rect_drag,
                dragstop: rect_dragstop
            });

            var currentLayer = canvas.getLayer(-1);
            controller.createLayerMappings(currentLayer);

            if ('default' in features) {
                currentLayer.node.params = pb.getProto(features['default']);
            } else {
                currentLayer.node.params = currentLayer.node.name + '_param {\n}';
            }

            var text_onclick = function(layer) {
                if (mouse.isDoubleClick() && layer.node.func == 'text') { 
                    if (layer.node.input)
                        return;

                    var input = $('<input>');
                    input.attr({
                        id: layer.node.parent.node.id,
                        type: 'text',
                        value: layer.text
                    })
                    .css({
                        position: 'absolute',
                        left: layer.x - 45,
                        top: layer.y - 7,
                        width: 100,
                        height: 20,
                        'text-align': 'center'
                    })
                    .keydown(function(e){
                        var code = e.keyCode || e.which;
                        if (code == 13){
                            if ($(this).val()) {
                                layer.text = $(this).val();
                                $(this).remove();
                                canvas.drawLayers();
                                layer.node.input = null;
                            }
                        }

                        // Avoid keys such as "DEL" to reach window
                        e.stopPropagation();
                    })
                    .appendTo('body')
                    .select();

                    layer.node.input = input;
                    controller.clearSelection();

                    return true;
                }

                return false;
            };

            var textFeatures = features['text'];
            canvas.drawText({
                layer: true,
                fillStyle: textFeatures['fillStyle'],
                strokeStyle: textFeatures['strokeStyle'],
                strokeWidth: textFeatures['strokeWidth'],
                x: currentLayer.x + textFeatures['x'], y: currentLayer.y + textFeatures['y'],
                ox: currentLayer.x + textFeatures['x'], oy: currentLayer.y + textFeatures['y'],
                fontSize: 16,
                fontFamily: 'Verdana, sans-serif',
                text: textFeatures['name'],
                visible: visibility,

                node: {
                    parent: currentLayer,
                    func: 'reserved'
                },

                click: function(layer) {
                    if (!text_onclick(layer) && layer.node.parent.click) {
                        layer.node.parent.click(layer.node.parent);
                    }
                },
                dragstart: function(layer) { layer.node.parent.dragstart(layer.node.parent); },
                drag: function(layer) { layer.node.parent.drag(layer.node.parent); },
                dragstop: function(layer) { layer.node.parent.dragstop(layer.node.parent); },

                groups: [type + '_' + _counter],
                dragGroups: [type + '_' + _counter],
            });

            currentLayer.node.textElement = canvas.getLayer(-1);

            ++_counter;
            return currentLayer;
        },

        createDefinitive: function(x, y, type, name, params) {
            console.log("[layer.createDefinitive] {" + x + "," + y + "," + type + "}");

            var features = style.featuresMapping[type];

            var rect_click = function(layer) {
                controller.setSelection(layer);
                layer.strokeStyle = "#a23";

                if (mouse.isDoubleClick() && layer.node.func == 'main') {
                    if (layer.node.params_input)
                        return;

                    var input = $('<textarea>');
                    input.attr({
                        id: layer.node.id
                    })
                    .css({
                        position: 'absolute',
                        left: layer.x + 110,
                        top: layer.y - 20,
                        width: 200,
                        height: 100,
                        border: '2px solid #000',
                        'border-radius': '2px'
                    })
                    .keydown(function(e){
                        var code = e.keyCode || e.which;
                        if (code == 13 && e.ctrlKey){
                            layer.node.params = $(this).val();
                            $(this).remove();
                            layer.node.params_input = null;

                            //console.log(pb.getJSON(layer.node.params));
                        }

                        // Avoid keys such as "DEL" to reach window
                        e.stopPropagation();
                    })
                    .bind('mousewheel', function(e){
                        e.stopPropagation();
                    })
                    .appendTo('body')
                    .val(layer.node.params);

                    layer.node.params_input = input;
                }
            }

            /* Forward declaration of handlers */
            var rect_ondragstart = function(layer) {
                var front = canvas.getLayers().length;
                canvas.moveLayer(layer, front);
                controller.setSelection(layer);
            };

            var rect_drag = function(layer) {
                var front = canvas.getLayers().length;

                var mappings = controller.getMappings();
                var fromRelationships = mappings['from'][layer.node.id];
                var toRelationships = mappings['to'][layer.node.id];

                var n = fromRelationships.length;
                var i = 0;
            
                for (; i < n; ++i) {
                    var line = fromRelationships[i];
                    line.x1 = layer.node.top.x;
                    line.y1 = layer.node.top.y;
                }

                n = toRelationships.length;
                i = 0;

                for (; i < n; ++i) {
                    var line = toRelationships[i];
                    line.x2 = line.node.bottom.x;
                    line.y2 = line.node.bottom.y;
                }

                if ('input' in layer.node.textElement.node && layer.node.textElement.node.input) {
                    layer.node.textElement.node.input.css({
                        left: layer.node.textElement.x - 45,
                        top: layer.node.textElement.y - 7
                    });
                }

                if ('params_input' in layer.node && layer.node.params_input) {
                    layer.node.params_input.css({
                        left: layer.x + 110,
                        top: layer.y - 20
                    });
                }


                /* Bring to top */
                for (i in layer.node.bottom) {
                    canvas.removeLayer(layer.node.bottom[i]);
                }
                canvas.moveLayer(layer.node.textElement, front);
            };

            var rect_dragstop = function(layer) {
            };


            /* Draw all usable elements */
            canvas.drawRect({
                layer: true,
                draggable: true,
                bringToFront: true,
                fromCenter: false,
                x: x, y: y,
                ox: x, oy: y,
                width: 100,
                height: 50,
                cornerRadius: 2,

                strokeStyle: features['strokeStyle'],
                strokeWidth: features['strokeWidth'],
                fillStyle: features['fillStyle'],

                groups: [type + '_' + _counter],
                dragGroups: [type + '_' + _counter],

                node: {
                    func: 'main',
                    name: type,
                    id: type + '_' + _counter,

                    textElement: null,
                    bottom: [],
                },

                click: rect_click,
                dragstart: rect_ondragstart,
                drag: rect_drag,
                dragstop: rect_dragstop
            });

            var currentLayer = canvas.getLayer(-1);
            controller.createLayerMappings(currentLayer);

            currentLayer.node.params = pb.getProto(params);

            var text_onclick = function(layer) {
                if (mouse.isDoubleClick() && layer.node.func == 'text') { 
                    if (layer.node.input)
                        return;

                    var input = $('<input>');
                    input.attr({
                        id: layer.node.parent.node.id,
                        type: 'text',
                        value: layer.text
                    })
                    .css({
                        position: 'absolute',
                        left: layer.x - 45,
                        top: layer.y - 7,
                        width: 100,
                        height: 20,
                        'text-align': 'center'
                    })
                    .keydown(function(e){
                        var code = e.keyCode || e.which;
                        if (code == 13){
                            if ($(this).val()) {
                                layer.text = $(this).val();
                                $(this).remove();
                                canvas.drawLayers();
                                layer.node.input = null;
                            }
                        }

                        // Avoid keys such as "DEL" to reach window
                        e.stopPropagation();
                    })
                    .appendTo('body')
                    .select();

                    layer.node.input = input;
                    controller.clearSelection();

                    return true;
                }

                return false;
            };

            var textFeatures = features['text'];
            canvas.drawText({
                layer: true,
                fillStyle: textFeatures['fillStyle'],
                strokeStyle: textFeatures['strokeStyle'],
                strokeWidth: textFeatures['strokeWidth'],
                x: currentLayer.x + textFeatures['x'], y: currentLayer.y + textFeatures['y'],
                ox: currentLayer.x + textFeatures['x'], oy: currentLayer.y + textFeatures['y'],
                fontSize: 16,
                fontFamily: 'Verdana, sans-serif',
                text: name,

                node: {
                    parent: currentLayer,
                    func: 'text'
                },

                click: function(layer) {
                    if (!text_onclick(layer) && layer.node.parent.click) {
                        layer.node.parent.click(layer.node.parent);
                    }
                },
                dragstart: function(layer) { layer.node.parent.dragstart(layer.node.parent); },
                drag: function(layer) { layer.node.parent.drag(layer.node.parent); },
                dragstop: function(layer) { layer.node.parent.dragstop(layer.node.parent); },

                groups: [type + '_' + _counter],
                dragGroups: [type + '_' + _counter],
            });

            currentLayer.node.textElement = canvas.getLayer(-1);
            Layer.createBottomPoint(currentLayer);

            ++_counter;
            return currentLayer;
        },

        createBottomPoint: function(layer) {
            console.log('[layer.createBottomPoint] {' + layer.node.id + '}');
            var features = style.featuresMapping[layer.node.name];

            var bottom_onclick = function(layer) {
                layer.draggable = true;
                layer.node.parent.draggable = true;
                //layer.node.parent.click(layer.node.parent);

                layer.strokeStyle = "#a23";
                controller.setSelection(layer);
            };

            var bottom_mousedown = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = false;
                layer.node.parent.draggable = false;

                if (layer.node.used)
                    return;

                relationship.create(layer.node.parent, layer.node.parent, false, layer);
            };

            var bottom_mouseout = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var bottom_dragstart = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                layer.groups = [];
                layer.dragGroups = [];
            };

            var bottom_drag = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                var rx = layer.x - layer.node.parent.x;
                var ry = layer.y - layer.node.parent.y;
                var d = layer.strokeMid;

                // Left border?
                if (rx <= d) {
                    layer.x = layer.node.parent.x + d;
                    if (ry < 0) {
                        layer.y = layer.node.parent.y + d;
                    }
                    else if (ry > 50) {
                        layer.y = layer.node.parent.y + 50 - d; 
                    }
                }
                // Right border?
                else if (rx >= 100 - d) {
                    layer.x = layer.node.parent.x + 100 - d;
                    if (ry < 0) {
                        layer.y = layer.node.parent.y + d;
                    }
                    else if (ry > 50) {
                        layer.y = layer.node.parent.y + 50 - d; 
                    }
                }
                else if (ry < 25) {
                    layer.y = layer.node.parent.y + d;
                }
                else {
                    layer.y = layer.node.parent.y + 50 - d; 
                }

                var fromRelationships = controller.getMappingsFor('from', layer.node.parent);

                var n = fromRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    var line = fromRelationships[i];
                    if (line.node.bottom == layer) {
                        line.x1 = layer.x;
                        line.y1 = layer.y;
                    }
                }
            };

            var bottom_dragstop = function(layer) {
                if (mouse.isDoubleClick())
                    return;

                layer.groups = [layer.node.parent.node.id];
                layer.dragGroups = [layer.node.parent.node.id];
            };

            var circleFeatures = features['bottom'];
            canvas.drawArc({
                layer: true,
                bringToFront: true,
                strokeStyle: circleFeatures['strokeStyle'],
                strokeWidth: circleFeatures['strokeWidth'],
                strokeMid: features['strokeWidth'] / 2 - 1.5,
                fillStyle: circleFeatures['fillStyle'],

                x: layer.x + 100/2 - 1.5, y: layer.y + features['strokeWidth'] / 2 - 1.5,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'bottom'
                },

                click: bottom_onclick,
                mousedown: bottom_mousedown,
                mouseout: bottom_mouseout,
                dragstart: bottom_dragstart,
                drag: bottom_drag,
                dragstop: bottom_dragstop,
            });

            layer.node.bottom.push(canvas.getLayer(-1));
        },

        createTopPoint: function(layer, ex, ey) {
            console.log('[createTopPoint] {' + layer.node.id + '}');
            var features = style.featuresMapping[layer.node.name];

            var top_onclick = function(layer) {
                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var top_onmousedown = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = false;
                layer.node.parent.draggable = false;
            };

            var top_onmouseout = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var top_ondragstart = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                layer.groups = [];
                layer.dragGroups = [];
            };

            var top_ondrag = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                var rx = layer.x - layer.node.parent.x;
                var ry = layer.y - layer.node.parent.y;
                var d = layer.strokeMid;

                // Left border?
                if (rx <= d) {
                    layer.x = layer.node.parent.x + d;
                    if (ry < 0) {
                        layer.y = layer.node.parent.y + d;
                    }
                    else if (ry > 50) {
                        layer.y = layer.node.parent.y + 50 - d; 
                    }
                }
                // Right border?
                else if (rx >= 100 - d) {
                    layer.x = layer.node.parent.x + 100 - d;
                    if (ry < 0) {
                        layer.y = layer.node.parent.y + d;
                    }
                    else if (ry > 50) {
                        layer.y = layer.node.parent.y + 50 - d; 
                    }
                }
                else if (ry < 25) {
                    layer.y = layer.node.parent.y + d;
                }
                else {
                    layer.y = layer.node.parent.y + 50 - d; 
                }

                var toRelationships = controller.getMappingsFor('to', layer.node.parent);

                var n = toRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    var line = toRelationships[i];
                    if (line.node.top == layer) {
                        line.x2 = layer.x;
                        line.y2 = layer.y;
                    }
                }
            };

            var top_ondragstop = function(layer) {
                if (mouse.isDoubleClick())
                    return;

                layer.groups = [layer.node.parent.node.id];
                layer.dragGroups = [layer.node.parent.node.id];
            };

            var circleFeatures = features['top'];
            canvas.drawArc({
                layer: true,
                bringToFront: true,
                strokeStyle: circleFeatures['strokeStyle'],
                strokeWidth: circleFeatures['strokeWidth'],
                strokeMid: features['strokeWidth'] / 2 - 1.5,
                fillStyle: circleFeatures['fillStyle'],

                x: ex, y: ey + features['strokeWidth'] / 2 - 1.5,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'top'
                },

                click: top_onclick,
                mousedown: top_onmousedown,
                mouseout: top_onmouseout,
                dragstart: top_ondragstart,
                drag: top_ondrag,
                dragstop: top_ondragstop,
            });

            return canvas.getLayer(-1);
        }
    };

    return Layer;
});
