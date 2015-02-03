define(function (require) {
    var $ = require('jquery'),
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

			if (code == 46 && selection != null) {

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
	    	console.log(e);
	    	
	    	var layers = canvas.getLayers();
    		var n = layers.length;
    		var i = 0;

    		for (; i < n; ++i) {
    			if ('node' in layers[i]) {
    				if ('func' in layers[i].node && layers[i].node.func != 'reserved') {
    					layers[i].translateY += transformAmount;
    				}
    			}
    		}
	    }

	    $(window).keydown(window_onkeydown);
	    canvas.mousemove(canvas_onmousemove);

	    canvasObj.fitToScreen();

		menu.create();

		relationship.initialize();
	};

	initialize();
});
