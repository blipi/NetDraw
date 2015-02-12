define(['require', 'jquery', 'app/layer'], function(require, $, layer){

    var controller = null;
    var mouse = null;

    var TYPE = {
        RECT : {value: 0, name: "rect"},
        TEXT : {value: 1, name: "text"},
        ARC : {value: 2, name: "arc"},
        LINE : {value: 3, name: "line"},
    };

    var Layer = function(DOMElement, type, params) {
        this._DOMElement = DOMElement;
        this._type = type;

        this._setCSS = function(what, value) {
            this._DOMElement.css(what, value);
        }

        this._setAngle = function() {
            if ('_x1' in this && '_y1' in this && '_x2' in this && '_y2' in this) {
                var angle = Math.atan2(this._y2 - this._y1, this._x2 - this._x1) * 180 / Math.PI;
                this._setCSS('transform-origin', '0 0' );
                this._setCSS('transform', 'rotate(' + angle + 'deg)' );
                this._setCSS('width', Math.sqrt(Math.pow(this._x1 - this._x2, 2) + Math.pow(this._y1 - this._y2, 2)));
            }
        }

        for (e in params) {
            this[e] = params[e];
        }
    }

    Layer.prototype = {
        set x(ex) {
            this._setCSS('left', ex);
            this._x = ex;
        },

        set y(ey) {
            this._setCSS('top', ey);
            this._y = ey;
        },

        set width(w) {
            this._setCSS('width', w);
            this._width = w;
        },

        set height(h) {
            this._setCSS('height', h);
            this._height = h;
        },

        set margin(m) {
            this._setCSS('margin', m);
            this._margin = m;
        },

        set fillStyle(f) {
            if (this._type == TYPE.TEXT) {
                this._setCSS('color', f);
            }
            else {
                this._setCSS('background', f);
            }

            this._background = f;
        },

        set strokeStyle(s) {
            this._setCSS('border', this.strokeWidth + ' ' + s);
            this._strokeStyle = s;
        },

        set cornerRadius(c) {
            this._setCSS('border-radius', c);
            this._cornerRadius = c;
        },

        set visible(v) {
            this._setCSS('visibility', v ? 'visible' : 'hidden');
            this._visible = v;
        },

        // Text
        set text(t) {
            this._DOMElement.html(t);
            this._text = t;
        },

        // Lines
        set x1(ex) {
            this._setCSS('left', ex);
            this._x1 = ex;
            this._setAngle();
        },

        set y1(ey) {
            this._setCSS('top', ey);
            this._y1 = ey;
            this._setAngle();
        },

        set x2(ex) {
            this._x2 = ex;
            this._setAngle();
        },

        set y2(ey) {
            this._y2 = ey;
            this._setAngle();
        },

        // Click and all callbacks
        set click(f) {
            this._DOMElement.unbind("click");
            this._DOMElement.click(function(e){
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mousedown(f) {
            this._DOMElement.unbind("mousedown");
            this._DOMElement.mousedown(function(e){
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mouseup(f) {
            this._DOMElement.unbind("mouseup");
            this._DOMElement.mouseup(function(e){
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mouseout(f) {
            this._DOMElement.unbind("mouseout");
            this._DOMElement.mouseout(function(e){
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        set dragstart(f) {
            this._dragstart = f;
            
            this._DOMElement.unbind("dragstart");
            this._DOMElement.on("dragstart", function(event, ui){
                var canvas = Canvas();
                var layers = canvas.getLayers();
                var layer = canvas.findLayer($(this).attr('id'));
                var dragGroups = layer.dragGroups;

                var toMove = [];

                for (i in layers) {
                    for (k in dragGroups) {
                        if ($.inArray(dragGroups[k], layers[i].dragGroups) >= 0) {
                            toMove.push(layers[i]);
                            break;
                        }
                    }
                }

                canvas.moving = toMove;

                layer._dragstart.call(canvas, layer, event);
            })
        },

        set drag(f) {
            this._drag = f;

            this._DOMElement.unbind("drag");
            this._DOMElement.on("drag", function(event, ui){
                if (ui && ui.helper && !$(this).hasClass('ui-draggable-disabled')) {
                    var canvas = Canvas();
                    var layer = canvas.findLayer($(this).attr('id'));
                
                    var x = parseInt(ui.helper.css('left'));
                    var y = parseInt(ui.helper.css('top'));

                    for (i in canvas.moving) {
                        var offsetTop = layer.y - canvas.moving[i].y;
                        var offsetleft = layer.x - canvas.moving[i].x;

                        canvas.moving[i]._DOMElement.css({
                            'top': y - offsetTop,
                            'left': x - offsetleft
                        })
                    }

                    layer._x = x;
                    layer._y = y;

                    layer._drag.call(canvas, layer, event);
                }
            })
        },

        set dragstop(f) {
            this._dragstop = f;

            this._DOMElement.unbind("dragstop");
            this._DOMElement.on("dragstop", function(event, ui){
                var canvas = Canvas();
                var layer = canvas.findLayer($(this).attr('id'));
                mouse._window_onmouseup(event);
                layer._dragstop.call(canvas, layer, event);
            });
        },

        ///////////////////////////////////
        //          GETTERS              //
        ///////////////////////////////////
        get windowX() { return this._DOMElement.offset().left - 15 }, // TODO: Magic numbers
        get windowY() { return this._DOMElement.offset().top + Canvas()._wrapper.scrollTop() },
        get x() { return this._x; },
        get y() { return this._y; },
        get x1() { return this._x1; },
        get y1() { return this._y1; },
        get x2() { return this._x2; },
        get y2() { return this._y2; },
        get width() { return this._width; },
        get height() { return this._height; },
        get text() { return this._DOMElement.html(); },

        // Special cases
        get dragstart() { return this._dragstart; }
    }

    var Canvas = function() {

        if ( Canvas.prototype._instance ) {
            return Canvas.prototype._instance;
        }
        
        Canvas.prototype._instance = this;

        var _window_onresize = function(e) {
            w_width = Canvas()._wrapper.css('width');
            w_height = Canvas()._wrapper.css('height');

            c_width = Canvas()._canvas.css('width');
            c_height = Canvas()._canvas.css('height');

            console.log("Wrapper [" + w_width + "," + w_height + "]");
            console.log("Canvas  [" + c_width + "," + c_height + "]");

            var ratio_w = w_width / c_width;
            var ratio_h = w_height / c_height;

            Canvas()._canvas.attr('width', w_width);
            Canvas()._canvas.attr('height', w_height);

            Canvas()._canvas.setLayer('scaling', {
                scaleX: ratio_w, scaleY: ratio_h
            })
            .drawLayers();
        }
   
        this.initialize = function() {
            controller = require('app/controller');
            mouse = require('utils/mousehelper');

            this._wrapper = controller.getWrapper();
            this._DOMcanvas = controller.getDOMCanvas();
            this._canvas = controller.getCanvas();
            
        };

        // ******************************************************** //
        // When not using HTML5 Canvas element this class will act
        // as the canvas element
        // ******************************************************** //

        this.layers = [];
        this.moving = [];
        this._id = 0;

        // Do nothing, css already handles this
        this.scaleCanvas = function(params) { return this; };
        // Not implemented
        this.restoreCanvas = function(params) { return this; };
        // Not implemented
        this.drawLayers = function(params) { return this; };
        // Not implemented
        this.setLayer = function(params) { return this; };
        // Not implemented
        this.drawPolygon = function(params) { return this; }

        // Wrap JQuery calls
        this.css = function() {
            return this._DOMcanvas.css.apply(this._DOMcanvas, arguments);
        }
        this.attr = function() {
            return this._DOMcanvas.attr.apply(this._DOMcanvas, arguments);
        }
        this.click = function(f) {
            return this._DOMcanvas.click(function(e){
                f.call(Canvas()._DOMcanvas, e);
            });
        }
        this.mousedown = function(f) {
            return this._DOMcanvas.mousedown(function(e){
                f.call(Canvas()._DOMcanvas, e);
            });
        }
        this.mousemove = function(f) {
            return this._DOMcanvas.mousemove(function(e){
                f.call(Canvas()._DOMcanvas, e);
            });
        }
        this.mouseout = function(f) {
            return this._DOMcanvas.mouseout(function(e){
                f.call(Canvas()._DOMcanvas, e);
            });
        }
        this.mouseup = function(f) {
            return this._DOMcanvas.mouseup(function(e){
                f.call(Canvas()._DOMcanvas, e);
            });
        }

        // Return layers array
        this.getLayers = function() {
            return this.layers;
        }

        // Return a layer
        this.getLayer = function(idx) {
            if (idx >= 0) {
                return this.layers[idx];
            }

            return this.layers[this.layers.length + idx];
        }

        // Find a layer
        this.findLayer = function(id) {
            for (i in this.layers) {
                if (this.layers[i]._DOMElement.attr('id') == id) {
                    return this.layers[i];
                }
            }

            return null;
        }

        // Move a layer
        this.bringToFront = function(layer) {
            var max = 0;
            for (i in this.layers) {
                var e = this.layers[i]._DOMElement;
                var m = parseInt(e.css('z-index'));
                if (m > max) {
                    max = m;
                }
            }

            layer._DOMElement.css('z-index', max + 1);
        }

        this.removeLayer = function(layer) {
            layer._DOMElement.remove();

            for (i in this.layers) {
                if (this.layers[i] == layer) {
                    this.layers.splice(i, 1);
                    break;
                }
            }
        }

        // Animates a layers
        this.animateLayer = function(layer, params, speed, type) {
            if ("y" in params) params.top = params.y;
            speed = typeof(speed) === 'undefined' ? 'medium' : speed;
            type = typeof(type) === 'undefined' ? 'swing' : type;

            layer._DOMElement.animate(params);
        }

        // Draws a rectangle
        this.drawRect = function(params) {
            return this.drawRectInto(this._DOMcanvas, params, 'absolute');
        }


        // Draws a rectangle
        this.drawRectInto = function(into, params, pos) {
            if (!("x" in params && "y" in params && "width" in params && "height" in params)) {
                return null;
            }

            pos = typeof(pos) === 'undefined' ? 'relative' : pos;

            var element = $('<div>');
            element.attr({
                id: 'layer_' + Canvas()._id
            })
            .css({
                position: pos,
                'z-index': 1,
                border: parseInt(params.strokeWidth) + 'px ' + params.strokeStyle + ' solid',
            })
            .prependTo(into);

            if (params.draggable) {
                // Force a drag and dragstart to be present
                if (!('dragstart' in params)) params.dragstart = function(){};
                if (!('drag' in params)) params.drag = function(){};
                if (!('dragstop' in params)) params.dragstop = function(){};
            }

            this.layers.push(new Layer(element, TYPE.RECT, params));
            ++this._id;

            var container = into;
            if (params.draggable) {
                if (into == this._DOMcanvas) {
                    container = $('#wrapper');
                }

                element.draggable({
                    scroll: true, scrollSensitivity: 50, scrollSpeed: 5,
                    containment: container,
                });
            }

            return this;
        }

        // Draws a text element
        this.drawTextInto = function(into, params) {
            if (!("x" in params && "y" in params)) {
                return null;
            }

            var element = $('<label>');
            element.attr({
                id: 'layer_' + Canvas()._id
            })
            .css({
                position: 'relative',
                'font-size': params.fontSize,
                'font-family': params.fontFamily,
                border: params.strokeWidth + ' ' + params.strokeStyle,
                'border-radius': params.cornerRadius
            })
            .appendTo(into._DOMElement);

            this.layers.push(new Layer(element, TYPE.TEXT, params));
            ++this._id;

            return this;
        }

        this.drawLine = function(params) {
            var element = $('<hr>');
            element.attr({
                id: 'layer_' + Canvas()._id
            })
            .css({
                position: 'absolute',
                'margin': '0px',
                'margin-left': '15px',
                border: parseInt(params.strokeWidth) + 'px ' + params.strokeStyle + ' solid',
            })
            .appendTo(Canvas()._DOMcanvas);

            this.layers.push(new Layer(element, TYPE.LINE, params));
            ++this._id;

            return this;
        }

        this.drawArc = function(into, params) {
            params.cornerRadius = params.radius*2;
            params.width = params.radius*2;
            params.height = params.radius*2;
            params.margin = -10;
            return this.drawRectInto(into._DOMElement, params, 'absolute');
        }
    };

    return new Canvas();
});
