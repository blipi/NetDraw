define(['jquery', 'protobuf.2', 'app/layer', 'app/relationship', 'app/controller', 'caffeconstants'], function($, pb, layer, relationship, controller, caffe){

    var canvas = controller.getCanvas();
    var instances = {};
    var menuY = 50;

    var Menu = {
        create: function() {

            groups = {};
            groups['Vision Layers'] = [
                V1LayerParameter.LayerType.CONVOLUTION, 
                V1LayerParameter.LayerType.POOLING,
                V1LayerParameter.LayerType.LRN,
                V1LayerParameter.LayerType.IM2COL
            ];

            groups['Loss Layers'] = [
                V1LayerParameter.LayerType.SOFTMAX_LOSS,
                V1LayerParameter.LayerType.EUCLIDEAN_LOSS,
                V1LayerParameter.LayerType.HINGE,
                V1LayerParameter.LayerType.SIGMOID,
                V1LayerParameter.LayerType.INFOGAIN_LOSS,
                V1LayerParameter.LayerType.ACCURACY
            ];

            groups['Activation Layers'] = [
                V1LayerParameter.LayerType.RELU,
                V1LayerParameter.LayerType.DROPOUT,
                V1LayerParameter.LayerType.SIGMOID,
                V1LayerParameter.LayerType.TANH,
                V1LayerParameter.LayerType.ABSVAL,
                V1LayerParameter.LayerType.POWER,
                V1LayerParameter.LayerType.BNLL
            ];

            groups['Data Layers'] = [
                V1LayerParameter.LayerType.DATA,
                V1LayerParameter.LayerType.MEMORY_DATA,
                V1LayerParameter.LayerType.HDF5_DATA,
                V1LayerParameter.LayerType.IMAGE_DATA,
                V1LayerParameter.LayerType.WINDOW_DATA,
                V1LayerParameter.LayerType.DUMMY_DATA
            ];

            groups['Common Layers'] = [
                V1LayerParameter.LayerType.INNER_PRODUCT,
                V1LayerParameter.LayerType.SPLIT,
                V1LayerParameter.LayerType.FLATTEN,
                V1LayerParameter.LayerType.CONCAT,
                V1LayerParameter.LayerType.SLICE
            ];

            console.log(groups);

            var showImport = function() {
                var importProto = $('#import_prototxt');
                if (importProto.is(':visible'))
                    return;

                var importArea = $('#import_area');

                importArea.val('');
                importProto.toggle('fast');
                controller.getWrapper().css('z-index', '-1');
            }

            var menuObj = $('#menu');

            // Import button
            canvas.drawRectInto(menuObj, {
                layer: true,
                draggable: false,
                fromCenter: false,
                x: -3, y: 12,
                width: 153,
                height: 25,
                cornerRadius: 0,

                strokeStyle: "#000000",
                strokeWidth: 2,
                fillStyle: "#63ab2a",

                click: showImport
            });

            var box = canvas.getLayer(-1);

            /* Text */
            canvas.drawTextInto(box, {
                layer: true,
                draggable: false,
                fillStyle: "#000",
                strokeStyle: "#000",
                strokeWidth: 0,
                fromCenter: false,
                x: 20, y: 0,
                fontSize: 13,
                fontFamily: 'Verdana, sans-serif',
                text: "Import prototxt",

                click: showImport
            });

            var menu_onclick = function(layer){
                if (!instances[layer.g][3]) {
                    /* Expand */
                    for (g in instances) {

                        this.animateLayer(instances[g][0], {
                            y: menuY - 3
                        }, 'medium', 'swing');

                        if (instances[g][0] == layer || instances[g][1] == layer) {
                            canvas.bringToFront(instances[g][0]);
                            canvas.bringToFront(instances[g][1]);
                        }
                    }

                    for (l in instances[layer.g][2]) {
                        instances[layer.g][2][l].visible = true;
                        instances[layer.g][2][l].node.textElement.visible = true;
                    }
                } else {
                    var ey = menuY;
                    
                    for (l in instances[layer.g][2]) {
                        instances[layer.g][2][l].visible = false;
                        instances[layer.g][2][l].node.textElement.visible = false;
                    }

                    /* Expand */
                    for (g in instances) {

                        this.animateLayer(instances[g][0], {
                            y: ey - 3
                        }, 'medium', 'swing');

                        ey += 27;
                    }
                }

                instances[layer.g][3] = !instances[layer.g][3];
            };

            var ey = menuY;
            for (group in groups) {

                /* Box */
                canvas.drawRectInto(menu, {
                    layer: true,
                    draggable: false,
                    fromCenter: false,
                    x: -3, y: -3 + ey,
                    width: 153,
                    height: 25,
                    cornerRadius: 0,

                    strokeStyle: "#000000",
                    strokeWidth: 2,
                    fillStyle: "#ea940e",
                    
                    expanded: false,
                    g: group,

                    click: menu_onclick
                });

                var box = canvas.getLayer(-1);

                /* Text */
                canvas.drawTextInto(box, {
                    layer: true,
                    draggable: false,
                    fillStyle: "#000",
                    strokeStyle: "#000",
                    strokeWidth: 0,
                    fromCenter: false,
                    x: 10, y: 0,
                    fontSize: 13,
                    fontFamily: 'Verdana, sans-serif',
                    text: group,

                    expanded: false,
                    g: group,
                });

                var text = canvas.getLayer(-1);
                
                console.log("================");
                console.log(group);

                var layers = [];
                var i = 0;
                for (var k = 0, len = groups[group].length; k < len; ++k) {
                    var layerType = UpgradeV1LayerType(parseInt(groups[group][k]));

                    layers.push(layer.create(25, menuY + 25 + 60*i, layerType, false, menu));
                    i += 1;
                }

                instances[group] = [box, text, layers, false];

                ey += 27;
            }
        }
    };

    return Menu;
});
