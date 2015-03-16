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

        remove: function (layer, node) {
            console.log('[top.remove] {' + layer.node.name + '}');

            // Validate first, just in case we are currently drawing
            // Might happen if [SUPR] is pressed
            relationship.validate();

            var fromRelationships = controller.getMappingsFor('from', layer);
            var i = 0;

            // Remove relationships
            for (; i < fromRelationships.length; ++i) {
                if (fromRelationships[i].top.data('name') == node.data('name')) {
                    relationship.remove(fromRelationships[i]);
                    --i;
                }
            }

            // Remove from top list
            var topList = layer.node.params.top;
            for (var i = 0, len = topList.length; i < len; ++i) {
                if (topList[i].value == node.data('name')) {
                    topList.splice(i, 1);
                    break;
                }
            }

            // Remove from DOM
            node.remove();
        },

        create: function (layer, topName) {
            console.log('[top.create] {' + layer.node.id + '}');

            // Check if the top already exists
            if (typeof(topName) !== 'undefined') {
                // Does it already exist?
                for (var i = 0, len = layer.node.params.top.length; i < len; ++i) {
                    if (layer.node.params.top[i].value == topName) {
                        return layer.node.params.top[i].DOM;
                    }
                }
            } else {
                topName = ('top' in layer.node.params && layer.node.params.top.length) ?
                    layer.node.id + '_top_' + layer.node.topCount :
                    layer.text;
            }

            ++layer.node.topCount;

            var top_ondblclick = function (layer, node, e) {
                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                relationship.validate({pageX:-100, pageY:-100});
                Top.remove(layer, node);
            };

            var top_onclick = function (layer, node, e) {
                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // So we must manually call it
                mouse.click(e);

                // TODO: Set selection to ourself
                controller.clearSelection();
            };

            var top_mousedown = function (layer, node, e) {
                // No drag on layer
                e.stopPropagation();

                // Trigger mouse
                mouse.mousedown(e);

                if (!controller.freeDrawing()) {
                    controller.setInitialNode(layer);
                }

                relationship.create(layer, layer, false, node);
            };

            var top = new Value(true, topName);

            var bb = this.findSuitable(layer);
            top.DOM = canvas.createLayerArc(layer, {
                x: bb.x,
                y: bb.y,
                radius: 7,

                name: topName,
                parent: layer,

                click: top_onclick,
                dblclick: top_ondblclick,
                mousedown: top_mousedown,
            }, 'top');

            // We must now add this top arc to the params
            // Make sure it exists and that it is an array
            if (!('top' in layer.node.params)) {
                layer.node.params.top = [];
            } else if (!$.isArray(layer.node.params.top)) {
                layer.node.params.top = [layer.node.params.top];
            }

            // Add top
            layer.node.params.top.push(top);

            return top.DOM;
        },

        findSuitable: function (layer) {
            var bb = layer.rotationBox();

            var r = {x: bb.w, y: bb.h - 4};
            var me = this;
            var last = -1;

            if (controller.verticalDrawing()) {
                var arcs = layer.getStaticDOM().children('.arc-top');
                var min = bb.h / 2 - ((arcs.length + 1) * 14 + arcs.length * 2) / 2;
                arcs.each(function (i) {
                    me.move(layer, $(this), $(this).css('left'), min + (i * 16));
                    last = i;
                });

                r.y = min + ((last + 1) * 16);
            } else {
                var arcs = layer.getStaticDOM().children('.arc-top');
                var min = bb.w / 2 - ((arcs.length + 1) * 14 + arcs.length * 2) / 2;
                arcs.each(function (i) {
                    me.move(layer, $(this), min + (i * 16), $(this).css('top'));
                    last = i;
                });

                r.y = 0;
                r.x = min + ((last + 1) * 16);
            }

            return r;
        },

        move: function (layer, node, x, y) {
            node.css({
                left: x,
                top: y
            });

            var myName = node.data('name');
            var coords = controller.screenCoordinates(node);
            var mappings = controller.getMappings();
            var fromRelationships = mappings.from[layer.node.id];

            for (var i = 0, n = fromRelationships.length; i < n; ++i) {
                var line = fromRelationships[i];

                if (line.top == myName) {
                    line.x1 = coords.x;
                    line.y1 = coords.y;
                }
            }
        }
    };

    return Top;
});
