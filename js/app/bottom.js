define(['require', 'jquery'], function(require, $) {

	var canvas = null;
	var controller = null;
	var mouse = null;

    var Bottom = {
    	initialize: function() {
    		canvas = require('app/canvas');
    		controller = require('app/controller');
    		mouse = require('utils/mousehelper');
    	},

        create: function(layer, ex, ey) {
            console.log('[bottom.create] {' + layer.node.id + '}');

            bottomName = typeof bottomName === 'undefined' ? layer.text : bottomName;

            var bottom_onclick = function(layer, e) {
                controller.setSelection(layer);

                // Stop propagation makes the mouse helper not work
                e.stopPropagation();

                // Delete bottom
                if (mouse.isDoubleClick(layer)) {
                    layer.remove();
                }

                // So we must manually call it
                mouse.click(e);
            };

            var bottom_onmousedown = function(layer, e) {
                e.stopPropagation();

                mouse.mousedown(e);
            };

            var bottom_reenable = function(layer) {
            };

            var bottom_ondragstart = function(layer) {
            };

            var bottom_ondrag = function(layer) {
                var rx = layer.x - layer.node.parent.x;
                var ry = layer.y - layer.node.parent.y;

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
                // TODO: That 6 is due to borderWidth * 2
                // TODO: Use width from style
                // TODO: Use border from style
                var bb = layer.node.parent.rotationBox();

                var left = layer.x;
                var top = layer.y;
                var minargs = [left, bb.w - left, top, bb.h - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));
                var x = 0, y = 0;
                if (idx == 0) {
                    layer.x = 0;
                }
                else if (idx == 1) {
                    layer.x = bb.w;
                }
                else if (idx == 2) {
                    layer.y = 0;
                }
                else {
                    layer.y = bb.h;
                }
            };

            canvas.createLayerArc(layer, {
                draggable: true,

                x: ex,
                y: ey,
                radius: 7,

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
        },
    }

    return Bottom;
});
