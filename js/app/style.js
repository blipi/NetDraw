define(function (require){
    var $ = require('jquery');
    var caffe = require('caffeconstants');

    var stylesArray = {};

    // Convolution
    stylesArray[V1LayerParameter.LayerType.CONVOLUTION] = {
        fillStyle: '#256fb3',
        strokeWidth: 4,
        strokeStyle: '#000',

        text: {
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
    };

    // Default
    stylesArray[V1LayerParameter.LayerType.NONE] = {
        fillStyle: '#d7dadd',
        strokeWidth: 3,
        strokeStyle: '#000',

        text: {
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
    };

    var Style = {
        substypes: ['text', 'top', 'bottom'],
        featuresMapping: {},

        getStyleFor: function (layer) {
            var getType = function (layer) {
                return 'type' in layer.node ?
                    layer.node.type :
                    ('parent' in layer.node ?
                        getType(layer.node.parent) :
                        ('from' in layer.node ?
                            getType(layer.node.from) :
                            'Default'
                        )
                    );
            };

            var type = getType(layer);
            var subtype = layer.node.func;

            return subtype && $.inArray(subtype, Style.substypes) >= 0 ?
                Style.featuresMapping[type][subtype] :
                Style.featuresMapping[type];
        },

        getStyleForTypeName: function (type) {
            return type in Style.featuresMapping ?
                Style.featuresMapping[type] :
                Style.featuresMapping.Default;
        },

        getSelectionColorFor: function (layer) {
            var style = this.getStyleFor(layer);
            return 'selection' in style ? style.selection : '#a23';
        },
    };

    // Save layers by name
    for (var layerConst in stylesArray) {
        Style.featuresMapping[UpgradeV1LayerType(parseInt(layerConst))] = stylesArray[layerConst];
    }

    return Style;
});
