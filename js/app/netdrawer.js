define(function (require) {
    var $ = require('jquery');
    var pb = require('protobuf');
    var menu = require('app/menu');
    var controller = require('app/controller');
    var layer = require('app/layer');
    var relationship = require('app/relationship');
    var canvasObj = require('app/canvas');
    var mouse = require('utils/mousehelper');
    var top = require('app/top');
    var bottom = require('app/bottom');

    require('caffeconstants');
    require('jquery-ui');
    require('loadCSS');

    var wrapper = controller.getWrapper();
    // TODO: Controller
    var scroll_wrapper = $('#scroll_wrapper');
    var canvas = controller.getCanvas();

    function createNet(net) {
        // First of all, clear current cnvas
        canvas.removeAllLayers();

        var queue = [];
        var parsed = [];
        var netDAG = {};
        var netLayers = {};
        var layerToLevel = {};

        var addTop = function (current) {
            if ('top' in current) {
                if ('value' in current.top) {
                    netDAG[current.top.value] = current;
                } else if ($.isArray(current.top)) {
                    for (var k = 0, end = current.top.length; k < end; ++k) {
                        netDAG[current.top[k].value] = current;
                    }
                }
            }
        }

        var follow = function (layer) {

            var stablish = function (fromName) {

                if (fromName in netDAG) {
                    var netLayer = netDAG[fromName];
                    var from = netLayers[netLayer.name.value];
                    var to = netLayers[layer.name.value];

                    // Create relationship
                    var top = from.createTop(fromName);
                    relationship.create(from, to);

                    // Update level by getting the topmost
                    layerToLevel[layer.name.value] = Math.max(
                        layerToLevel[layer.name.value], layerToLevel[netLayer.name.value] + 1);
                }
            };

            // Find all possible tops for all bottoms
            if ('bottom' in layer) {
                if ('value' in layer.bottom) {
                    stablish(layer.bottom.value);
                } else if ($.isArray(layer.bottom)) {
                    for (var k = 0, end = layer.bottom.length; k < end; ++k) {
                        stablish(layer.bottom[k].value);
                    }
                }
            }

            addTop(layer);
        };

        // Parse both train and test
        for (var p in Phase) {
            var phase = Phase[p];

            // Skip invalid (special) phases
            if (phase < 0) {
                continue;
            }

            controller.setPhase(phase);

            // Reset holders
            queue = [];
            netDAG = {};
            layerToLevel = {};

            x = 0;

            for (var i = 0, len = net.length; i < len; ++i) {
                var current = net[i].layer;

                // Check phase
                if ('include' in current && 'phase' in current.include) {
                    if ('value' in current.include.phase) {
                        if (GetPhase(current.include.phase.value) != phase) {
                            continue;
                        }
                    } else if ($.isArray(current.include.phase)) {
                        var skip = true;
                        for (var k = 0, end = current.include.phase.length; k < end; ++k) {
                            if (GetPhase(current.include.phase[k].value) == phase) {
                                skip = false;
                                break;
                            }
                        }

                        if (skip) {
                            continue;
                        }
                    }
                }

                var outLayer = layer.createDefinitive(x, 0, current.type.value, current.name.value, current);
                netLayers[current.name.value] = outLayer;
                x += 120;

                // Set initial level value to 0
                layerToLevel[current.name.value] = 0;
                if ('bottom' in current) {
                    queue.push(current);
                } else {
                    addTop(current);
                }
            }

            // Keep parsing until empty
            while (queue.length) {
                follow(queue.shift());
            }

            // Create levels array
            var levels = [];
            for (var layerName in layerToLevel) {
                var l = layerToLevel[layerName];

                // Set minimum size for this level
                while (levels.length - 1 < l) {
                    levels.push([]);
                }

                // Push layer
                levels[l].push(netLayers[layerName]);
            }

            // Pretty draw everything
            prettyDraw(levels);
        }
    }

    function prettyDraw(netLevels) {
        // Get the most number of layers on a level
        var maxLayersOnLevel = 0;
        for (var i = 0, len = netLevels.length; i < len; ++i) {
            if (netLevels[i].length > maxLayersOnLevel) {
                maxLayersOnLevel = netLevels[i].length;
            }
        }

        // TODO: Magic numbers
        if (controller.verticalDrawing()) {
            var heightForN = function (n) { return n * 100 + (n - 1) * 20; };
            var widthForN = function (n) { return n * 100 + 40; };

            var needHeight = heightForN(maxLayersOnLevel) + 40;
            needHeight = Math.max(needHeight, $('#scroll_wrapper').height() - 20);
            canvas.css('height', needHeight);

            var needWidth = widthForN(netLevels.length);
            canvas.css('width', needWidth);

            var x = 20;
            for (var i = 0, len = netLevels.length; i < len; ++i) {
                var y = needHeight / 2 - heightForN(netLevels[i].length) / 2;

                for (var k = 0, end = netLevels[i].length; k < end; ++k) {
                    netLevels[i][k].move(x, y);

                    y += 120;
                }

                x += 100;
            }
        } else {
            var heightForN = function (n) { return n * 55 + (n - 1) * 20; };
            var widthForN = function (n) { return n * 100 + 40; };

            var needWidth = widthForN(maxLayersOnLevel) + 40;
            needWidth = Math.max(needWidth, $('#scroll_wrapper').width() - 20);
            canvas.css('width', needWidth);

            var needHeight = heightForN(netLevels.length);
            canvas.css('height', needHeight);

            var y = needHeight - 20;
            for (var i = 0, len = netLevels.length; i < len; ++i) {
                var x = needWidth / 2 - widthForN(netLevels[i].length) / 2;

                for (var k = 0, end = netLevels[i].length; k < end; ++k) {
                    netLevels[i][k].move(x, y);

                    x += 100;
                }

                y -= 75;
            }
        }

        $('#scroll_wrapper').animate({
            scrollTop: $('#canvas').height(),
            scrollLeft: 0
        }, 'medium');
    }

    function initialize()
    {
        var window_onmousemove = function (e) {
            var drawingLine = controller.getDrawingLine();

            if (drawingLine !== null) {
                drawingLine.x2 = e.pageX + scroll_wrapper.scrollLeft() - 155.0; // TODO: Magic numbers
                drawingLine.y2 = e.pageY + scroll_wrapper.scrollTop();
            }
        };

        var window_onkeydown = function (e) {
            var code = e.keyCode || e.which;
            var selection = controller.getSelection();

            if (code == 46 && selection) {

                controller.clearSelection();

                if (relationship.is(selection)) {
                    relationship.remove(selection);
                } else {
                    selection.remove();
                }
            }
        };

        var window_onmousedown = function (e) {
            mouse.mousedown(e);
            controller.clearSelection();
        };

        var window_onmouseup = function (e) {
            mouse.mouseup(e);
        };

        var window_onclick = function (e) {
            mouse.click(e);
        };

        canvasObj.initialize();

        $(window).keydown(window_onkeydown);
        $(window).mousemove(window_onmousemove);
        $(window).mousedown(window_onmousedown);
        $(window).mouseup(window_onmouseup);
        $(window).click(window_onclick);

        menu.create();
        relationship.initialize();
        top.initialize();
        bottom.initialize();

        // Set TEST phase
        controller.setPhase(Phase.TEST);

        /* Setup some HTML hooks */
        var wrapper = controller.getWrapper();
        var modeChange = $('#orientation-hor, #orientation-ver');
        var importProto = $('#import_prototxt');
        var importError = $('#import_error');
        var importArea = $('#import_area');
        var importOK = $('#import_ok');
        var importCancel = $('#import_cancel');
        var importTimeout = null;

        modeChange.click(function () {
            var id = $(this).attr('id');

            $('#loading').show('puff', function () {
                controller._drawOrientation = id == 'orientation-hor' ? 1 : 0;

                var netDef = canvas.getProto();
                if (netDef === false) {
                    alert('Your net seems to have a cycle');
                } else {
                    var parser = new ProtoBuf();
                    var net = parser.compile(netDef);
                    createNet(net);
                }

                $('#loading').hide('puff');
            });
        });

        importCancel.click(function () {
            wrapper.css('z-index', 1);
            importProto.hide('slide', 'fast');
        });

        importOK.click(function () {
            $('#loading').show('puff', function () {
                try {
                    var parser = new ProtoBuf();
                    var net = parser.compile(importArea.val());
                    net = parser.upgrade(net);
                    createNet(net);
                    importCancel.click();
                } catch (err) {
                    if (!importTimeout) {
                        importError.toggle('slow');
                        importArea.animate({height: '-=30'}, 0);
                    } else {
                        clearTimeout(importTimeout);
                    }

                    importTimeout = setTimeout(function () {
                        importArea.animate({height: '+=30'}, 0);
                        importError.toggle('slow', function () {
                            importTimeout = undefined;
                        });
                    }, 10000);
                }
                finally {
                    $('#loading').hide('puff');
                }
            });
        });

        var layerMenu = $('#layer-menu');
        layerMenu.click(function (e) {
            // Stop event from reaching the layer
            e.stopPropagation();

            // Trigger click
            mouse.click(e);

            canvas.bringToFront(controller.getSelection());
        });

        var hideMenu = $('.hide-menu');
        hideMenu.click(function () {
            $(this).parent().hide('highlight', {direction: 'left'}, 'fast', function () {
                $(this).siblings('.show-menu').show('highlight', {direction: 'left'}, 'fast');
            });
        });

        var deleteLayer = $('.delete-layer');
        deleteLayer.click(function () {
            var current = controller.getSelection();
            layer.remove(current);
        });

        var editName = $('.edit-name');
        editName.click(function () {
            var activeLayer = controller.getSelection();
            if (activeLayer.node.input) {
                return;
            }

            var input = $('<input>');
            input.attr({
                type: 'text',
                value: activeLayer.text
            })
            .keydown(function (e) {
                var code = e.keyCode || e.which;
                if (code == 13){
                    if ($(this).val()) {
                        var activeLayer = controller.getSelection();
                        activeLayer.text = $(this).val();
                        activeLayer.textX = layer.getTextX(activeLayer.text);

                        activeLayer.node.params.name.value = activeLayer.text;
                        console.log(activeLayer.node.params);

                        activeLayer.node.input = null;
                        $(this).remove();
                    }
                }

                // Avoid keys such as "DEL" to reach window
                e.stopPropagation();
            })
            .appendTo(activeLayer.getDOM())
            .select();

            activeLayer.node.input = input;
        });

        var showMenu = $('.show-menu');
        showMenu.click(function (e) {
            $(this).hide('highlight', {direction: 'left'}, 'fast', function () {
                canvas.bringToFront(controller.getSelection());
                $(this).parent().children('.layer-menu').show('highlight', {direction: 'left'}, 'fast');
            });

            // Stop event from reaching the layer
            e.stopPropagation();

            // Trigger click
            mouse.click(e);
        });

        // Dynamically load bootstrap and page css (Must do in this order to preserve hierarchy)
        loadCSS('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css', undefined, undefined, function () {
            loadCSS('css/main.css', undefined, undefined, function () {
                // We apply GoogLeNet color scheme by default
                loadCSS('css/googlenet.css', undefined, undefined, function () {
                    $('#loading').hide('puff');
                });
            });
        });
    }

    initialize();
});
