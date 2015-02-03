define(function (require) {
    var $ = require('jquery'),
        style = require('app/style'),
        menu = require('app/menu'),
        controller = require('app/controller'),
        layer = require('app/layer'),
        relationship = require('app/relationship'),
        mouse = require('utils/mousehelper');

	var wrapper = controller.getWrapper();
	var canvas = controller.getCanvas();

    function _window_onresize(e) {
		w_width = wrapper.css('width');
		w_height = wrapper.css('height');

		c_width = canvas.css('width');
		c_height = canvas.css('height');

		console.log("Wrapper [" + w_width + "," + w_height + "]");
		console.log("Canvas  [" + c_width + "," + c_height + "]");

		var ratio_w = w_width / c_width;
		var ratio_h = w_height / c_height;

		canvas.attr('width', w_width);
		canvas.attr('height', w_height);

		canvas.setLayer('scaling', {
			scaleX: ratio_w, scaleY: ratio_h
		})
		.drawLayers();
	}

	function _validateRelationship(e) {
		var drawingLine = controller.getDrawingLine();
    	if (drawingLine == null)
    		return;

    	var layers = canvas.getLayers();
    	var n = layers.length;
    	var i = 0;
    	var connected = false;

    	for (; i < n; ++i) {
    		var layer = layers[i];

    		var f = null;
    		if ('node' in layer && 'func' in layer.node)
    			f = layer.node.func;

			if (layer == drawingLine.node.from || f != 'main')
				continue;

    		if (drawingLine.x2 >= layer.x &&
    			drawingLine.y2 >= layer.y &&
    			drawingLine.x2 <= layer.x + layer.width &&
    			drawingLine.y2 <= layer.y + layer.height)
    		{

    			connected = true;
    			drawingLine.node.to = layer;

    			_.App.layersMapping['from'][drawingLine.node.from.node.id].push(drawingLine);
    			_.App.layersMapping['to'][drawingLine.node.to.node.id].push(drawingLine);

    			/* Fix position */
    			var left = drawingLine.x2 - layer.x;
    			var top = drawingLine.y2 - layer.y;
    			var minargs = [left, 100 - left, top, 50 - top];
    			var idx = minargs.indexOf(Math.min.apply(window, minargs));

    			if (idx == 0)
    				drawingLine.x2 = layer.x;
    			else if (idx == 1)
    				drawingLine.x2 = layer.x + 100;
    			else if (idx == 2)
    				drawingLine.y2 = layer.y;
    			else
    				drawingLine.y2 = layer.y + 50;

    			/* Draw bottom */
    			drawingLine.node.bottom = _.App.createBottomPoint(layer, drawingLine.x2, drawingLine.y2);

    			break;
    		}
    	}

    	if (!connected) {
    		_.App.canvas.removeLayer(drawingLine);
    	}

    	var layer = drawingLine.node.from;
		layer.draggable = true;
		layer.node.top.draggable = true;
    	_.App.drawingLine = null;
    };

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

				console.log("[deleteLayer] {" + selection.node.id + '}');

				if (relationship.is(selection)) {
					relationship.remove(selection);
				} else {
					layer.remove(selection);
				}

				controller.clearSelection();
	    		canvas.drawLayers();
			}
	    };

	    $(window).resize(_window_onresize);
	    $(window).keydown(window_onkeydown);

	    canvas.mousemove(canvas_onmousemove);
	    canvas.mouseup(_validateRelationship);
	    canvas.mouseout(_validateRelationship);

	    canvas.scaleCanvas({
			layer: true,
			name: 'scaling',
			x: 0, y: 0,
			scale: 1
		});
		_window_onresize();

		canvas.restoreCanvas({
		    layer: true
		});

		var ey = 15;
		for (group in menu.groups) {

			/* Box */
			canvas.drawRect({
				layer: true,
				draggable: false,
				fromCenter: false,
				x: -3, y: -3 + ey,
				width: 153,
				height: 20,
				cornerRadius: 0,

				strokeStyle: "#000000",
				strokeWidth: 2,
				fillStyle: "#ea940e",
			});

			var box = canvas.getLayer(-1);

			/* Text */
			canvas.drawText({
				layer: true,
				draggable: false,
				fillStyle: "#000",
				strokeStyle: "#000",
				strokeWidth: 0,
				fromCenter: false,
				x: 10, y: ey,
				fontSize: 13,
				fontFamily: 'Verdana, sans-serif',
				text: group,
			});

			var text = canvas.getLayer(-1);

			// Draw a shield-like shape
			$('canvas').drawPolygon({
				layer: true,
				fillStyle: '#eadebc',
				strokeStyle: '#000000',
				strokeWidth: 1,
				x: 138, y: ey + 7,
				radius: 5,
				sides: 3,
				concavity: -0.5,
				rotate: 180,

				b: box,
				g: group,
				t: text,

				click: function(layer){
					if (layer.rotate == 180) {
						/* Expand */
						for (g in menu.instances) {
							$(this).animateLayer(menu.instances[g][0], {
								y: 12
							}, 'medium', 'swing');
							$(this).animateLayer(menu.instances[g][1], {
								y: 23
							}, 'medium', 'swing');
							$(this).animateLayer(menu.instances[g][2], {
								y: 15
							}, 'medium', 'swing');
						}

						$(this).animateLayer(layer, {
							fillStyle: '#eaae0e',
							rotate: 0
						}, 'slow', 'swing');

						var top = canvas.getLayers().length;
						canvas.moveLayer(layer.b, top);
						canvas.moveLayer(layer, top);
						canvas.moveLayer(layer.t, top);

						for (l in menu.instances[layer.g][3]) {
							menu.instances[layer.g][3][l].visible = true;
							menu.instances[layer.g][3][l].node.textElement.visible = true;
						}
					} else {
						var ey = 15;
						
						for (l in menu.instances[layer.g][3]) {
							menu.instances[layer.g][3][l].visible = false;
							menu.instances[layer.g][3][l].node.textElement.visible = false;
						}

						/* Expand */
						for (g in menu.instances) {

							$(this).animateLayer(menu.instances[g][0], {
								y: ey - 3
							}, 'medium', 'swing');
							$(this).animateLayer(menu.instances[g][1], {
								y: ey + 7
							}, 'medium', 'swing');
							$(this).animateLayer(menu.instances[g][2], {
								y: ey
							}, 'medium', 'swing');
						
							ey += 25;
						}

						$(this).animateLayer(layer, {
							fillStyle: '#eadebc',
							rotate: 180
						}, 'slow', 'swing');
					}
				}
			});

			var poly = canvas.getLayer(-1);

			var layers = [];
			var i = 0;
			console.log("================");
			console.log(group);
			for (l in menu.groups[group]) {
				layers.push(layer.create(25, 40 + 60*i, l, false));
				i += 1;
			}

			var items = [box, poly, text, layers];
			menu.instances[group] = items;

			ey += 25;
		}

		canvas.drawLine({
			strokeStyle: '#000',
			layer: true,
			strokeWidth: 3,
			x1: 150, y1: 0,
			x2: 150, y2: 9000,
		});
	};

	initialize();
});
