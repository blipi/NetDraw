function clone(obj) {
    if (obj === null || typeof(obj) !== 'object') { return obj; }
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) { copy[attr] = obj[attr]; }
    }
    return copy;
}

define(['jquery', 'protobuf.2', 'app/controller', 'app/relationship', 'utils/mousehelper', 'app/top', 'app/bottom'],

function ($, pb, controller, relationship, mouse, top, bottom) {

    var canvas = controller.getCanvas();
    var _counter = 0;
    var _realCounter = 0;
    var _parser = new ProtoBuf();

    var scrollGetter = function (_layer) {
        if (!scrollGetter.prototype._instance) {
            scrollGetter.prototype._instance = this;
        }

        scrollGetter.prototype._instance.layer = _layer;
        return scrollGetter.prototype._instance;
    };

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
        remove: function (layer) {
            if (layer.node.func == 'top') {
                throw '[DEPRECATED] Should not be called';
            } else if (layer.node.func == 'bottom') {
                throw '[DEPRECATED] Should not be called';
            }

            console.log('[layer.remove] {' + layer.node.id + '}');

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

        rect_click: function (layer) {
            controller.setSelection(layer);
            canvas.bringToFront(layer);

            if (mouse.isDoubleClick(layer)) {
                var arc = top.create(layer);

                if (!controller.freeDrawing()) {
                    controller.setInitialNode(layer);
                    relationship.create(layer, layer, false, arc);
                }
            }
        },

        getTextX: function (text) {
            $('#test').css('font-size', 16).html(text);
            var textWidth = parseInt($('#test').css('width'));

            var x = 100 / 2.0 - textWidth / 2.0 - 2;
            return x;
        },

        _onSetDefinitive: function (layer, name) {
            if (typeof(name) !== 'undefined') {
                layer.text = name;
            } else {
                layer.text = layer.node.name + '_' + _realCounter;
                ++_realCounter;
            }
            layer.textX = Layer.getTextX(layer.text);
            layer.node.params.name = new Value(true, layer.text);

            layer.node.func = 'main';
            layer.fixTo(controller.getDOMCanvas());
            layer.prepareMenu();

            layer.click = Layer.rect_click;
            layer.dragstop = function (layer) {
                clearInterval(layer.node.scrollInterval);
                layer.node.scrollInterval = null;
            };

            layer.dragstart = function (layer) {
                controller.setSelection(layer);
                canvas.bringToFront(layer);
            };

            canvas.bringToFront(layer);
        },

        _checkLimits: function (layer) {
            if (layer.node.scrollInterval) {
                return;
            }

            layer.node.scrollInterval = setInterval(function () {
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
                    } else {
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
                    } else {
                        // TODO: Expand upper limit
                    }
                }
            }, 100);
        },

        create: function (x, y, type, visibility, into, isDeletable) {
            console.log('[layer.create] {' + x + ',' + y + ',' + type + '}');

            into = typeof(into) === 'undefined' ? false : into;
            isDeletable = typeof(isDeletable) === 'undefined' ? true : isDeletable;

            /* Forward declaration of handlers */
            var rect_mousedown = function (layer, e) {
                if (layer.node.func == 'main') {
                    controller.setSelection(layer);
                    e.stopPropagation();
                }
            };

            var rect_ondragstart = function (layer) {
                canvas.bringToFront(layer);
            };

            var rect_drag = function (layer) {
                Layer._checkLimits(layer);

                // TODO Use newer controller methods
                var mappings = controller.getMappings();
                var fromRelationships = mappings.from[layer.node.id];
                var toRelationships = mappings.to[layer.node.id];

                var n = fromRelationships.length;
                var i = 0;
                var line = null;

                for (; i < n; ++i) {
                    line = fromRelationships[i];
                    line.x1 = line.node.top.windowX;
                    line.y1 = line.node.top.windowY;
                }

                n = toRelationships.length;
                i = 0;

                for (; i < n; ++i) {
                    line = toRelationships[i];
                    line.x2 = line.node.bottom.windowX;
                    line.y2 = line.node.bottom.windowY;
                }
            };

            var rect_dragstop = function (layer, e) {
                clearInterval(layer.node.scrollInterval);
                layer.node.scrollInterval = null;

                // Hack to make double click work
                mouse.click(e);

                var canvasLayer = Layer.create(layer.windowX, layer.windowY, layer.node.name, true);

                layer.x = layer.ox;
                layer.y = layer.oy;

                Layer._onSetDefinitive(canvasLayer);
            };

            var tx = this.getTextX(type);

            var params = {
                layer: true,
                draggable: true,
                deletable: isDeletable,
                bringToFront: true,
                fromCenter: false,
                x: x, y: y,
                ox: x, oy: y,
                visible: visibility,

                node: {
                    func: 'reserved',
                    name: type,
                    id: type + '_' + _counter,

                    params: {
                        type: new Value(true, type),
                    },
                    top: [],
                    topCount: 0,
                },

                mousedown: rect_mousedown,
                dragstart: rect_ondragstart,
                drag: rect_drag,
                dragstop: rect_dragstop,

                text: {
                    x: tx,
                    text: type
                }
            };

            if (into === false) {
                /* Draw all usable elements */
                canvas.createLayer(params);
            } else {
                canvas.createLayerInto(into, params, false);
            }

            var currentLayer = canvas.getLayer(-1);
            controller.createLayerMappings(currentLayer);

            ++_counter;
            return currentLayer;
        },

        createDefinitive: function (x, y, type, name, params) {
            var layer = Layer.create(x, y, type, true);

            layer.node.params = clone(params);

            // Params should not include:
            layer.node.params.top = [];
            layer.node.params.bottom = [];

            this._onSetDefinitive(layer, name);

            return layer;
        },
    };

    return Layer;
});
