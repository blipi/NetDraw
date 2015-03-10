define(['require', 'jquery', 'app/controller', 'app/bottom'], function (require, $, controller, bottom) {

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
            if ('node' in current && 'func' in current.node) {
                f = current.node.func;
            }

            if (current == drawingLine.node.from || f != 'main') {
                continue;
            }

            var bb = current.rotationBox();

            if (drawingLine.x2 >= bb.x &&
                drawingLine.y2 >= bb.y &&
                drawingLine.x2 <= bb.x + bb.w &&
                drawingLine.y2 <= bb.y + bb.h)
            {
                connected = true;
                drawingLine.node.to = current;

                controller.getMappingsFor('from', drawingLine.node.from).push(drawingLine);
                controller.getMappingsFor('to', drawingLine.node.to).push(drawingLine);

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
                drawingLine.node.bottom = bottom.create(current, x, y, drawingLine.node.top.node.name);
                drawingLine.x2 = drawingLine.node.bottom.windowX;

                break;
            }
        }

        if (!connected) {
            canvas.removeLayer(drawingLine);
        } else {
            drawingLine.node.top.node.used = true;
        }

        drawingLine.node.from.draggable = true;
        drawingLine.node.top.draggable = true;
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
            console.log('[relationship.remove] {' + line.node.top.node.name + ' -> ' + line.node.bottom.node.name + '}');

            // Remove bottom point
            canvas.removeLayer(line.node.bottom);

            // Flag as not used, we keep top, as it may already have a special name defined
            line.node.top.node.used = false;

            // Remove line itself
            canvas.removeLayer(line);

            // Remove from mappings
            controller.removeBothMappings(line);
        },

        create: function (bottomLayer, topLayer, validate, topPoint) {
            console.log('[relationship.create] {' + bottomLayer.node.id + ',' + topLayer.node.id + '}');

            validate = typeof(validate) === 'undefined' ? true : validate;

            topPoint = typeof(topPoint) === 'undefined' ?
                bottomLayer.node.top[bottomLayer.node.top.length - 1] :  // We start from BottomLayer's Top point!
                topPoint;

            // If we are already drawing, delete the line
            var currentLine = controller.getDrawingLine();
            if (currentLine) {
                canvas.removeLayer(currentLine);
            }

            var line_click = function (layer) {
                controller.setSelection(layer);
            };

            var bb = topLayer.rotationBox();
            // HACK Should not edit this value like this
            if (controller.verticalDrawing()) {
                bb.w = 0;
            }

            canvas.drawLine({
                x: 0, y: 0,

                x1: topPoint.windowX,
                y1: topPoint.windowY,

                x2: bottomLayer == topLayer ? topPoint.windowX : topLayer.windowX + bb.w / 2,
                y2: bottomLayer == topLayer ? topPoint.windowY : topLayer.windowY + bb.h / 2,

                node: {
                    func: 'line',
                    from: bottomLayer,
                    to: null,
                    top: topPoint,
                    bottom: null,
                },

                click: line_click
            });

            controller.setDrawingLine(canvas.getLayer(-1));
            if (validate) {
                _validateRelationship();
            }
        }
    };
});
