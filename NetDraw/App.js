var _ = _ || {};

define(['Style'], function(){

	var App = function()
	{
		this.canvas = null;
		this.wrapper = null;
		this.counter = 0;

		this.doubleClick = false;
		this.doubleClick_last = 0;

		this.drawingLine = null;

		this.layersMapping = {
			'from': {},
			'to': {},
		};

		this.layers = [];
		this.menu = {};
		this.groups = {
			'Vision Layers': {
				'convolution' : {
					'in': ['n', 'c_i', 'h_i', 'w_i'],
					'out': ['n', 'c_o', 'h_o', 'w_o'],

					'pre_conditions': 'num_output && (kernel_size || (kernel_h && kernel_w))',
					'pre_transform': [
						'var kernel_h = kernel_h || kernel_size',
						'var kernel_w = kernel_w || kernel_size',
						'var pad_h = pad_h || pad || 0',
						'var pad_w = pad_w || pad || 0',
						'var stride_h = stride_h || stride || 1',
						'var stride_w = stride_w || stride || 1',
					],
					'transform_rules' : {
						'h_o': '(h_i + 2 * pad_h - kernel_h) / stride_h + 1',
						'w_o': '(h_i + 2 * pad_h - kernel_w) / stride_h + 1',
					},
				},

				'pooling' : {
					'in': ['n', 'c', 'h_i', 'w_i'],
					'out': ['n', 'c', 'h_o', 'w_o'],

					'pre_conditions': 'kernel_size || (kernel_h && kernel_w)',
					'pre_transform': [
						'var kernel_h = kernel_h || kernel_size',
						'var kernel_w = kernel_w || kernel_size',
						'var pad_h = pad_h || pad || 0',
						'var pad_w = pad_w || pad || 0',
						'var stride_h = stride_h || stride || 1',
						'var stride_w = stride_w || stride || 1',
					],
					'transform_rules' : {
						'h_o': '(h_i + 2 * pad_h - kernel_h) / stride_h + 1',
						'w_o': '(h_i + 2 * pad_h - kernel_w) / stride_h + 1',
					},
				},

				'lrn' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w'],
				},

				'im2col' : {
					'in': ['n', 'c', 'h_i', 'w_i'],
					'out': ['n', 'c', 'h_o', 'w_o'],
				},
			},


			'Loss Layers': {
				'softmax': {},
				'euclidean': {},
				'hinge': {},
				'sigmoid_gain': {},
				'infogain': {},
				'accuracy': {},
			},

			'Activation Layers': {
				'relu' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},
				'sigmoid' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},
				'tanh' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},
				'absval' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},
				'power' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},

				'bnll' : {
					'in': ['n', 'c', 'h', 'w'],
					'out': ['n', 'c', 'h', 'w']
				},
			},

			'Data Layers': {
				'data' : {
					'out': ['n', 'c', 'h', 'w'],

					'pre_conditions': 'source && batch_size',
					'pre_transform': [
						'var n = batch_size',
						'var c = c || 3',
						'var w = w || 256',
						'var h = h || 256'
					]
				},
				
				'memory' : {
					'out': ['n', 'c', 'h', 'w'],

					'pre_conditions': 'batch_size && channels && height && width',
					'pre_transform': [
						'var n = batch_size',
						'var c = channels || 3',
						'var w = width || 256',
						'var h = height || 256'
					]
				},

				'hdf5' : {
					'out': ['n', 'c', 'h', 'w'],

					'pre_conditions': 'source && batch_size',
					'pre_transform': [
						'var n = batch_size',
						'var c = c || 3',
						'var w = w || 256',
						'var h = h || 256'
					]
				},

				'image' : {
					'out': ['n', 'c', 'h', 'w'],

					'pre_conditions': 'source && batch_size',
					'pre_transform': [
						'var n = batch_size',
						'var c = c || 3',
						'var w = w || 256',
						'var h = h || 256'
					]
				},

				'window' : {},
				'dummy' : {},
			},

			'Common Layers': {
				'inner_product' : {
					'in': ['n', 'c_i', 'h_i', 'w_i'],
					'out': ['n', 'c_o', '1', '1'],

					'pre_conditions': 'num_output',
					'pre_transform': [
						'var c_o = num_output'
					]
				},
				
				'split' : {},
				'flatten' : {},
				'concat' : {},
				'slice' : {},
			},
		};
	};

	App.prototype.__window_onresize = function(e) {
		w_width = _.App.wrapper.css('width');
		w_height = _.App.wrapper.css('height');

		c_width = _.App.canvas.css('width');
		c_height = _.App.canvas.css('height');

		console.log("Wrapper [" + w_width + "," + w_height + "]");
		console.log("Canvas  [" + c_width + "," + c_height + "]");

		var ratio_w = w_width / c_width;
		var ratio_h = w_height / c_height;

		_.App.canvas.attr('width', w_width);
		_.App.canvas.attr('height', w_height);

		_.App.canvas.setLayer('scaling', {
			scaleX: ratio_w, scaleY: ratio_h
		})
		.drawLayers();
	}

	App.prototype.__validateRelationship = function(e) {
		var drawingLine = _.App.drawingLine;
    	if (drawingLine == null)
    		return;

    	var layers = _.App.canvas.getLayers();
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
	
	App.prototype.initialize = function()
	{
		_.App.canvas = $('#canvas');
		_.App.wrapper = $('#wrapper');

	    var canvas_onclick = function(e){
	    	_.App.doubleClick = false;
	    	_.App.doubleClick_last = e.timeStamp;
	    };

	    var canvas_onmousedown = function(e){
	    	if (e.timeStamp - _.App.doubleClick_last < 200) {
	    		_.App.doubleClick = true;
	    	}
    		_.App.doubleClick_last = e.timeStamp;
	    };

	    var canvas_onmousemove = function(e) {
	    	if (_.App.drawingLine != null) {
	    		_.App.drawingLine.x2 = e.pageX;
	    		_.App.drawingLine.y2 = e.pageY;
	    		_.App.canvas.drawLayers();
	    	}
	    };

	    $(window).resize(_.App.__window_onresize);
	    _.App.canvas.click(canvas_onclick);
	    _.App.canvas.mousedown(canvas_onmousedown);
	    _.App.canvas.mousemove(canvas_onmousemove);
	    _.App.canvas.mouseup(_.App.__validateRelationship);
	    _.App.canvas.mouseout(_.App.__validateRelationship);

	    _.App.canvas.scaleCanvas({
			layer: true,
			name: 'scaling',
			x: 0, y: 0,
			scale: 1
		});
		_.App.__window_onresize();

		_.App.canvas.restoreCanvas({
		    layer: true
		});

		var ey = 15;
		for (group in _.App.groups) {

			/* Box */
			_.App.canvas.drawRect({
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

			var box = _.App.canvas.getLayer(-1);

			/* Text */
			_.App.canvas.drawText({
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

			var text = _.App.canvas.getLayer(-1);

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
						for (g in _.App.menu) {
							$(this).animateLayer(_.App.menu[g][0], {
								y: 12
							}, 'medium', 'swing');
							$(this).animateLayer(_.App.menu[g][1], {
								y: 23
							}, 'medium', 'swing');
							$(this).animateLayer(_.App.menu[g][2], {
								y: 15
							}, 'medium', 'swing');
						}

						$(this).animateLayer(layer, {
							fillStyle: '#eaae0e',
							rotate: 0
						}, 'slow', 'swing');

						var top = _.App.canvas.getLayers().length;
						_.App.canvas.moveLayer(layer.b, top);
						_.App.canvas.moveLayer(layer, top);
						_.App.canvas.moveLayer(layer.t, top);

						for (l in _.App.menu[layer.g][3]) {
							_.App.menu[layer.g][3][l].visible = true;
							_.App.menu[layer.g][3][l].node.textElement.visible = true;
						}
					} else {
						var ey = 15;
						
						for (l in _.App.menu[layer.g][3]) {
							_.App.menu[layer.g][3][l].visible = false;
							_.App.menu[layer.g][3][l].node.textElement.visible = false;
						}

						/* Expand */
						for (g in _.App.menu) {

							$(this).animateLayer(_.App.menu[g][0], {
								y: ey - 3
							}, 'medium', 'swing');
							$(this).animateLayer(_.App.menu[g][1], {
								y: ey + 7
							}, 'medium', 'swing');
							$(this).animateLayer(_.App.menu[g][2], {
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

			var poly = _.App.canvas.getLayer(-1);

			var layers = [];
			var i = 0;
			console.log("================");
			console.log(group);
			for (layer in _.App.groups[group]) {
				console.log(layer);
				layers.push(_.App.createLayer(25, 40 + 60*i, layer, false));
				i += 1;
			}

			var items = [box, poly, text, layers];
			_.App.menu[group] = items;

			ey += 25;
		}

		_.App.canvas.drawLine({
			strokeStyle: '#000',
			layer: true,
			strokeWidth: 3,
			x1: 150, y1: 0,
			x2: 150, y2: 9000,
		});
	};
	
	App.prototype.createLayer = function(x, y, type, visibility)
	{
		console.log("[createLayer] {" + x + "," + y + "," + type + "}");

		var faetures = _.Style.featuresMapping[type];

		/* Forward declaration of handlers */
		var rect_ondragstart = function(layer) {
			layer.dragstart = function(layer){
				var front = _.App.canvas.getLayers().length;
				_.App.canvas.moveLayer(layer, front);
			}
		};

		var rect_drag = function(layer) {
			var front = _.App.canvas.getLayers().length;

			var fromRelationships = _.App.layersMapping['from'][layer.node.id];
			var toRelationships = _.App.layersMapping['to'][layer.node.id];

			var n = fromRelationships.length;
			var i = 0;
		
			for (; i < n; ++i) {
				var line = fromRelationships[i];
				line.x1 = layer.node.top.x;
				line.y1 = layer.node.top.y;
			}

			n = toRelationships.length;
			i = 0;

			for (; i < n; ++i) {
				var line = toRelationships[i];
				line.x2 = line.node.bottom.x;
				line.y2 = line.node.bottom.y;
			}


			/* Bring to top */
			_.App.canvas.moveLayer(layer.node.top, front);
			_.App.canvas.moveLayer(layer.node.textElement, front);
		};

		var rect_dragstop = function(layer) {
			canvasLayer = _.App.createLayer(layer.x, layer.y, layer.node.name, true);
			_.App.createTopPoint(canvasLayer);
			canvasLayer.node.textElement.text = canvasLayer.node.netName;
			canvasLayer.node.func = 'main';

			layer.x = layer.ox;
			layer.y = layer.oy;
			layer.node.textElement.x = layer.node.textElement.ox;
			layer.node.textElement.y = layer.node.textElement.oy;

			canvasLayer.dragstop = function(layer){
			}
		};


	    /* Draw all usable elements */
	    _.App.canvas.drawRect({
			layer: true,
			draggable: true,
			bringToFront: true,
			fromCenter: false,
			x: x, y: y,
			ox: x, oy: y,
			width: 100,
			height: 50,
			cornerRadius: 2,
			visible: visibility,

			strokeStyle: faetures['strokeStyle'],
			strokeWidth: faetures['strokeWidth'],
			fillStyle: faetures['fillStyle'],

			groups: [type + '_' + _.App.counter],
			dragGroups: [type + '_' + _.App.counter],

			node: {
				func: 'reserved',
				name: type,
				id: type + '_' + _.App.counter,
				netName: type + '_' + _.App.counter,

				textElement: null,
				top: null,
			},

			dragstart: rect_ondragstart,
			drag: rect_drag,
			dragstop: rect_dragstop
		});

		var currentLayer = _.App.canvas.getLayer(-1);

		_.App.layers.push(currentLayer);
		_.App.layersMapping['from'][currentLayer.node.id] = [];
		_.App.layersMapping['to'][currentLayer.node.id] = [];

		var textFeatures = faetures['text'];
		_.App.canvas.drawText({
			layer: true,
			fillStyle: textFeatures['fillStyle'],
			strokeStyle: textFeatures['strokeStyle'],
			strokeWidth: textFeatures['strokeWidth'],
			x: currentLayer.x + textFeatures['x'], y: currentLayer.y + textFeatures['y'],
			ox: currentLayer.x + textFeatures['x'], oy: currentLayer.y + textFeatures['y'],
			fontSize: 16,
			fontFamily: 'Verdana, sans-serif',
			text: textFeatures['name'],
			visible: visibility,

			node: {
				parent: currentLayer
			},

			dragstart: function(layer) { layer.node.parent.dragstart(layer.node.parent); },
			drag: function(layer) { layer.node.parent.drag(layer.node.parent); },
			dragstop: function(layer) { layer.node.parent.dragstop(layer.node.parent); },

			groups: [type + '_' + _.App.counter],
			dragGroups: [type + '_' + _.App.counter],
		});

		currentLayer.node.textElement = _.App.canvas.getLayer(-1);

		++_.App.counter;
		return currentLayer;
	};

	App.prototype.createTopPoint = function(layer) {
		console.log('[createTopPoint] {' + layer.node.id + '}');
	    var features = _.Style.featuresMapping[layer.node.name];

	    var top_onclick = function(layer) {
			layer.draggable = true;
			layer.node.parent.draggable = true;
	    };

	    var top_mousedown = function(layer) {
			if (!_.App.doubleClick)
				return;

			layer.draggable = false;
			layer.node.parent.draggable = false;

			_.App.canvas.drawLine({
				strokeStyle: '#000',
				layer: true,
				endArrow: true,
				strokeWidth: 2,
				rounded: true,
				arrowRadius: 15,
				arrowAngle: 90,
				x: 0, y: 0,
				x1: layer.x, y1: layer.y,
				x2: layer.x, y2: layer.y,

				node: {
					from: layer.node.parent,
					to: null,
					bottom: null,
				},
			});

			_.App.drawingLine = _.App.canvas.getLayer(-1);
		};

		var top_mouseout = function(layer) {
			if (!_.App.doubleClick)
				return;

			layer.draggable = true;
			layer.node.parent.draggable = true;
		};

		var top_dragstart = function(layer) {
			if (_.App.doubleClick) {
				return;
			}

			layer.groups = [];
			layer.dragGroups = [];
		};

		var top_drag = function(layer) {
			if (_.App.doubleClick) {
				return;
			}

			var rx = layer.x - layer.node.parent.x;
			var ry = layer.y - layer.node.parent.y;
			var d = layer.strokeMid;

			// Left border?
			if (rx <= d) {
				layer.x = layer.node.parent.x + d;
				if (ry < 0) {
					layer.y = layer.node.parent.y + d;
				}
				else if (ry > 50) {
					layer.y = layer.node.parent.y + 50 - d;	
				}
			}
			// Right border?
			else if (rx >= 100 - d) {
				layer.x = layer.node.parent.x + 100 - d;
				if (ry < 0) {
					layer.y = layer.node.parent.y + d;
				}
				else if (ry > 50) {
					layer.y = layer.node.parent.y + 50 - d;	
				}
			}
			else if (ry < 25) {
				layer.y = layer.node.parent.y + d;
			}
			else {
				layer.y = layer.node.parent.y + 50 - d;	
			}

			var fromRelationships = _.App.layersMapping['from'][layer.node.parent.node.id];

			var n = fromRelationships.length;
			var i = 0;

			for (; i < n; ++i) {
				var line = fromRelationships[i];
				line.x1 = layer.x;
				line.y1 = layer.y;
			}
		};

		var top_dragstop = function(layer) {
			if (_.App.doubleClick)
				return;

			layer.groups = [layer.node.parent.node.id];
			layer.dragGroups = [layer.node.parent.node.id];
		};

		var circleFeatures = features['top'];
		_.App.canvas.drawArc({
			layer: true,
			bringToFront: true,
			strokeStyle: circleFeatures['strokeStyle'],
			strokeWidth: circleFeatures['strokeWidth'],
			strokeMid: features['strokeWidth'] / 2 - 1.5,
			fillStyle: circleFeatures['fillStyle'],

			x: layer.x + 100/2 - 1.5, y: layer.y + features['strokeWidth'] / 2 - 1.5,
			radius: 5,

			groups: [layer.node.id],
			dragGroups: [layer.node.id],

			node: {
				parent: layer,
			},

			click: top_onclick,
			mousedown: top_mousedown,
			mouseout: top_mouseout,
			dragstart: top_dragstart,
			drag: top_drag,
			dragstop: top_dragstop,
		});

		layer.node.top = _.App.canvas.getLayer(-1);
	}

	App.prototype.createBottomPoint = function(layer, ex, ey) {
		console.log('[createBottomPoint] {' + layer.node.id + '}');
	    var features = _.Style.featuresMapping[layer.node.name];

		var bottom_onclick = function(layer) {
			layer.draggable = true;
			layer.node.parent.draggable = true;
	    };

	    var bottom_onmousedown = function(layer) {
			if (!_.App.doubleClick)
				return;

			layer.draggable = false;
			layer.node.parent.draggable = false;
		};

		var bottom_onmouseout = function(layer) {
			if (!_.App.doubleClick)
				return;

			layer.draggable = true;
			layer.node.parent.draggable = true;
		};

		var bottom_ondragstart = function(layer) {
			if (_.App.doubleClick) {
				return;
			}

			layer.groups = [];
			layer.dragGroups = [];
		};

		var bottom_ondrag = function(layer) {
			if (_.App.doubleClick) {
				return;
			}

			var rx = layer.x - layer.node.parent.x;
			var ry = layer.y - layer.node.parent.y;
			var d = layer.strokeMid;

			// Left border?
			if (rx <= d) {
				layer.x = layer.node.parent.x + d;
				if (ry < 0) {
					layer.y = layer.node.parent.y + d;
				}
				else if (ry > 50) {
					layer.y = layer.node.parent.y + 50 - d;	
				}
			}
			// Right border?
			else if (rx >= 100 - d) {
				layer.x = layer.node.parent.x + 100 - d;
				if (ry < 0) {
					layer.y = layer.node.parent.y + d;
				}
				else if (ry > 50) {
					layer.y = layer.node.parent.y + 50 - d;	
				}
			}
			else if (ry < 25) {
				layer.y = layer.node.parent.y + d;
			}
			else {
				layer.y = layer.node.parent.y + 50 - d;	
			}

			var toRelationships = _.App.layersMapping['to'][layer.node.parent.node.id];

			var n = toRelationships.length;
			var i = 0;

			for (; i < n; ++i) {
				var line = toRelationships[i];
				if (line.node.bottom == layer) {
					line.x2 = layer.x;
					line.y2 = layer.y;
				}
			}
		};

		var bottom_ondragstop = function(layer) {
			if (_.App.doubleClick)
				return;

			layer.groups = [layer.node.parent.node.id];
			layer.dragGroups = [layer.node.parent.node.id];
		};

		var circleFeatures = features['bottom'];
		_.App.canvas.drawArc({
			layer: true,
			bringToFront: true,
			strokeStyle: circleFeatures['strokeStyle'],
			strokeWidth: circleFeatures['strokeWidth'],
			strokeMid: features['strokeWidth'] / 2 - 1.5,
			fillStyle: circleFeatures['fillStyle'],

			x: ex, y: ey + features['strokeWidth'] / 2 - 1.5,
			radius: 5,

			groups: [layer.node.id],
			dragGroups: [layer.node.id],

			node: {
				parent: layer,
			},

			click: bottom_onclick,
			mousedown: bottom_onmousedown,
			mouseout: bottom_onmouseout,
			dragstart: bottom_ondragstart,
			drag: bottom_ondrag,
			dragstop: bottom_ondragstop,
		});

		return _.App.canvas.getLayer(-1);
	}
	
	_.App = new App;
	return _.App;
});
