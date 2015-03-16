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
            return this.layer.x;
        },
        get currentY() {
            return this.layer.y;
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

            var fromRelationships = controller.getMappingsFor('from', layer);

            // Relationship.remove deletes entries from mappings, thus we must
            // use a while over the array and delete [0]
            while (fromRelationships.length) {
                relationship.remove(fromRelationships[0]);
            }

            var toRelationships = controller.getMappingsFor('to', layer);
            while (toRelationships.length) {
                relationship.remove(toRelationships[0]);
            }

            // Remove layer mappings
            controller.removeLayerMappings(layer);

            // Remove layer itself
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

            // Params layer should be defaulted with:
            layer.node.params.name = new Value(true, layer.text);
            layer.node.params.top = [];
            layer.node.params.bottom = [];

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
                    layer.move();
                }

                // TOP
                if (scrollGetter(layer).currentY - scrollGetter(layer).top <= 200) {
                    if (scrollGetter(layer).top > 0) {
                        canvas._scroll_wrapper.scrollTop(scrollGetter(layer).top - 75);
                        layer.y -= 75;
                        layer.move();
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
                    layer.move();
                }

                // TOP
                if (scrollGetter(layer).currentX - scrollGetter(layer).left <= 200) {
                    if (scrollGetter(layer).left > 0) {
                        canvas._scroll_wrapper.scrollLeft(scrollGetter(layer).left - 75);
                        layer.x -= 75;
                        layer.move();
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
                if (layer.phase == controller.getPhase() || layer.phase == Phase.GLOBAL) {
                    controller.setSelection(layer);
                    e.stopPropagation();
                }
            };

            var rect_ondragstart = function (layer) {
                canvas.bringToFront(layer);
            };

            var rect_drag = function (layer) {
                Layer._checkLimits(layer);

                layer.move();
            };

            var rect_dragstop = function (layer, e) {
                clearInterval(layer.node.scrollInterval);
                layer.node.scrollInterval = null;

                // HACK Make double click work on draggable menu items
                mouse.click(e);

                var canvasLayer = Layer.create(layer.x, layer.y, layer.node.name, true);

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

            if (controller.getPhase() != Phase.MENU) {
                controller.createLayerMappings(currentLayer);
            }

            ++_counter;
            return currentLayer;
        },

        createDefinitive: function (x, y, type, name, params) {
            var layer = Layer.create(x, y, type, true);

            layer.node.params = clone(params);
            this._onSetDefinitive(layer, name);

            return layer;
        },
    };

    return Layer;
});
