define(['jquery', 'protobuf.2', 'app/layer', 'app/relationship', 'app/controller', 'caffeconstants'], function ($, pb, layer, relationship, controller, caffe) {

    var canvas = controller.getCanvas();
    var instances = {byGroup: {}, byBox: {}};
    var menuY = 50;

    var MenuInstance = function (_box, _layers, _triggered) {
        return {box: _box, layers: _layers, triggered: _triggered};
    };

    var Menu = {
        create: function () {

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

            var showImport = function () {
                var importProto = $('#import_prototxt');
                if (importProto.is(':visible')) {
                    return;
                }

                var importArea = $('#import_area');

                importArea.val('');
                importProto.show('slide', 'fast');
                controller.getWrapper().css('z-index', '-1');
            };

            var menuObj = $('#menu');

            // Import button
            canvas.drawBoxInto(menuObj, {
                x: -3, y: 12,
                click: showImport,
                text: 'Import prototext',
                className: 'menu-import'
            });

            var menu_onclick = function () {
                var group = instances.byBox[$(this).attr('id')];
                var instancesByGroup = instances.byGroup;
                var instance = instancesByGroup[group];

                if (!instance.triggered) {
                    /* Expand */
                    for (var g in instancesByGroup) {

                        instancesByGroup[g].box.animate({
                            top: menuY - 3
                        }, 'medium', 'swing');

                        if (instancesByGroup[g].box.attr('id') == $(this).attr('id')) {
                            instancesByGroup[g].box.css('z-index', 2);
                        } else {
                            instancesByGroup[g].box.css('z-index', 1);
                        }
                    }

                    for (var i = 0, len = instance.layers.length; i < len; ++i) {
                        instance.layers[i].visible = true;
                    }
                } else {
                    var ey = menuY;

                    for (var i = 0, len = instance.layers.length; i < len; ++i) {
                        instance.layers[i].visible = false;
                    }

                    /* Expand */
                    for (var g in instancesByGroup) {

                        instancesByGroup[g].box.animate({
                            top: ey - 3
                        }, 'medium', 'swing');

                        ey += 27;
                    }
                }

                instance.triggered = !instance.triggered;
            };

            var ey = menuY;
            var id = 0;
            for (var group in groups) {

                /* Box */
                var box = canvas.drawBoxInto(menu, {
                    x: -3, y: -3 + ey,
                    click: menu_onclick,
                    text: group,
                    id: 'box-' + id,
                    className: 'menu-box'
                });

                console.log('================');
                console.log(group);

                var layers = [];
                var i = 0;
                for (var k = 0, len = groups[group].length; k < len; ++k) {
                    var layerType = UpgradeV1LayerType(parseInt(groups[group][k]));

                    layers.push(layer.create(25, menuY + 25 + 60 * i, layerType, false, menu, false));
                    i += 1;
                }

                instances.byGroup[group] = MenuInstance(box, layers, false);
                instances.byBox['box-' + id] = group;

                ey += 27;
                ++id;
            }
        }
    };

    return Menu;
});
