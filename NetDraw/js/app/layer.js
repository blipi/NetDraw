define(function (require) {
    var $ = require('jquery'),
        style = require('app/style'),
        controller = require('app/controller'),
        relationship = require('app/relationship'),
        mouse = require('utils/mousehelper');

	var canvas = controller.getCanvas();
	var _counter = 0;

    var Layer = {
    	remove: function(layer) {
    		// Remove layer's text and top point
			canvas.removeLayer(layer.node.textElement);
			canvas.removeLayer(layer.node.top);

			var mappings = controller.getMappings();
			var fromRelationships = mappings['from'][layer.node.id];
			var toRelationships = mappings['to'][layer.node.id];

			var n = fromRelationships.length;
			var i = 0;

			// Delete all relationships starting from this node
			for (; i < n; ++i) {
				relationship.remove(fromRelationships[i]);
			}

			n = toRelationships.length;
			i = 0;

			// Delete all relationships ending to this node
			for (; i < n; ++i) {
				relationship.remove(fromRelationships[i]);
			}

			// Remove layer mappings
			controller.removeLayerMappings(selection);

			// Remove line itself
			canvas.removeLayer(line);
    	},

    	create: function(x, y, type, visibility) {
			console.log("[createLayer] {" + x + "," + y + "," + type + "}");

			var faetures = style.featuresMapping[type];

			var rect_click = function(layer) {
				controller.setSelection(layer);
				layer.strokeStyle = "#a23";
			}

			/* Forward declaration of handlers */
			var rect_ondragstart = function(layer) {
				layer.dragstart = function(layer){
					var front = canvas.getLayers().length;
					canvas.moveLayer(layer, front);
				}
			};

			var rect_drag = function(layer) {
				var front = canvas.getLayers().length;

				var mappings = controller.getMappings();
				var fromRelationships = mappings['from'][layer.node.id];
				var toRelationships = mappings['to'][layer.node.id];

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
				canvas.moveLayer(layer.node.top, front);
				canvas.moveLayer(layer.node.textElement, front);
			};

			var rect_dragstop = function(layer) {
				canvasLayer = Layer.create(layer.x, layer.y, layer.node.name, true);
				Layer.createTopPoint(canvasLayer);
				canvasLayer.node.counter = _.App.realCounter;
				canvasLayer.node.netName = canvasLayer.node.name + '_' + _.App.realCounter;
				canvasLayer.node.textElement.text = canvasLayer.node.id;
				canvasLayer.node.func = 'main';

				++_.App.realCounter;

				layer.x = layer.ox;
				layer.y = layer.oy;
				layer.node.textElement.x = layer.node.textElement.ox;
				layer.node.textElement.y = layer.node.textElement.oy;

				canvasLayer.dragstop = function(layer){
				}
			};


		    /* Draw all usable elements */
		    canvas.drawRect({
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

				groups: [type + '_' + _counter],
				dragGroups: [type + '_' + _counter],

				node: {
					func: 'reserved',
					name: type,
					id: type + '_' + _counter,
					netName: '',

					textElement: null,
					top: null,
				},

				click: rect_click,
				dragstart: rect_ondragstart,
				drag: rect_drag,
				dragstop: rect_dragstop
			});

			var currentLayer = canvas.getLayer(-1);
			var mappings = controller.getMappings();
			
			mappings['from'][currentLayer.node.id] = [];
			mappings['to'][currentLayer.node.id] = [];

			var textFeatures = faetures['text'];
			canvas.drawText({
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

				click: function(layer) { layer.node.parent.click(layer.node.parent); },
				dragstart: function(layer) { layer.node.parent.dragstart(layer.node.parent); },
				drag: function(layer) { layer.node.parent.drag(layer.node.parent); },
				dragstop: function(layer) { layer.node.parent.dragstop(layer.node.parent); },

				groups: [type + '_' + _counter],
				dragGroups: [type + '_' + _counter],
			});

			currentLayer.node.textElement = canvas.getLayer(-1);

			++_counter;
			return currentLayer;
		}
    };

    return Layer;
});
