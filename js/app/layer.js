define(['jquery', 'protobuf.2', 'app/style', 'app/controller', 'app/relationship', 'utils/mousehelper'], function($, pb, style, controller, relationship, mouse) {

    var canvas = controller.getCanvas();
    var _counter = 0;
    var _realCounter = 0;
    var _parser = new ProtoBuf();

    var scrollGetter = function(_layer) {
        if (!scrollGetter.prototype._instance) {
            scrollGetter.prototype._instance = this;
        }

        scrollGetter.prototype._instance.layer = _layer;
        return scrollGetter.prototype._instance;
    }

    scrollGetter.prototype = {
        get top () {
            return parseInt(canvas._scroll_wrapper.scrollTop());
        },
        get left () {
            return parseInt(canvas._scroll_wrapper.scrollLeft());
        },
        get width() {
            return parseInt(canvas.css('width'));
        },
        get height() {
            return parseInt(canvas.css('height'));
        },
        get currentX() {
            return this.layer.windowX;
        },
        get currentY() {
            return this.layer.windowY;
        }
    };

    new scrollGetter();

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
                console.log("[layer.remove][bottom] {" + layer.node.name + '}');

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
        },

        rect_click: function(layer) {
            controller.setSelection(layer);
        },

        getTextX: function(text, b) {
            $('#test').css('font-size', 16).html(text);
            var textWidth = parseInt($('#test').css('width'));

            var x = 100/2.0 - textWidth / 2.0 - 2;
            return x;
        },

        _onSetDefinitive: function(layer) {
            layer.node.counter = _realCounter;
            layer.node.textElement.text = layer.node.name + '_' + _realCounter;
            layer.node.textElement.node.func = 'text';
            layer.node.textElement.x = Layer.getTextX(layer.node.textElement.text, layer.strokeWidth);
            layer.node.func = 'main';
            layer.fixTo(controller.getDOMCanvas());
            Layer.createTopPoint(layer);

            ++_realCounter;

            $('#layer-menu')
                .clone(true)
                .attr('id', '')
                .appendTo(layer._DOMElement);

            $('#show-menu')
                .clone(true)
                .attr('id', '')
                .appendTo(layer._DOMElement)
                .show();

            layer.click = Layer.rect_click;
            layer.dragstop = function(layer){
                clearInterval(layer.node.scrollInterval);
                layer.node.scrollInterval = null;
            }

            layer.dragstart = function(layer) {
                controller.setSelection(layer);
                canvas.bringToFront(layer);
            }
        },

        _checkLimits: function(layer) {
            if (layer.node.scrollInterval) {
                return;
            }

            layer.node.scrollInterval = setInterval(function(){
                // BOTTOM
                if (scrollGetter(layer).currentY >= scrollGetter(layer).height - 200) {
                    canvas.css('height', scrollGetter(layer).height + 100);
                    // HACK: Should not access _scroll_wrapper
                    canvas._scroll_wrapper.scrollTop(scrollGetter(layer).height + 100);
                    layer.y += 100;
                }

                // TOP
                if (scrollGetter(layer).currentY - scrollGetter(layer).top <= 200) {
                    if (scrollGetter(layer).top > 0) {
                        canvas._scroll_wrapper.scrollTop(scrollGetter(layer).top - 75);
                        layer.y -= 75;
                    }
                    else {
                        // TODO: Expand upper limit
                    }
                }

                // RIGHT
                if (scrollGetter(layer).currentX >= scrollGetter(layer).width - 200) {
                    canvas.css('width', scrollGetter(layer).width + 100);
                    // HACK: Should not access _scroll_wrapper
                    canvas._scroll_wrapper.scrollLeft(scrollGetter(layer).width + 100);
                    layer.x += 100;
                }

                // TOP
                if (scrollGetter(layer).currentX - scrollGetter(layer).left <= 200) {
                    if (scrollGetter(layer).left > 0) {
                        canvas._scroll_wrapper.scrollLeft(scrollGetter(layer).left - 75);
                        layer.x -= 75;
                    }
                    else {
                        // TODO: Expand upper limit
                    }
                }
            }, 100);
        },

        create: function(x, y, type, visibility, into) {
            console.log("[layer.create] {" + x + "," + y + "," + type + "}");

            into = typeof(into) === 'undefined' ? false : into;

            var features = style.getStyleForTypeName(type);           

            /* Forward declaration of handlers */
            var rect_mousedown = function(layer, e) {
                if (layer.node.func == 'main') {
                    controller.setSelection(layer);
                    e.stopPropagation();
                }
            }

            var rect_ondragstart = function(layer) {
            };

            var rect_drag = function(layer) {
                Layer._checkLimits(layer);

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
            };

            var rect_dragstop = function(layer) {
                clearInterval(layer.node.scrollInterval);
                layer.node.scrollInterval = null;
                
                var canvasLayer = Layer.create(layer.windowX, layer.windowY, layer.node.name, true);
                
                layer.x = layer.ox;
                layer.y = layer.oy;
                layer.node.textElement.x = layer.node.textElement.ox;
                layer.node.textElement.y = layer.node.textElement.oy;

                Layer._onSetDefinitive(canvasLayer);
            };

            var params = {
                layer: true,
                draggable: true,
                bringToFront: true,
                fromCenter: false,
                x: x, y: y,
                ox: x, oy: y,
                visible: visibility,

                node: {
                    func: 'reserved',
                    name: type,
                    id: type + '_' + _counter,

                    textElement: null,
                    top: [],
                    topCount: 0,
                },

                mousedown: rect_mousedown,
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
                currentLayer.node.params = _parser.decompile(features['default']);
            }

            var text_onclick = function(layer, e) {
                if (layer.node.func == 'text') {

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
            });

            currentLayer.node.textElement = canvas.getLayer(-1);

            ++_counter;
            return currentLayer;
        },

        createDefinitive: function(x, y, type, name, params) {
            var layer = Layer.create(x, y, type, true);
            layer.node.params = _parser.decompile(params);

            this._onSetDefinitive(layer);
            
            return layer;
        },

        // TODO: Must be completely rewritten as to use all 4 borders and not only 1/2
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

                if (layer.node.used)
                    return;

                if (!controller.freeDrawing()) {
                    controller.setInitialNode(layer.node.parent);
                }
                
                relationship.create(layer.node.parent, layer.node.parent, false, layer);
            };

            var top_reenable = function(layer) {
                // HACK: _DOMElement should not be exposed
                layer.node.parent._DOMElement.draggable('enable');
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
                // TODO: That 6 is due to borderWidth * 2
                // TODO: Use width from style
                // TODO: Use border from style

                var left = layer.x;
                var top = layer.y;
                var minargs = [left, 100 - left, top, 55 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));

                if (idx == 0)
                    layer.x = 0;
                else if (idx == 1)
                    layer.x = 100;
                else if (idx == 2)
                    layer.y = 0;
                else
                    layer.y = 55;
            };

            var circleFeatures = features['top'];
            canvas.drawArc(layer, {
                layer: true,
                bringToFront: true,
                strokeStyle: circleFeatures['strokeStyle'],
                strokeWidth: circleFeatures['strokeWidth'],
                fillStyle: circleFeatures['fillStyle'],

                x: Layer.findSuitableX(layer.node, layer.node.top, 0, 100, 1.5, 15),
                y: 0,
                radius: 7,

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
            }, 'top');

            layer.node.top.push(canvas.getLayer(-1));
        },

        createBottomPoint: function(layer, ex, ey, bottomName) {
            console.log('[createBottomPoint] {' + layer.node.id + '}');
            var features = style.getStyleFor(layer);

            bottomName = typeof bottomName === 'undefined' ? layer.node.textElement.text : bottomName;

            var bottom_onclick = function(layer, e) {
                controller.setSelection(layer);
                
                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // So we must manually call it
                mouse.click(e);
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
                var minargs = [left, 100 - left, top, 55 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));

                if (idx == 0)
                    layer.x = 0;
                else if (idx == 1)
                    layer.x = 100;
                else if (idx == 2)
                    layer.y = 0;
                else
                    layer.y = 55;
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

                x: Layer.findSuitableX(layer.node, occupied, 0, 100, 1.5, 15, ex),
                y: ey,
                radius: 7,

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
            }, 'bot');

            return canvas.getLayer(-1);
        }
    };

    return Layer;
});
