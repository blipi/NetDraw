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

            if (drawingLine.x2 >= current.x &&
                drawingLine.y2 >= current.y &&
                drawingLine.x2 <= current.x + current.width &&
                drawingLine.y2 <= current.y + current.height)
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

                if (idx == 0)
                    drawingLine.x2 = current.x;
                else if (idx == 1)
                    drawingLine.x2 = current.x + 100;
                else if (idx == 2)
                    drawingLine.y2 = current.y;
                else
                    drawingLine.y2 = current.y + 50;

                /* Draw bottom */
                drawingLine.node.bottom = layer.createBottomPoint(current, drawingLine.x2, drawingLine.y2);
                drawingLine.x2 = drawingLine.node.bottom.x;

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

            canvas.mouseup(_validateRelationship);
            canvas.mouseout(_validateRelationship);
        },

        is: function(line) {
            return 'node' in line && 'func' in line.node && line.node.func == 'line';
        },

        remove: function(line) {
            console.log('[relationship.remove] {' + line.node.top.node.name + ' -> ' + line.node.bottom.node.name + '}');

            // Remove bottom point
            canvas.removeLayer(line.node.bottom);

            // Flag not used
            // TODO: Should we delete top instead?
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
                strokeWidth: 2,
                rounded: true,
                arrowRadius: 15,
                arrowAngle: 90,
                x: 0, y: 0,

                x1: topPoint.x,
                y1: topPoint.y,

                x2: topLayer.node.bottom ? topLayer.node.bottom.x : (bottomLayer == topLayer ? topPoint.x : topLayer.x + 48),
                y2: topLayer.node.bottom ? topLayer.node.bottom.y : (bottomLayer == topLayer ? topPoint.y : topLayer.y + 26),

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
