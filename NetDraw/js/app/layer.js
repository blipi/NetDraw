define(['jquery', 'app/style', 'app/controller', 'app/relationship', 'utils/mousehelper'], function($, style, controller, relationship, mouse) {

    var canvas = controller.getCanvas();
    var _counter = 0;
    var _realCounter = 0;

    var Layer = {
        remove: function(layer) {

            console.log("[layer.remove] {" + layer.node.id + '}');

            // Remove layer's text and top point
            canvas.removeLayer(layer.node.textElement);
            canvas.removeLayer(layer.node.top);

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

            if ('input' in layer.node) {
                layer.node.input.remove();
            }
        },

        create: function(x, y, type, visibility) {
            console.log("[layer.create] {" + x + "," + y + "," + type + "}");

            var faetures = style.featuresMapping[type];

            var rect_click = function(layer) {
                controller.setSelection(layer);
                layer.strokeStyle = "#a23";
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


                /* Bring to top */
                canvas.moveLayer(layer.node.top, front);
                canvas.moveLayer(layer.node.textElement, front);
            };

            var rect_dragstop = function(layer) {
                canvasLayer = Layer.create(layer.x, layer.y, layer.node.name, true);
                Layer.createTopPoint(canvasLayer);
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

                strokeStyle: faetures['strokeStyle'],
                strokeWidth: faetures['strokeWidth'],
                fillStyle: faetures['fillStyle'],

                groups: [type + '_' + _counter],
                dragGroups: [type + '_' + _counter],

                node: {
                    func: 'reserved',
                    name: type,
                    id: type + '_' + _counter,

                    textElement: null,
                    top: null,
                },

                dragstart: rect_ondragstart,
                drag: rect_drag,
                dragstop: rect_dragstop
            });

            var currentLayer = canvas.getLayer(-1);
            controller.createLayerMappings(currentLayer);

            var text_onclick = function(layer) {
                if (mouse.isDoubleClick() && layer.node.func == 'text') {
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
                            }
                        }

                        // Avoid keys such as "DEL" to reach window
                        e.stopPropagation();
                    })
                    .appendTo('body')
                    .select();

                    layer.node.input = input;
                    controller.clearSelection();
                }
            };

            var textFeatures = faetures['text'];
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
                    text_onclick(layer);
                    if (layer.node.parent.click) {
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

        createTopPoint: function(layer) {
            console.log('[layer.createTopPoint] {' + layer.node.id + '}');
            var features = style.featuresMapping[layer.node.name];

            var top_onclick = function(layer) {
                layer.draggable = true;
                layer.node.parent.draggable = true;
                layer.node.parent.click(layer.node.parent);
            };

            var top_mousedown = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = false;
                layer.node.parent.draggable = false;


                var line_click = function(layer) {
                    controller.setSelection(layer);
                    layer.strokeStyle = "#a23";
                }

                canvas.drawLine({
                    strokeStyle: '#000',
                    layer: true,
                    endArrow: true,
                    strokeWidth: 2,
                    rounded: true,
                    arrowRadius: 15,
                    arrowAngle: 90,
                    x: 0, y: 0,
                    x1: layer.x, y1: layer.y,
                    x2: layer.x, y2: layer.y,

                    node: {
                        func: 'line',
                        from: layer.node.parent,
                        to: null,
                        bottom: null,
                    },

                    click: line_click
                });

                controller.setDrawingLine(canvas.getLayer(-1));
            };

            var top_mouseout = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var top_dragstart = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                layer.groups = [];
                layer.dragGroups = [];
            };

            var top_drag = function(layer) {
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
                    line.x1 = layer.x;
                    line.y1 = layer.y;
                }
            };

            var top_dragstop = function(layer) {
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

                x: layer.x + 100/2 - 1.5, y: layer.y + features['strokeWidth'] / 2 - 1.5,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'top'
                },

                click: top_onclick,
                mousedown: top_mousedown,
                mouseout: top_mouseout,
                dragstart: top_dragstart,
                drag: top_drag,
                dragstop: top_dragstop,
            });

            layer.node.top = canvas.getLayer(-1);
        },

        createBottomPoint: function(layer, ex, ey) {
            console.log('[createBottomPoint] {' + layer.node.id + '}');
            var features = style.featuresMapping[layer.node.name];

            var bottom_onclick = function(layer) {
                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var bottom_onmousedown = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = false;
                layer.node.parent.draggable = false;
            };

            var bottom_onmouseout = function(layer) {
                if (!mouse.isDoubleClick())
                    return;

                layer.draggable = true;
                layer.node.parent.draggable = true;
            };

            var bottom_ondragstart = function(layer) {
                if (mouse.isDoubleClick()) {
                    return;
                }

                layer.groups = [];
                layer.dragGroups = [];
            };

            var bottom_ondrag = function(layer) {
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
                    if (line.node.bottom == layer) {
                        line.x2 = layer.x;
                        line.y2 = layer.y;
                    }
                }
            };

            var bottom_ondragstop = function(layer) {
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

                x: ex, y: ey + features['strokeWidth'] / 2 - 1.5,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'bottom'
                },

                click: bottom_onclick,
                mousedown: bottom_onmousedown,
                mouseout: bottom_onmouseout,
                dragstart: bottom_ondragstart,
                drag: bottom_ondrag,
                dragstop: bottom_ondragstop,
            });

            return canvas.getLayer(-1);
        }
    };

    return Layer;
});
