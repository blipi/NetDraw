define(['require', 'jquery', 'app/layer', 'app/controller'], function(require, $, layer, controller) {

    var canvas = controller.getCanvas();
    var layer = null;

    function _validateRelationship(e) {
        var drawingLine = controller.getDrawingLine();
        if (drawingLine == null)
            return;

        console.log('[relationship._validateRelationship]');

        var layers = canvas.getLayers();
        var n = layers.length;
        var i = 0;
        var connected = false;

        for (; i < n; ++i) {
            var current = layers[i];

            var f = null;
            if ('node' in current && 'func' in current.node)
                f = current.node.func;

            if (current == drawingLine.node.from || f != 'main')
                continue;

            // TODO: Magic numbers, 3 is border
            if (drawingLine.x2 >= current.x - 3 &&
                drawingLine.y2 >= current.y - 3 &&
                drawingLine.x2 <= current.x + current.width + 3 &&
                drawingLine.y2 <= current.y + current.height + 3)
            {
                connected = true;
                drawingLine.node.to = current;

                controller.getMappingsFor('from', drawingLine.node.from).push(drawingLine);
                controller.getMappingsFor('to', drawingLine.node.to).push(drawingLine);

                /* Fix position */
                var left = drawingLine.x2 - current.x;
                var top = drawingLine.y2 - current.y;
                var minargs = [left, 100 - left, top, 50 - top];
                var idx = minargs.indexOf(Math.min.apply(window, minargs));
                var x = 0, y = 0;
                if (idx == 0) {
                    drawingLine.x2 = current.x;
                    x = 0;
                    y = drawingLine.y2 - current.y;
                }
                else if (idx == 1) {
                    drawingLine.x2 = current.x + 106;
                    x = 106;
                    y = drawingLine.y2 - current.y;
                }
                else if (idx == 2) {
                    drawingLine.y2 = current.y;
                    x = drawingLine.x2 - current.x;
                    y = 0;
                }
                else {
                    drawingLine.y2 = current.y + 56;
                    x = drawingLine.x2 - current.x;
                    y = 56;
                }

                /* Draw bottom */
                drawingLine.node.bottom = layer.createBottomPoint(current, x, y);
                drawingLine.x2 = drawingLine.node.bottom.windowX;

                break;
            }
        }

        if (!connected) {
            canvas.removeLayer(drawingLine);
        } else {
            drawingLine.node.top.node.used = true;
            layer.createTopPoint(drawingLine.node.from);
        }

        drawingLine.node.from.draggable = true;
        drawingLine.node.top.draggable = true;
        controller.clearDrawingLine();
    };

    return {

        initialize: function() {
            // Circular dependency, async load layer
            layer = require('app/layer');

            $(window).mouseup(_validateRelationship);
        },

        is: function(line) {
            return 'node' in line && 'func' in line.node && line.node.func == 'line';
        },

        remove: function(line) {
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

        create: function(bottomLayer, topLayer, validate, topPoint) {
            console.log('[relationship.create] {' + bottomLayer.node.id + ',' + topLayer.node.id + '}');

            validate = typeof(validate) === 'undefined' ? true : validate;
    
            topPoint = typeof(topPoint) === 'undefined' ? 
                bottomLayer.node.top[bottomLayer.node.top.length - 1] :  // We start from BottomLayer's Top point!
                topPoint;


            var line_click = function(layer) {
                controller.setSelection(layer);
                layer.strokeStyle = "#a23";
                canvas.drawLayers();
            }

            canvas.drawLine({
                strokeStyle: '#000',
                layer: true,
                endArrow: true,
                strokeWidth: 1,
                rounded: true,
                arrowRadius: 15,
                arrowAngle: 90,
                x: 0, y: 0,

                x1: topPoint.windowX,
                y1: topPoint.windowY,

                x2: topLayer.node.bottom ? topLayer.node.bottom.x : (bottomLayer == topLayer ? topPoint.windowX : topLayer.windowX + 60),
                y2: topLayer.node.bottom ? topLayer.node.bottom.y : (bottomLayer == topLayer ? topPoint.windowY : topLayer.windowY + 26),

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

            canvas.drawLayers();
        }
    }
});
