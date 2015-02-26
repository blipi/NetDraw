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
                var net = parser.compile($(this).val());
                net = parser.upgrade(net);
                Menu.createNet(net);
            }
            catch (err) {
                importError.toggle('slow');
                importArea.animate({height: '-=30'}, 0);
                setTimeout(function(){
                    importArea.animate({height: '+=30'}, 0);
                    importError.toggle('slow');
                }, 10000);
            }
        });
    };

    initialize();
});
