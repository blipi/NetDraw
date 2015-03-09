define(function (require) {
    var $ = require('jquery'),
        pb = require('protobuf'),
        style = require('app/style'),
        menu = require('app/menu'),
        controller = require('app/controller'),
        layer = require('app/layer'),
        relationship = require('app/relationship'),
        canvasObj = require('app/canvas'),
        mouse = require('utils/mousehelper'),
        top = require('app/top'),
        bottom = require('app/bottom');

    require('jquery-ui');
    require('loadCSS');

    var wrapper = controller.getWrapper();
    // TODO: Controller
    var scroll_wrapper = $('#scroll_wrapper');
    var canvas = controller.getCanvas();

    function createNet(net) {
        console.log("[createNet]");
        canvas.removeAllLayers();

        var levelMapper = {};

        var exists = function(needle, haystack) {
            for (var i = 0, len = haystack.length; i < len; ++i) {
                if (haystack[i].value == needle) {
                    return i;
                }
            }

            return -1;
        }

        var findLayer = function(search) {
            var i = net.length;
            while (--i >= 0) {
                var layer = net[i]['layer'];

                if (('top' in layer && 
                            (('value' in layer.top && search == layer.top.value) || 
                            ($.isArray(layer.top) && exists(search, layer.top) >= 0))
                        ) && 
                    /*layer.top != layer.bottom &&*/
                    layer.name.value in levelMapper) {

                    return layer;
                }
            }

            return null;
        }

        var i = 0;
        var n = net.length;
        var levels = {};
        var currentLevel = 0;
        for (; i < n; ++i) {
            var current = net[i]['layer'];
            var found = false;

            if ('bottom' in current) {
                var bottomName = current.bottom.value;
                if ($.isArray(current.bottom))
                {
                    // Simply use the 1st one, we are not interested in relationships (yet)
                    // only in jerarchy
                    bottomName = current.bottom[0].value;
                }  

                if (bottomName != current.name.value) {
                    var top = findLayer(bottomName);
                    if (top != null) {
                        currentLevel = levelMapper[top.name.value][0] + 1;
                        found = true;
                    }
                }
            }

            levelMapper[current.name.value] = [currentLevel, current];

            if (!(currentLevel in levels)) {
                levels[currentLevel] = [];
            }

            levels[currentLevel].push(i);
        }

        // Find out the max number of layers in a level of the net
        var layerSeparation = {x: 160, y: -100}
        var maxLayersPerLevel = 0;
        var levelsCount = 0;
        for (level in levels) {
            ++levelsCount;
            if (levels[level].length > maxLayersPerLevel)
                maxLayersPerLevel = levels[level].length;
        }

        var maxWidth = maxLayersPerLevel*layerSeparation.x;

        var netToLayers = {};
        var addToNetLayers = function(netLayer, outLayer) {
            var _addTop = function(top) {
                if (netLayer.include) {
                    if (!netToLayers[top] || !$.isArray(netToLayers[top]))
                    {
                        netToLayers[top] = [];
                    }
                    netToLayers[top].push(outLayer);
                }
                else {
                    netToLayers[top] = outLayer;
                }
            }

            if ('top' in netLayer) {
                if ('value' in netLayer.top) {
                    _addTop(netLayer.top.value);
                }
                else if ($.isArray(netLayer.top))
                {
                    for (k in netLayer.top) {
                        _addTop(netLayer.top[k].value);
                    }
                }
            }
        }

        var createRelationship = function(netLayer, outLayer) {
            var _stablish = function(from, to) {
                var top = from.createTop();
                relationship.create(from, to);
            }

            var _create = function(bottom) {
                if ($.isArray(netToLayers[bottom])) {
                    for (k in netToLayers[bottom]) {
                        _stablish(netToLayers[bottom][k], outLayer);
                    }
                }
                else {
                    _stablish(netToLayers[bottom], outLayer);
                }
            }

            if ('bottom' in netLayer) {
                if ('value' in netLayer.bottom) {
                    _create(netLayer.bottom.value);
                }
                else if ($.isArray(netLayer.bottom))
                {
                    for (k in netLayer.bottom) {
                        _create(netLayer.bottom[k].value);
                    }
                }
            }
        }

        if (controller.verticalDrawing()) {

            var totalHeight = parseInt(canvas.css('height'));
            var needHeight = maxWidth;
            totalHeight = needHeight;
            canvas.css('height', totalHeight);

            var centerY = totalHeight / 2;
            var x = 20;
            for (level in levels) {
                var layersInLevel = levels[level];

                console.log("===============");
                console.log("Level " + level);

                var len = levels[level].length;
                var y = centerY - (len * 120 / 2);
                for (var i = 0; i < len; ++i) {
                    var current = net[levels[level][i]]['layer'];
                    var outLayer = layer.createDefinitive(x, y, current.type.value, current.name.value, current);

                    createRelationship(current, outLayer);
                    addToNetLayers(current, outLayer);          

                    y += 120;
                }

                x += 100;
            }
        }
        else {
            var totalHeight = parseInt(canvas.css('height'));
            var needHeight = levelsCount * 100;
            totalHeight = needHeight > totalHeight ? needHeight : totalHeight;
            canvas.css('height', totalHeight);

            var centerX = (parseInt(canvas.css('width')) - 170) / 2 - maxWidth / 2;
            var y = totalHeight - 75;
            for (level in levels) {
                var layersInLevel = levels[level];

                console.log("===============");
                console.log("Level " + level);

                var len = levels[level].length;
                var x = 170 + centerX + (maxWidth / 2) - (len * layerSeparation.x / 2);
                for (var i = 0; i < len; ++i) {
                    var current = net[levels[level][i]]['layer'];
                    var outLayer = layer.createDefinitive(x, y, current.type.value, current.name.value, current);

                    createRelationship(current, outLayer);
                    addToNetLayers(current, outLayer);          

                    x += 160;
                }

                y -= 100;
            }
        }
    }

    function initialize()
    {
        var window_onmousemove = function(e) {
            var drawingLine = controller.getDrawingLine();

            if (drawingLine != null) {
                drawingLine.x2 = e.pageX - 155.0; // TODO: Magic numbers
                drawingLine.y2 = e.pageY + scroll_wrapper.scrollTop();
            }
        };

        var window_onkeydown = function(e) {
            var code = e.keyCode || e.which;
            var selection = controller.getSelection();

            if (code == 46 && selection) {

                controller.clearSelection();

                if (relationship.is(selection)) {
                    relationship.remove(selection);
                } else {
                    layer.remove(selection);
                }
            }
        };

        var window_onmousedown = function(e) {
            mouse.mousedown(e);
            controller.clearSelection();
        }

        var window_onmouseup = function(e) {
            mouse.mouseup(e);
        }

        var window_onclick = function(e) {
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

        /* Setup some HTML hooks */
        var wrapper = controller.getWrapper();
        var modeChange = $('#orientation-hor, #orientation-ver');
        var importProto = $('#import_prototxt');
        var importError = $('#import_error');
        var importArea = $('#import_area');
        var importOK = $('#import_ok');
        var importCancel = $('#import_cancel');
        var importTimeout = undefined;

        modeChange.click(function() {
            controller._drawOrientation = $(this).attr('id') == 'orientation-hor' ? 1 : 0;
            var parser = new ProtoBuf();
            var net = parser.compile(canvas.getProto());
            createNet(net);
        });

        importCancel.click(function() {
            wrapper.css('z-index', 1);
            importProto.hide('slide', 'fast');
        });

        importOK.click(function() {
            $('#loading').show('puff', function(){
                try {
                    var parser = new ProtoBuf();
                    var net = parser.compile(importArea.val());
                    net = parser.upgrade(net);
                    createNet(net);
                    importCancel.click();
                }
                catch (err) {
                    if (!importTimeout) {
                        importError.toggle('slow');
                        importArea.animate({height: '-=30'}, 0);
                    }
                    else {
                        clearTimeout(importTimeout);
                    }

                    importTimeout = setTimeout(function(){
                        importArea.animate({height: '+=30'}, 0);
                        importError.toggle('slow', function(){
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
        layerMenu.click(function(e){
            // Stop event from reaching the layer
            e.stopPropagation();

            // Trigger click
            mouse.click(e);

            canvas.bringToFront(controller.getSelection());
        });

        var hideMenu = $('.hide-menu');
        hideMenu.click(function(){
            $(this).parent().hide("highlight", {direction: "left"}, 'fast', function(){
                $(this).siblings('.show-menu').show("highlight", {direction: "left"}, 'fast');
            });
        });

        var deleteLayer = $('.delete-layer');
        deleteLayer.click(function(){
            var current = controller.getSelection();
            layer.remove(current);
        });

        var editName = $('.edit-name');
        editName.click(function(){
            var activeLayer = controller.getSelection();
            if (activeLayer.node.input) { 
                return
            }

            // TODO: Use some real CSS
            var input = $('<input>');
            input.attr({
                type: 'text',
                value: activeLayer.text
            })
            .keydown(function(e){
                var code = e.keyCode || e.which;
                if (code == 13){
                    if ($(this).val()) {
                        var activeLayer = controller.getSelection();
                        activeLayer.text = $(this).val();
                        activeLayer.textX = layer.getTextX(activeLayer.text);

                        activeLayer.node.params['name'].value = activeLayer.text;
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
        })
        
        var showMenu = $('.show-menu');
        showMenu.click(function(e){
            $(this).hide("highlight", {direction: "left"}, 'fast', function(){
                canvas.bringToFront(controller.getSelection());
                $(this).parent().children('.layer-menu').show("highlight", {direction: "left"}, 'fast');
            });

            // Stop event from reaching the layer
            e.stopPropagation()

            // Trigger click
            mouse.click(e);
        });

        // Dynamically load bootstrap and page css (Must do in this order to preserve hierarchy)
        loadCSS('https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css', undefined, undefined, function(){
            loadCSS('css/main.css', undefined, undefined, function(){
                $('#loading').hide('puff');
            });
        });
    };

    initialize();
});
