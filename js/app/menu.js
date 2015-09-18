define(['jquery', 'protobuf.2', 'app/layer', 'app/relationship', 'app/controller', 'caffeconstants'], function ($, pb, layer, relationship, controller, caffe) {

    var canvas = controller.getCanvas();
    var instances = {byGroup: {}, byBox: {}};
    var currentCategory = null;

    var MenuInstance = function (_category, _triggered) {
        return {category: _category, triggered: _triggered};
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
                V1LayerParameter.LayerType.SLICE,
                V1LayerParameter.LayerType.ELTWISE
            ];

            var showImport = function () {
                var importProto = $('#import_prototxt');
                if (importProto.is(':visible')) {
                    return;
                }

                var importArea = $('#import_area');

                importArea.val('');
                importProto.show('slide', 'fast', function () {
                    importArea.focus();
                });
                controller.getWrapper().css('z-index', '-1');
            };

            var menuObj = $('.menu');
            var menuList = $('.menu .categories ul');

            // Import button
            canvas.drawBoxInto(menuObj, {
                x: -3, y: 12,
                click: showImport,
                text: 'Import prototext',
                className: 'menu-import'
            });

            var menu_onclick = function () {
                var me = $(this);

                if (!currentCategory || currentCategory.data('container') != $(this).data('container')) {
                    var showCurrent = function () {
                        $('#' + me.data('container'))
                            .show()
                            .css('animation-holder', '0')
                            .animate({
                                'animation-holder': 90
                            },
                            {
                                duration: 150,
                                step: function (now, fx) {
                                        $(this).css('transform', 'rotateX(' + (-90 + now) + 'deg)');
                                    }
                            });
                    };

                    if (currentCategory) {
                        $('#' + currentCategory.data('container'))
                            .show()
                            .css('animation-holder', '0')
                            .animate({
                                'animation-holder': 90
                            },
                            {
                            duration: 150,
                            step: function (now, fx) {
                                    $(this).css('transform', 'rotateX(' + (now) + 'deg)');
                                },
                            done: showCurrent
                        });
                    } else {
                        showCurrent();
                    }

                    currentCategory = me;
                }

            };

            var id = 0;
            for (var group in groups) {

                var category = $('<li>' + group + '</li>')
                    .click(menu_onclick)
                    .data('container', 'category-' + id)
                    .appendTo(menuList);

                var container = $('<div id="category-' + id + '" class="category-container"></div>').
                    appendTo(menuObj);

                console.log('================');
                console.log(group);

                var len = len = groups[group].length;
                var x = parseInt(menuObj.css('width')) / 2 - (len * 100 + (len - 1) * 20) / 2;

                for (var k = 0; k < len; ++k) {
                    var layerType = UpgradeV1LayerType(parseInt(groups[group][k]));

                    layer.create(x, 18, layerType, true, container, false);
                    x += 120;
                }

                instances.byGroup[group] = MenuInstance(category, false);
                instances.byBox['category-' + id] = category;

                ++id;
            }

            $(function () {

            });
        }
    };

    return Menu;
});
