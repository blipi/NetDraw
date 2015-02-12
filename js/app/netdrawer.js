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
    var timeout = null;

    function initialize()
    {
        var window_onmousemove = function(e) {
            var drawingLine = controller.getDrawingLine();

            if (drawingLine != null) {
                drawingLine.x2 = e.pageX - 15; // TODO: Magic numbers
                drawingLine.y2 = e.pageY + wrapper.scrollTop();
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

        var window_onmousedown = function(e) {
            if (!timeout) {
                // We must wait a little
                setTimeout(function() {
                    timeout = setInterval(function(){
                        var selection = controller.getSelection();

                        if (!selection || !mouse.isDown()) {
                            console.log("CLEAR " + selection);
                            clearInterval(timeout);
                            timeout = null;
                            return;
                        }

                        var h = parseInt(canvas.css('height'));
                        var p = selection.windowY;
                        if (p >= h - 175) {
                            canvas.css('height', h + 100);
                        }
                    }, 100)
                }, 500);
            }
        }

        canvasObj.initialize();
        
        $(window).keydown(window_onkeydown);
        $(window).mousemove(window_onmousemove);
        $(window).mousedown(window_onmousedown);

        menu.create();
        relationship.initialize();
        mouse.initialize();
    };

    initialize();
});
