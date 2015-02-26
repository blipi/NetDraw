define(function(require){
    var $ = require('jquery');

    var Style = {
        substypes: ['text', 'top', 'bottom'],

        getStyleFor: function(layer) {
            var getType = function(layer) {
                return 'type' in layer.node ?
                    layer.node.type :
                    ('parent' in layer.node ? 
                        getType(layer.node.parent) :
                        ('from' in layer.node ?
                            getType(layer.node.from) :
                            "DEFAULT"
                        )
                    );
            }

            var type = getType(layer);
            var subtype = layer.node.func;

            return subtype && $.inArray(subtype, Style.substypes) >= 0 ? 
                Style.featuresMapping[type][subtype] : 
                Style.featuresMapping[type];
        },

        getStyleForTypeName: function(type) {
            return type in Style.featuresMapping ? 
                Style.featuresMapping[type]: 
                Style.featuresMapping["DEFAULT"];
        },

        getSelectionColorFor: function(layer) {
            var style = this.getStyleFor(layer);
            return 'selection' in style ? style['selection'] : "#a23";
        },

        featuresMapping: {
            'convolution' : {
                fillStyle: '#256fb3',
                strokeWidth: 4,
                strokeStyle: '#000',

                text : {
                    name: 'Conv',
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 15,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                },

                default: {
                    convolution_param: {
                        num_output: 0,
                        kernel_size: 0,
                        weight_filter: {
                            type: 'constant',
                            value: 0
                        },
                        bias_term: true,
                        pad: 0,
                        stride: 1,
                        group: 1,
                        bias_filler: {
                            type: "constant",
                            value: 0.2
                        }
                    }
                }
            },

            'DEFAULT': {
                fillStyle: '#d7dadd',
                strokeWidth: 3,
                strokeStyle: '#000',

                text : {
                    fillStyle: '#000',
                    strokeWidth: 1,
                    strokeStyle: '#000',
                    x: 50, y: 15,
                },

                top: {
                    fillStyle: '#FFF',
                    strokeWidth: 2,
                    strokeStyle: '#000',                    
                },

                bottom: {
                    fillStyle: '#000',
                    strokeWidth: 2,
                    strokeStyle: '#FFF',                    
                }
            },
        }
    };

    return Style;
});
