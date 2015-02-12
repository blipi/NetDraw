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

    require('jquery-ui');

    var wrapper = controller.getWrapper();
    var canvas = controller.getCanvas();

    function initialize()
    {
        var window_onmousemove = function(e) {
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

                controller.clearSelection();

                if (relationship.is(selection)) {
                    relationship.remove(selection);
                } else {
                    layer.remove(selection);
                }

                canvas.drawLayers();
            }
        };

        canvasObj.initialize();
        
        $(window).keydown(window_onkeydown);
        $(window).mousemove(window_onmousemove);

        menu.create();
        relationship.initialize();
        mouse.initialize();
    };

    initialize();
});
