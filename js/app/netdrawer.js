define(function (require) {
    var $ = require('jquery'),
        pb = require('protobuf'),
        style = require('app/style'),
        menu = require('app/menu'),
        controller = require('app/controller'),
        layer = require('app/layer'),
        relationship = require('app/relationship'),
        canvasObj = require('app/canvas'),
        mouse = require('utils/mousehelper');

    require('jquery-ui');

    var wrapper = controller.getWrapper();
    // TODO: Controller
    var scroll_wrapper = $('#scroll_wrapper');
    var canvas = controller.getCanvas();
    var timeout = null;

    function createNet(net) {
        console.log("[createNet]");

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
            var _create = function(bottom) {
                if ($.isArray(netToLayers[bottom])) {
                    for (k in netToLayers[bottom]) {
                        relationship.create(netToLayers[bottom][k], outLayer);
                    }
                }
                else {
                    relationship.create(netToLayers[bottom], outLayer);
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

        canvas.drawLayers();
    }

    function initialize()
    {
        var window_onmousemove = function(e) {
            var drawingLine = controller.getDrawingLine();

            if (drawingLine != null) {
                console.log(e.pageX);
                drawingLine.x2 = e.pageX - 155.0; // TODO: Magic numbers
                drawingLine.y2 = e.pageY + scroll_wrapper.scrollTop();
                canvas.drawLayers();
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

                canvas.drawLayers();
            }
        };

        var scrollGetter = {
            get top () {
                return parseInt(canvas._scroll_wrapper.scrollTop());
            },
            get left () {
                return parseInt(canvas._scroll_wrapper.scrollLeft());
            },
            get width() {
                return parseInt(canvas.css('width'));
            },
            get height() {
                return parseInt(canvas.css('height'));
            },
            get currentX() {
                var selection = controller.getSelection();
                return selection.windowX;
            },
            get currentY() {
                var selection = controller.getSelection();
                return selection.windowY;
            }
        };

        var window_onmousedown = function(e) {
            mouse.mousedown(e);
            controller.clearSelection();

            if (!timeout) {
                // We must wait a little
                setTimeout(function() {
                    timeout = setInterval(function(){
                        var selection = controller.getSelection();

                        if (!selection || !mouse.isDown()) {
                            clearInterval(timeout);
                            timeout = null;
                            return;
                        }

                        // BOTTOM
                        if (scrollGetter.currentY >= scrollGetter.height - 200) {
                            canvas.css('height', scrollGetter.height + 100);
                            // HACK: Should not access _scroll_wrapper
                            canvas._scroll_wrapper.scrollTop(scrollGetter.height + 100);
                            selection.y += 100;
                        }

                        // TOP
                        if (scrollGetter.currentY - scrollGetter.top <= 200) {
                            if (scrollGetter.top > 0) {
                                canvas._scroll_wrapper.scrollTop(scrollGetter.top - 75);
                                selection.y -= 75;
                            }
                            else {
                                // TODO: Expand upper limit
                            }
                        }

                        // RIGHT
                        if (scrollGetter.currentX >= scrollGetter.width - 200) {
                            canvas.css('width', scrollGetter.width + 100);
                            // HACK: Should not access _scroll_wrapper
                            canvas._scroll_wrapper.scrollLeft(scrollGetter.width + 100);
                            selection.x += 100;
                        }

                        // TOP
                        if (scrollGetter.currentX - scrollGetter.left <= 200) {
                            if (scrollGetter.left > 0) {
                                canvas._scroll_wrapper.scrollLeft(scrollGetter.left - 75);
                                selection.x -= 75;
                            }
                            else {
                                // TODO: Expand upper limit
                            }
                        }
                    }, 100)
                }, 500);
            }
        }

        var window_onmouseup = function(e) {
            mouse.mouseup(e);
            controller.clearSelection();
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

        /* Setup some HTML hooks */
        var wrapper = controller.getWrapper();
        var importProto = $('#import_prototxt');
        var importError = $('#import_error');
        var importArea = $('#import_area');
        var importOK = $('#import_ok');
        var importCancel = $('#import_cancel');

        importCancel.click(function() {
            wrapper.css('z-index', 1);
            importProto.toggle('fast');
        });

        importOK.click(function() {
            try {
                var parser = new ProtoBuf();
                var net = parser.compile(importArea.val());
                net = parser.upgrade(net);
                createNet(net);
                importCancel.click();
            }
            catch (err) {
                importError.stop().toggle('slow');
                importArea.stop().animate({height: '-=30'}, 0);
                setTimeout(function(){
                    importArea.stop().animate({height: '+=30'}, 0);
                    importError.stop().toggle('slow');
                }, 10000);
            }
        });
    };

    initialize();
});
