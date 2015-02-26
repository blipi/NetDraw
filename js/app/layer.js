define(['jquery', 'protobuf', 'app/style', 'app/controller', 'app/relationship', 'utils/mousehelper'], function($, pb, style, controller, relationship, mouse) {

    var canvas = controller.getCanvas();
    var _counter = 0;
    var _realCounter = 0;

    var Layer = {
        remove: function(layer) {

            if (layer.node.func == 'top') {
                console.log("[layer.remove][top] {" + layer.node.name + '}');

                var fromRelationships = controller.getMappingsFor('from', layer.node.parent);
                
                var n = fromRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    if (fromRelationships[i].node.top == layer) {
                        relationship.remove(fromRelationships[i]);
                    }
                }

                var total = layer.node.parent.node.top.length;
                var idx = -1;
                for (i = 0; i < total; ++i) {
                    if (layer.node.parent.node.top[i] == layer)
                    {
                        idx = i;
                        break;
                    }
                }

                layer.node.parent.node.top.splice(idx, 1);
                canvas.removeLayer(layer);

                // How many tops are already being used?
                --total;
                var used = 0;
                for (i = 0; i < total; ++i) {
                    if (layer.node.parent.node.top[i].node.used)
                        ++used;
                }

                // If all are used, create them
                if (used == total) {
                    Layer.createTopPoint(layer.node.parent);
                }

                return;
            }
            else if (layer.node.func == 'bottom') {
                // Find the relationship assosiated with this bottom point and delete it
                var toRelationships = controller.getMappingsFor('to', layer.node.parent);
                var n = toRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    if (toRelationships[i].node.bottom == layer) {
                        relationship.remove(toRelationships[i]);
                        break;
                    }
                }

                return;
            }

            console.log("[layer.remove] {" + layer.node.id + '}');

            // Remove layer's text and top point
            canvas.removeLayer(layer.node.textElement);

            for (var i in layer.node.top) {
                canvas.removeLayer(layer.node.top[i]);
            }

            var fromRelationships = controller.getMappingsFor('from', layer);
            var toRelationships = controller.getMappingsFor('to', layer);
            
            // Relationship.remove deletes entries from mappings, thus we must
            // use a while over the array and delete [0]
            while (fromRelationships.length) {
                relationship.remove(fromRelationships[0]);
            }

            while (toRelationships.length) {
                relationship.remove(toRelationships[0]);
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

        rect_click: function(layer) {
            controller.setSelection(layer);

            if (mouse.isDoubleClick() && layer.node.func == 'main') {
                if (layer.node.params_input)
                    return;

                var input = $('<textarea>');
                input.attr({
                    id: layer.node.id
                })
                .css({
                    position: 'absolute',
                    left: layer.windowX + 125 + 168, // Magic numbers :)
                    top: layer.windowY - 20,
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
        },

        getTextX: function(text, b) {
            $('#test').css('font-size', 16).html(text);
            var textWidth = parseInt($('#test').css('width'));

            var x = 100/2 - textWidth / 2;
            x = textWidth <= 100 ? x : x - (textWidth - 100) / 2 - b;
            return x - b*2;
        },

        create: function(x, y, type, visibility, into) {
            console.log("[layer.create] {" + x + "," + y + "," + type + "}");

            into = typeof(into) === 'undefined' ? false : into;

            var features = style.getStyleForTypeName(type);           

            /* Forward declaration of handlers */
            var rect_ondragstart = function(layer) {
            };

            var rect_drag = function(layer) {
                var mappings = controller.getMappings();
                var fromRelationships = mappings['from'][layer.node.id];
                var toRelationships = mappings['to'][layer.node.id];

                var n = fromRelationships.length;
                var i = 0;
            
                for (; i < n; ++i) {
                    var line = fromRelationships[i];
                    line.x1 = line.node.top.windowX;
                    line.y1 = line.node.top.windowY;
                }

                n = toRelationships.length;
                i = 0;

                for (; i < n; ++i) {
                    var line = toRelationships[i];
                    line.x2 = line.node.bottom.windowX;
                    line.y2 = line.node.bottom.windowY;
                }

                if ('input' in layer.node.textElement.node && layer.node.textElement.node.input) {
                    layer.node.textElement.node.input.css({
                        left: -2,
                        top: layer.node.textElement.y - 3
                    });
                }

                if ('params_input' in layer.node && layer.node.params_input) {
                    layer.node.params_input.css({
                        left: layer.rawX + 125,
                        top: layer.windowY - 20
                    });
                }
            };

            var rect_dragstop = function(layer) {
                var canvasLayer = Layer.create(layer.windowX, layer.windowY, layer.node.name, true);
                canvasLayer.node.counter = _realCounter;
                canvasLayer.node.textElement.text = canvasLayer.node.name + '_' + _realCounter;
                canvasLayer.node.textElement.node.func = 'text';
                canvasLayer.node.textElement.x = Layer.getTextX(canvasLayer.node.textElement.text, canvasLayer.strokeWidth);
                canvasLayer.node.func = 'main';
                canvasLayer.fixTo(controller.getDOMCanvas());
                Layer.createTopPoint(canvasLayer);

                ++_realCounter;

                layer.x = layer.ox;
                layer.y = layer.oy;
                layer.node.textElement.x = layer.node.textElement.ox;
                layer.node.textElement.y = layer.node.textElement.oy;

                canvasLayer.click = Layer.rect_click;
                canvasLayer.dragstop = function(layer){
                    controller.clearSelection();
                }
                canvasLayer.dragstart = function(layer) {
                    controller.setSelection(layer);
                    canvas.bringToFront(layer);
                }
            };

            var params = {
                layer: true,
                draggable: true,
                bringToFront: true,
                fromCenter: false,
                x: x, y: y,
                ox: x, oy: y,
                width: 100,
                height: 50,
                cornerRadius: 6,
                visible: visibility,

                strokeStyle: features['strokeStyle'],
                strokeWidth: features['strokeWidth'],
                fillStyle: features['fillStyle'],

                node: {
                    func: 'reserved',
                    name: type,
                    id: type + '_' + _counter,

                    textElement: null,
                    top: [],
                    topCount: 0,
                },

                dragstart: rect_ondragstart,
                drag: rect_drag,
                dragstop: rect_dragstop
            };

            if (into === false) {
                /* Draw all usable elements */
                canvas.drawRect(params);
            }
            else {
                canvas.drawRectInto(into, params, false);
            }

            var currentLayer = canvas.getLayer(-1);
            controller.createLayerMappings(currentLayer);

            if ('default' in features) {
                currentLayer.node.params = pb.getProto(features['default']);
            } else {
                currentLayer.node.params = currentLayer.node.name + '_param {\n}';
            }

            var text_onclick = function(layer, e) {
                // Avoid reaching the layer element
                e.stopPropagation();

                if (layer.node.func == 'text') {
                    // Select parent
                    controller.setSelection(layer.node.parent);

                    if (mouse.isDoubleClick()) { 
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
                            left: -2,
                            top: 12,
                            width: 100,
                            height: 20,
                            'text-align': 'center'
                        })
                        .keydown(function(e){
                            var code = e.keyCode || e.which;
                            if (code == 13){
                                if ($(this).val()) {
                                    layer.text = $(this).val();
                                    layer.x = Layer.getTextX(layer.text, layer.node.parent.strokeWidth);
                                    $(this).remove();
                                    canvas.drawLayers();
                                    layer.node.input = null;
                                }
                            }

                            // Avoid keys such as "DEL" to reach window
                            e.stopPropagation();
                        })
                        // HACK: _DOMElement should not be accessed
                        .appendTo(layer.node.parent._DOMElement)
                        .select();

                        layer.node.input = input;
                        controller.clearSelection();

                        return true;
                    }
                }

                return false;
            };

            var textFeatures = features['text'];
            var layerName = 'name' in textFeatures ? textFeatures['name'] : type;
            x = this.getTextX(layerName, features['strokeWidth']);

            canvas.drawTextInto(currentLayer, {
                layer: true,
                fillStyle: textFeatures['fillStyle'],
                strokeStyle: textFeatures['strokeStyle'],
                strokeWidth: textFeatures['strokeWidth'],
                x: x, y: textFeatures['y'],
                ox: x, oy: textFeatures['y'],
                fontSize: 16,
                fontFamily: 'Verdana, sans-serif',
                text: layerName,
                visible: visibility,

                node: {
                    parent: currentLayer,
                    func: 'reserved'
                },

                click: text_onclick,
                dragstart: function(layer) { layer.node.parent.dragstart(layer.node.parent); },
                drag: function(layer) { layer.node.parent.drag(layer.node.parent); },
                dragstop: function(layer) { layer.node.parent.dragstop(layer.node.parent); },
            });

            currentLayer.node.textElement = canvas.getLayer(-1);

            ++_counter;
            return currentLayer;
        },

        createDefinitive: function(x, y, type, name, params) {
            var layer = Layer.create(x, y, type, true);

            // Force dragstop to be empty
            layer.dragstop = function(layer){};

            // Setup click and dragstart
            layer.click = Layer.rect_click;
            layer.dragstart(layer); // Calling sets the actual function
            // TODO: AVOID REPEATING CODE!
            layer.dragstop = function(layer){
                controller.clearSelection();
            }
            layer.dragstart = function(layer) {
                controller.setSelection(layer);
                canvas.bringToFront(layer);
            }

            // Basic setup (done on dragstop)
            layer.node.counter = _realCounter;
            layer.node.func = 'main';
            layer.node.params = pb.getProto(params);
            layer.node.textElement.text = name;
            layer.node.textElement.node.func = 'text';
            layer.node.textElement.x = Layer.getTextX(layer.node.textElement.text, layer.strokeWidth);
            layer.fixTo(controller.getDOMCanvas());
            Layer.createTopPoint(layer);

            ++_realCounter;

            return layer;
        },

        findSuitableX: function(obj, occupied, xMin, xMax, xPadding, xMove, cx) {
            cx = typeof cx === 'undefined' ? xMin + ((xMax - xMin) / 2) - xPadding : cx;

            var suitable = function(x) {
                for (i in occupied) {
                    if (occupied[i].x - xPadding <= x && occupied[i].x + xPadding >= x) {
                        return false;
                    }
                }

                return true;
            };

            // Try left
            var tryLeft = function() {
                for (var x = cx; x >= xMin; x -= xMove) {
                    if (suitable(x)) {
                        return x;
                    }
                }

                return false;
            };

            // Try right
            var tryRight = function() {
                for (var x = cx; x <= xMax; x += xMove) {
                    if (suitable(x)) {
                        return x;
                    }
                }

                return false;
            }


            var startLeft = 'startLeft' in obj ? obj.startLeft : true;
            obj.startLeft = !startLeft;
            var x = false;

            if (startLeft) {
                if ((x = tryLeft()) !== false) {
                    return x;
                }
                if ((x = tryRight()) !== false) {
                    return x;
                }
            } else {
                if ((x = tryRight()) !== false) {
                    return x;
                }
                if ((x = tryLeft()) !== false) {
                    return x;
                }
            }

            return cx;
        },

        createTopPoint: function(layer, topName) {
            console.log('[layer.createTopPoint] {' + layer.node.id + '}');
            var features = style.getStyleFor(layer);

            ++layer.node.topCount;
            topName = typeof topName === 'undefined' ? (layer.node.top.length ? layer.node.id + '_top_' + layer.node.topCount : layer.node.textElement.text) : topName;

            var top_onclick = function(layer, e) {
                controller.setSelection(layer);

                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // So we must manually call it
                mouse.click(e);
            };

            var top_mousedown = function(layer, e) {
                layer.node.parent._DOMElement.draggable('disable');

                if (!mouse.isDoubleClick())
                    return;

                layer._DOMElement.draggable('disable');

                if (layer.node.used)
                    return;

                relationship.create(layer.node.parent, layer.node.parent, false, layer);
            };

            var top_reenable = function(layer) {
                // HACK: _DOMElement should not be exposed
                layer._DOMElement.draggable('enable');
                layer.node.parent._DOMElement.draggable('enable');
            };

            var top_dragstart = function(layer) {
            };

            var top_drag = function(layer) {
                // HACK: _DOMElement should not be exposed
                layer.node.parent._DOMElement.draggable('disable');

                if (mouse.isDoubleClick()) {
                    return;
                }

                var fromRelationships = controller.getMappingsFor('from', layer.node.parent);

                var n = fromRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    var line = fromRelationships[i];
                    if (line.node.top == layer) {
                        line.x1 = layer.windowX;
                        line.y1 = layer.windowY;
                    }
                }
            };

            var top_dragstop = function(layer) {
                if (mouse.isDoubleClick())
                    return;

                // HACK: _DOMElement should not be exposed
                layer._DOMElement.draggable('enable');
                layer.node.parent._DOMElement.draggable('enable');

                // TODO: That 6 is due to borderWidth * 2
                // TODO: Use width from style
                // TODO: Use border from style

                var left = layer.x;
                var top = layer.y;
                var minargs = [left, 106 - left, top, 56 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));

                if (idx == 0)
                    layer.x = 0;
                else if (idx == 1)
                    layer.x = 106;
                else if (idx == 2)
                    layer.y = 0;
                else
                    layer.y = 56;
            };

            var circleFeatures = features['top'];
            canvas.drawArc(layer, {
                layer: true,
                bringToFront: true,
                draggable: true,
                strokeStyle: circleFeatures['strokeStyle'],
                strokeWidth: circleFeatures['strokeWidth'],
                fillStyle: circleFeatures['fillStyle'],

                x: Layer.findSuitableX(layer.node, layer.node.top, 0, 106, 1.5, 15),
                y: 0,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'top',
                    name: topName
                },

                click: top_onclick,
                mousedown: top_mousedown,
                mouseup: top_reenable,
                mouseout: top_reenable,
                dragstart: top_dragstart,
                drag: top_drag,
                dragstop: top_dragstop,
            });

            layer.node.top.push(canvas.getLayer(-1));
        },

        createBottomPoint: function(layer, ex, ey, bottomName) {
            console.log('[createBottomPoint] {' + layer.node.id + '}');
            var features = style.getStyleFor(layer);

            bottomName = typeof bottomName === 'undefined' ? layer.node.textElement.text : bottomName;

            var bottom_onclick = function(layer, e) {
                controller.setSelection(layer);

                if (mouse.isDoubleClick())
                    e.stopPropagation();
            };

            var bottom_onmousedown = function(layer) {
                layer.node.parent._DOMElement.draggable('disable');

                if (!mouse.isDoubleClick())
                    return;

                layer._DOMElement.draggable('disable');
            };

            var bottom_reenable = function(layer) {
                // HACK: _DOMElement should not be exposed
                layer._DOMElement.draggable('enable');
                layer.node.parent._DOMElement.draggable('enable');
            };

            var bottom_ondragstart = function(layer) {
            };

            var bottom_ondrag = function(layer) {
                // HACK: _DOMElement should not be exposed
                layer.node.parent._DOMElement.draggable('disable');

                if (mouse.isDoubleClick()) {
                    return;
                }

                var rx = layer.x - layer.node.parent.x;
                var ry = layer.y - layer.node.parent.y;
                var d = layer.strokeMid;

                var toRelationships = controller.getMappingsFor('to', layer.node.parent);

                var n = toRelationships.length;
                var i = 0;

                for (; i < n; ++i) {
                    var line = toRelationships[i];
                    if (line.node.bottom == layer) {
                        line.x2 = layer.windowX;
                        line.y2 = layer.windowY;
                    }
                }
            };

            var bottom_ondragstop = function(layer) {
                if (mouse.isDoubleClick())
                    return;

                // HACK: _DOMElement should not be exposed
                layer._DOMElement.draggable('enable');
                layer.node.parent._DOMElement.draggable('enable');

                // TODO: That 6 is due to borderWidth * 2
                // TODO: Use width from style
                // TODO: Use border from style

                var left = layer.x;
                var top = layer.y;
                var minargs = [left, 106 - left, top, 56 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));

                if (idx == 0)
                    layer.x = 0;
                else if (idx == 1)
                    layer.x = 106;
                else if (idx == 2)
                    layer.y = 0;
                else
                    layer.y = 56;
            };

            var occupied = [];
            var toRelationships = controller.getMappingsFor('to', layer);
            for (i in toRelationships) {
                if (toRelationships[i].node.bottom) {
                    occupied.push(toRelationships[i].node.bottom);
                }
            }

            var circleFeatures = features['bottom'];
            canvas.drawArc(layer, {
                layer: true,
                draggable: true,
                bringToFront: true,
                strokeStyle: circleFeatures['strokeStyle'],
                strokeWidth: circleFeatures['strokeWidth'],
                strokeMid: features['strokeWidth'] / 2 - 1.5,
                fillStyle: circleFeatures['fillStyle'],

                x: Layer.findSuitableX(layer.node, occupied, 0, 106, 1.5, 15, ex),
                y: ey,
                radius: 5,

                groups: [layer.node.id],
                dragGroups: [layer.node.id],

                node: {
                    parent: layer,
                    func: 'bottom',
                    name: bottomName
                },

                click: bottom_onclick,
                mousedown: bottom_onmousedown,
                mouseout: bottom_reenable,
                mouseup: bottom_reenable,
                dragstart: bottom_ondragstart,
                drag: bottom_ondrag,
                dragstop: bottom_ondragstop,
            });

            return canvas.getLayer(-1);
        }
    };

    return Layer;
});
