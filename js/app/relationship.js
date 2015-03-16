define(['require', 'jquery', 'app/controller', 'app/bottom'], function (require, $, controller, bottom) {

    require('caffeconstants');

    var canvas = controller.getCanvas();
    var layer = null;

    function _validateRelationship(e) {
        var drawingLine = controller.getDrawingLine();
        if (drawingLine === null) {
            return;
        }

        console.log('[relationship._validateRelationship]');

        var layers = canvas.getLayers();
        var n = layers.length;
        var i = 0;
        var connected = false;

        for (; i < n; ++i) {
            var current = layers[i];

            var f = null;
            if (!ValidPhase(current.phase) ||
                current.node.id == drawingLine.from.node.id) {
                continue;
            }

            var bb = current.rotationBox();

            if (drawingLine.x2 >= bb.x &&
                drawingLine.y2 >= bb.y &&
                drawingLine.x2 <= bb.x + bb.w &&
                drawingLine.y2 <= bb.y + bb.h)
            {
                connected = true;
                drawingLine.to = current;

                controller.createMapping(drawingLine);

                /* Fix position */
                var left = drawingLine.x2 - bb.x;
                var top = drawingLine.y2 - bb.y;
                var minargs = [left, bb.w - left, top, bb.h - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));
                var x = 0;
                var y = 0;
                if (idx === 0) {
                    drawingLine.x2 = bb.x;
                    x = 0;
                    y = drawingLine.y2 - bb.y;
                } else if (idx == 1) {
                    drawingLine.x2 = bb.x + bb.w;
                    x = bb.w;
                    y = drawingLine.y2 - bb.y;
                } else if (idx == 2) {
                    drawingLine.y2 = bb.y;
                    x = drawingLine.x2 - bb.x;
                    y = 0;
                } else {
                    drawingLine.y2 = bb.y + bb.h;
                    x = drawingLine.x2 - bb.x;
                    y = bb.h;
                }

                /* Draw bottom */
                var bot = bottom.create(current, x, y, drawingLine.top.data('name'));
                drawingLine.x2 = controller.screenCoordinates(bot).x;
                drawingLine.bottom = bot;

                break;
            }
        }

        if (!connected) {
            canvas.removeLayer(drawingLine);
        }

        controller.clearDrawingLine();
    }

    function _checkDrawingMode(e) {
        if (controller.freeDrawing()) {
            _validateRelationship(e);
        } else if (controller.getInitialNode()) {
            _validateRelationship(e);
        }
    }

    return {

        initialize: function () {
            // Circular dependency, async load layer
            layer = require('app/layer');

            $(window).mouseup(_checkDrawingMode);
            $(window).click(_checkDrawingMode);
        },

        validate: function (e) {
            _validateRelationship(e);
        },

        is: function (line) {
            return 'node' in line && 'func' in line.node && line.node.func == 'line';
        },

        remove: function (line) {
            console.log('[relationship.remove] {' + line.top.data('name') + '}');

            // Remove bottom point from DOM
            line.bottom.remove();

            // Remove from params
            var bottomList = line.to.node.params.bottom;
            for (var i = 0, len = bottomList.length; i < len; ++i) {
                if (bottomList[i].value == line.bottom.data('name')) {
                    bottomList.splice(i, 1);
                    break;
                }
            }

            // Remove line itself
            canvas.removeLayer(line);

            // Remove from mappings
            controller.removeBothMappings(line);
        },

        create: function (bottomLayer, topLayer, validate, topPoint) {
            console.log('[relationship.create] {' + bottomLayer.node.id + ',' + topLayer.node.id + '}');

            validate = typeof(validate) === 'undefined' ? true : validate;

            topPoint = typeof(topPoint) === 'undefined' ?
                // We start from BottomLayer's Top point!
                bottomLayer.node.params.top[bottomLayer.node.params.top.length - 1].DOM :
                topPoint;

            // If we are already drawing, delete the line
            var currentLine = controller.getDrawingLine();
            if (currentLine) {
                canvas.removeLayer(currentLine);
            }

            var bb = topLayer.rotationBox();
            // HACK: Should not edit this value like this
            if (controller.verticalDrawing()) {
                bb.w = 0;
            }

            var coords = controller.screenCoordinates(topPoint);
            var line = canvas.drawLine({
                x: 0, y: 0,

                x1: coords.x,
                y1: coords.y,

                x2: bottomLayer == topLayer ? coords.x : topLayer.x + bb.w / 2 + 1,
                y2: bottomLayer == topLayer ? coords.y : topLayer.y + bb.h / 2 + 1,

                from: bottomLayer,
                to: null,
                top: topPoint,
                bottom: null,
            });

            controller.setDrawingLine(line);
            if (validate) {
                _validateRelationship();
            }
        }
    };
});
