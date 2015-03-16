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
        var phaseCount = 0;

        var addTop = function (current) {
            var _add = function (name) {
                if (!(name in netDAG)) {
                    netDAG[name] = [];
                }

                if (current.phase != Phase.GLOBAL) {
                    netDAG[name].push(current);
                } else {
                    netDAG[name] = [current];
                }
            };

            if ('top' in current) {
                if ('value' in current.top) {
                    _add(current.top.value);
                } else if ($.isArray(current.top)) {
                    for (var k = 0, end = current.top.length; k < end; ++k) {
                        _add(current.top[k].value);
                    }
                }
            }
        };

        var getFalseName = function (layer, name) {
            return typeof(name) === 'undefined' ?
                layer.name.value + '$$' + layer.phase :
                name + '$$' + layer.phase;
        };

        var follow = function (layer) {

            var stablish = function (fromName) {

                if (fromName in netDAG) {
                    for (var j = 0, len = netDAG[fromName].length; j < len; ++j) {
                        var netLayer = netDAG[fromName][j];

                        var falseFromName = getFalseName(netLayer);
                        var falseLayerName = getFalseName(layer);

                        var from = netLayers[falseFromName];
                        var to = netLayers[falseLayerName];

                        // Create relationship
                        var top = from.createTop(fromName);
                        relationship.create(from, to, true, top);

                        // Update level by getting the topmost
                        layerToLevel[falseLayerName] = Math.max(
                            layerToLevel[falseLayerName], layerToLevel[falseFromName] + 1);
                    }
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
        x = 0;

        for (var i = 0, len = net.length; i < len; ++i) {
            var current = net[i].layer;
            var phase = Phase.GLOBAL;

            // Check phase
            if ('include' in current && 'phase' in current.include) {
                if ('value' in current.include.phase) {
                    phase = GetPhase(current.include.phase.value);
                } else if ($.isArray(current.include.phase)) {
                    // TODO: Not quite sure how to handle this, nor if it could ever happen
                }
            }

            var outLayer = layer.createDefinitive(x, 0, current.type.value, current.name.value, current);
            current.phase = phase;
            outLayer.phase = phase;

            var falseCurrentName = getFalseName(current);
            netLayers[falseCurrentName] = outLayer;
            x += 120;

            // Set initial level value to 0
            layerToLevel[falseCurrentName] = 0;
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
        prettyDraw(levels, Phase.TRAIN);
    }

    function prettyDraw(netLevels, phase) {
        // Real level lengths (taking into account phase)
        var realLength = [];

        var suitable = function (layer) {
            return layer.phase == phase || layer.phase == Phase.GLOBAL;
        };

        // Get the most number of layers on a level
        var maxLayersOnLevel = 0;
        for (var i = 0, len = netLevels.length; i < len; ++i) {
            // Check layers phase
            var n = 0;
            for (var j = 0, end = netLevels[i].length; j < end; ++j) {
                if (suitable(netLevels[i][j])) {
                    ++n;
                }
            }

            // Check if it is bigger than max
            if (n > maxLayersOnLevel) {
                maxLayersOnLevel = n;
            }

            realLength.push(n);
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
                var y = needHeight / 2 - heightForN(realLength[i]) / 2;

                for (var k = 0, end = netLevels[i].length; k < end; ++k) {
                    if (!suitable(netLevels[i][k])) {
                        netLevels[i][k].hide();
                        continue;
                    }

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
                var x = needWidth / 2 - widthForN(realLength[i]) / 2;

                for (var k = 0, end = netLevels[i].length; k < end; ++k) {
                    if (!suitable(netLevels[i][k])) {
                        netLevels[i][k].hide();
                        continue;
                    }

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
                var coords = controller.screenCoordinates($('body'));
                drawingLine.x2 = e.pageX + coords.x;
                drawingLine.y2 = e.pageY + coords.y;
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

        // Set GLOBAL phase
        controller.setPhase(Phase.GLOBAL);

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
