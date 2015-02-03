define(['jquery', 'jcanvas'], function ($) {

	var Controller = function() {

		if ( Controller.prototype._instance ) {
			return Controller.prototype._instance;
		}
		
		Controller.prototype._instance = this;

		this._selection = null;
		this._drawingLine = null;

		this._mappings = {
			'from': {},
			'to': {}
		};

		this.getCanvas = function() {
			return $('#canvas');
		},

		this.getWrapper = function() {
			return $('#wrapper');
		},

		this.getSelection = function() {
			return this._selection;
		}

		this.setSelection = function(s) {
			this._selection = s;
		}

		this.clearSelection = function() {
			this._selection = null;
		}

		this.getDrawingLine = function() {
			return this._drawingLine;
		}

		this.getMappings = function() {
			return this._mappings;
		}

		this.removeMapping = function(origin, id, line) {
			var index = this._mappings[origin][id].indexOf(line);
			if (index >= 0) {
				this._mappings[origin][id].splice(index, 1);			
				return true;
			}

			return false;
		}

		this.removeBothMappings = function(line) {
			this.removeMapping('from', line.node.from.node.id, line);
			this.removeMapping('to', line.node.to.node.id, line);
		}

		this.removeLayerMappings = function(layer) {
			this._mappings['from'][layer.node.id] = [];
			this._mappings['to'][layer.node.id] = [];
		}
	};

	return new Controller();
});
