define(function (require) {
    var $ = require('jquery'),
        controller = require('app/controller');

	var canvas = controller.getCanvas();

    return {
    	is: function(line) {
    		return 'node' in line && 'func' in line.node && line.node.func == 'line';
    	},

    	remove: function(line) {
    		// Remove bottom point
			canvas.removeLayer(line.node.bottom);

			// Remove line itself
			canvas.removeLayer(line);

			// Remove from mappings
			controller.removeBothMappings(line);
    	}
    }
});
