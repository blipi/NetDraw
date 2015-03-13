define(['require', 'jquery'], function (require, $) {

    var canvas = null;
    var controller = null;
    var mouse = null;
    var relationship = null;

    var Top = {
        initialize: function () {
            canvas = require('app/canvas');
            controller = require('app/controller');
            mouse = require('utils/mousehelper');
            relationship = require('app/relationship');
        },

        remove: function (layer) {
            console.log('[top.remove] {' + layer.node.name + '}');

            // Validate first, just in case we are currently drawing
            // Might happen if [SUPR] is pressed
            relationship.validate();

            var fromRelationships = controller.getMappingsFor('from', layer.node.parent);
            var i = 0;

            for (; i < fromRelationships.length; ++i) {
                if (fromRelationships[i].node.top == layer) {
                    relationship.remove(fromRelationships[i]);
                    --i;
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

            var topList = layer.node.parent.node.params.top;
            for (var i = 0, len = topList.length; i < len; ++i) {
                if (topList[i].value == layer.node.name) {
                    topList.splice(i, 1);
                    break;
                }
            }

            layer.node.parent.node.top.splice(idx, 1);
            canvas.removeLayer(layer);
        },

        create: function (layer, topName) {
            console.log('[top.create] {' + layer.node.id + '}');

            // Check if the top already exists
            if (typeof(topName) !== 'undefined') {
                // Does it already exist?
                for (var i = 0, len = layer.node.top.length; i < len; ++i) {
                    if (layer.node.top[i].node.name == topName) {
                        return layer.node.top[i];
                    }
                }
            } else {
                topName = layer.node.top.length ?
                    layer.node.id + '_top_' + layer.node.topCount :
                    layer.text;
            }

            ++layer.node.topCount;

            var top_onclick = function (layer, e) {
                controller.setSelection(layer);

                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // Delete top
                if (mouse.isDoubleClick(layer)) {
                    relationship.validate({pageX:-100, pageY:-100});
                    layer.remove();
                }

                // So we must manually call it
                mouse.click(e);
            };

            var top_mousedown = function (layer, e) {
                // No drag on layer
                e.stopPropagation();

                // Trigger mouse
                mouse.mousedown(e);

                if (!controller.freeDrawing()) {
                    controller.setInitialNode(layer.node.parent);
                }

                relationship.create(layer.node.parent, layer.node.parent, false, layer);
            };

            var top_reenable = function (layer) {
                // HACK: _DOMElement should not be exposed
                layer.node.parent._DOMElement.draggable('enable');
            };

            var top_drag = function (layer) {
                // HACK: _DOMElement should not be exposed
                layer.node.parent._DOMElement.draggable('disable');

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

            var top_dragstop = function (layer) {
                var left = layer.x;
                var top = layer.y;
                var minargs = [left, 97 - left, top, 52 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));

                if (idx === 0) {
                    layer.x = 0;
                } else if (idx == 1) {
                    layer.x = 97;
                } else if (idx == 2) {
                    layer.y = 0;
                } else {
                    layer.y = 52;
                }
            };

            var bb = this.findSuitable(layer);
            canvas.createLayerArc(layer, {
                x: bb.x,
                y: bb.y,
                radius: 7,

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

            var top = canvas.getLayer(-1);
            layer.node.top.push(top);

            // We must now add this top arc to the params
            // Make sure it exists and that it is an array
            if (!('top' in layer.node.params)) {
                layer.node.params.top = [];
            } else if (!$.isArray(layer.node.params.top)) {
                layer.node.params.top = [layer.node.params.top];
            }

            // Add top
            layer.node.params.top.push(new Value(true, topName));

            return top;
        },

        findSuitable: function (layer) {
            var bb = layer.rotationBox();
            var num = layer.node.top.length;

            var r = {x: bb.w, y: bb.h - 4};

            if (controller.verticalDrawing()) {
                var min = bb.h / 2 - ((num + 1) * 14 + num * 2) / 2;
                for (var y = min, e = 0; e < num; ++e, y += 16) {
                    // TODO: Magic numbers, compensate margin
                    this.move(layer, layer.node.top[e], layer.node.top[e].x, y + 10);
                }

                r.y = y + 10;
            } else {
                var min = bb.w / 2 - ((num + 1) * 14 + num * 2) / 2;
                for (var x = min, e = 0; e < num; ++e, x += 16) {
                    // TODO: Magic numbers, compensate margin
                    this.move(layer, layer.node.top[e], x + 10, layer.node.top[e].y);
                }

                r.y = 0;
                r.x = x + 10;
            }

            return r;
        },

        move: function (layer, node, x, y) {
            node.x = x;
            node.y = y;

            var mappings = controller.getMappings();
            var fromRelationships = mappings.from[layer.node.id];

            for (var i = 0, n = fromRelationships.length; i < n; ++i) {
                var line = fromRelationships[i];
                if (line.node.top == node) {
                     line.x1 = line.node.top.windowX;
                    line.y1 = line.node.top.windowY;
                }
            }
        }
    };

    return Top;
});
