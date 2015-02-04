define(function (require) {
    var $ = require('jquery'),
        pb = require('protobuf'),
        style = require('app/style'),
        menu = require('app/menu'),
        controller = require('app/controller'),
        layer = require('app/layer'),
        relationship = require('app/relationship'),
        canvasObj = require('app/canvas'),
        mouse = require('utils/mousehelper');

    var wrapper = controller.getWrapper();
    var canvas = controller.getCanvas();

    function initialize()
    {
        var canvas_onmousemove = function(e) {
            var drawingLine = controller.getDrawingLine();

            if (drawingLine != null) {
                drawingLine.x2 = e.pageX;
                drawingLine.y2 = e.pageY;
                canvas.drawLayers();
            }
        };

        var window_onkeydown = function(e) {
            var code = e.keyCode || e.which;
            var selection = controller.getSelection();

            if (code == 46 && selection) {

                if (relationship.is(selection)) {
                    relationship.remove(selection);
                } else {
                    layer.remove(selection);
                }

                controller.clearSelection();
                canvas.drawLayers();
            }
        };

        var window_onscroll = function(e) {
            var layers = canvas.getLayers();
            var n = layers.length;
            var i = 0;

            var offset = 10 * e.originalEvent.wheelDelta / 120;

            for (; i < n; ++i) {
                if ('node' in layers[i]) {
                    if ('func' in layers[i].node && layers[i].node.func != 'reserved') {
                        if ('y1' in layers[i]) {
                            layers[i].y1 += offset;
                            layers[i].y2 += offset;
                        } else {
                            layers[i].y += offset;
                        }
                    }
                }
            }

            $('input').each(function(){
                $(this).css('top', '+=' + offset)
            })

            $('textarea').each(function(){
                $(this).css('top', '+=' + offset)
            })

            canvas.drawLayers();
        };

        $(window).keydown(window_onkeydown);
        $(window).bind('mousewheel', window_onscroll);
        canvas.mousemove(canvas_onmousemove);

        canvasObj.fitToScreen();

        menu.create();

        relationship.initialize();
    };

    initialize();
});
