define(['require', 'jquery'], function (require, $) {

    var canvas = null;
    var controller = null;
    var mouse = null;
    var relationship = null;

    var Bottom = {
        initialize: function () {
            canvas = require('app/canvas');
            controller = require('app/controller');
            mouse = require('utils/mousehelper');
            relationship = require('app/relationship');
        },

        remove: function (layer, node) {
            console.log('[bottom.remove] {' + node.data('name') + '}');

            // Find the relationship assosiated with this bottom point and delete it
            var toRelationships = controller.getMappingsFor('to', layer);
            var n = toRelationships.length;
            var i = 0;

            // Bottom points are automatically removed by relationship.remove
            for (; i < n; ++i) {
                if (toRelationships[i].bottom.data('name') == node.data('name')) {
                    relationship.remove(toRelationships[i]);
                    break;
                }
            }
        },

        create: function (layer, ex, ey, bottomName) {
            console.log('[bottom.create] {' + layer.node.id + '}');

            // Check if the top already exists
            if (typeof(bottomName) !== 'undefined') {
                // Does it already exist?
                for (var i = 0, len = layer.node.params.bottom.length; i < len; ++i) {
                    if (layer.node.params.bottom[i].value == bottomName) {
                        return layer.node.params.bottom[i].DOM;
                    }
                }
            } else {
                bottomName = layer.text;
            }

            var bottom_ondblclick = function (layer, node, e) {
                e.stopPropagation();

                Bottom.remove(layer, node);
            };

            var bottom_onclick = function (layer, node, e) {
                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // So we must manually call it
                mouse.click(e);

                // TODO: Set selection to ourself
                controller.clearSelection();
            };

            var bottom_onmousedown = function (layer, node, e) {
                e.stopPropagation();

                mouse.mousedown(e);
            };

            var bot = new Value(true, bottomName);
            bot.DOM = canvas.createLayerArc(layer, {
                draggable: true,

                x: ex,
                y: ey,
                radius: 7,

                parent: layer,
                name: bottomName,

                click: bottom_onclick,
                dblclick: bottom_ondblclick,
                mousedown: bottom_onmousedown,
            }, 'bot');

            // We must now add this bottom arc to the params
            // Make sure it exists and that it is an array
            if (!('bottom' in layer.node.params)) {
                layer.node.params.bottom = [];
            } else if (!$.isArray(layer.node.params.bottom)) {
                layer.node.params.bottom = [layer.node.params.bottom];
            }

            // Add bottom
            layer.node.params.bottom.push(bot);

            return bot.DOM;
        },
    };

    return Bottom;
});
