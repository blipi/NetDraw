define(['require', 'jquery', 'app/layer'], function(require, $, layer){

    var controller = null;
    var mouse = null;

    var TYPE = {
        RECT : {value: 0, name: "rect"},
        TEXT : {value: 1, name: "text"},
        ARC : {value: 2, name: "arc"},
        LINE : {value: 3, name: "line"},
    };

    var BoundingBox = function(_x, _y, _w, _h) {
        return {x: _x, y: _y, w: _w, h: _h};
    };

    var Layer = function(DOMElement, type, params) {
        this._DOMElement = DOMElement;
        this._DOMWrapper = DOMElement.children('.wrapper');
        this._type = type;

        this.getDOM = function() {
            return this._DOMWrapper;
        }

        this.prepareMenu = function() {
            this._DOMWrapper.children('button').show();
        }

        this._setCSS = function(what, value) {
            this._DOMElement.css(what, value);
        }

        this._setAngle = function() {
            if ('_x1' in this && '_y1' in this && '_x2' in this && '_y2' in this) {
                var angle = Math.atan2(this._y2 - this._y1, this._x2 - this._x1) * 180.0 / Math.PI;
                this._setCSS('transform-origin', '0 0' );
                this._setCSS('transform', 'rotate(' + angle + 'deg)' );
                this._setCSS('width', Math.sqrt(Math.pow(this._x1 - this._x2, 2) + Math.pow(this._y1 - this._y2, 2)));
            }
        }

        this.fixTo = function(to) {
            this._DOMElement.draggable({
                containment: Canvas._DOMcanvas,
            });
        }

        this.boundingBox = function() {
            return BoundingBox(this.x, this.y, this.width, this.height);
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
            this._setCSS('border', this.strokeWidth + 'px solid ' + s);
            this._strokeStyle = s;
        },

        set cornerRadius(c) {
            this._setCSS('border-radius', c);
            this._cornerRadius = c;
        },

        set visible(v) {
            this._setCSS('display', v ? 'block' : 'none');
            this._visible = v;
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

                mouse.mouseup(event);
                layer._dragstop.call(canvas, layer, event);
            });
        },

        ///////////////////////////////////
        //          GETTERS              //
        ///////////////////////////////////
        get rawX() { return this._DOMElement.offset().left + Canvas()._scroll_wrapper.scrollLeft()},
        get rawY() { return this._DOMElement.offset().top + Canvas()._scroll_wrapper.scrollTop() },
        get windowX() { return this._DOMElement.offset().left + Canvas()._scroll_wrapper.scrollLeft() - 155}, // TODO: Magic numbers
        get windowY() { return this._DOMElement.offset().top + Canvas()._scroll_wrapper.scrollTop() },
        get x() { return this._x; },
        get y() { return this._y; },
        get x1() { return this._x1; },
        get y1() { return this._y1; },
        get x2() { return this._x2; },
        get y2() { return this._y2; },
        get width() { 
            if (controller.verticalDrawing()) {
                return parseInt(this._DOMElement.css('height'));
            }
            return parseInt(this._DOMElement.css('width'));
        },
        get height() { 
            if (controller.verticalDrawing()) {
                return parseInt(this._DOMElement.css('width')); 
            }
            return parseInt(this._DOMElement.css('height')); 
        },
        get text() { return this._DOMElement.html(); },

        // Special cases
        get dragstart() { return this._dragstart; }
    }

    var Canvas = function() {

        if ( Canvas.prototype._instance ) {
            return Canvas.prototype._instance;
        }
        
        Canvas.prototype._instance = this;
   
        this.initialize = function() {
            controller = require('app/controller');
            mouse = require('utils/mousehelper');

            this._wrapper = controller.getWrapper();
            this._scroll_wrapper = $('#scroll_wrapper');
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

        // DEPRECATED: TO BE REMOVED SOON
        // Do nothing, css already handles this
        this.scaleCanvas = function(params) { throw "Not implemented"; };
        // Not implemented
        this.restoreCanvas = function(params) { throw "Not implemented"; };
        // Not implemented
        this.setLayer = function(params) { throw "Not implemented"; };
        // Not implemented
        this.drawPolygon = function(params) { throw "Not implemented"; }

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
            this.max = typeof(this.max) === 'undefined' ? 3 : this.max;
            var current = parseInt(layer._DOMElement.css('z-index'));

            current = isNaN(current) ? 0 : current;

            if (current < this.max) {
                layer._DOMElement.css('z-index', this.max + 1);
                this.max += 1;
            }
        }

        this.removeLayer = function(layer) {
            layer._DOMElement.remove();

            for (var i = 0, len = this.layers.length; i < len; ++i) {
                if (this.layers[i] == layer) {
                    this.layers.splice(i, 1);
                    break;
                }
            }
        }

        this.removeAllLayers = function() {
            var start = 0;
            while (this.layers.length - start > 0) {
                if ('deletable' in this.layers[start] &&
                    !this.layers[start].deletable)
                {
                    ++start;
                    continue;
                }

                this.removeLayer(this.layers[start]);
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
        this.drawBoxInto = function(into, params) { 
            var element = $('<div class="' + params.className + '">')
                .attr('id', params.id)
                .css({left: params.x, top: params.y})
                .prependTo(into);

            if (params.click) {
                element.click(params.click);
            }

            if (params.text) {
                element.append($('<p>' + params.text + '</p>'));
            }

            return element;
        }

        // Draws a rectangle
        this.createLayer = function(params) {
            return this.createLayerInto(this._DOMcanvas, params);
        }

        // Draws a rectangle
        this.createLayerInto = function(into, params, containment, className) {     
            containment = typeof(containment) === 'undefined' ? true : containment;
            className = typeof(className) === 'undefined' ? 
                'layer ' + (controller.verticalDrawing() ? 'vertical ' : '') + params.node.name : 
                className;

            var element = $('#layer-sample')
                .clone(true)
                .attr('id', 'layer_' + Canvas()._id)
                .addClass(className)
                .prependTo(into);

            // Delete layer menu id
            element.children('.wrapper')
                .children('.layer-menu')
                    .attr('id', '');

            // Delete show menu id
            element.children('.wrapper')
                .children('button')
                    .attr('id', '');


            if (params.draggable) {
                // Force a drag and dragstart to be present
                if (!('dragstart' in params)) params.dragstart = function(){};
                if (!('drag' in params)) params.drag = function(){};
                if (!('dragstop' in params)) params.dragstop = function(){};
            }

            var layer = new Layer(element, TYPE.RECT, params);
            this.layers.push(layer);

            ++this._id;

            var container = into;
            if (params.draggable) {
                if (!containment) {
                    container = $('#wrapper');
                }

                element.draggable({
                    containment: container,
                });
            }

            if ('text' in params && typeof(params.text) === 'object') {
                return this.createLayerText(layer, params.text);
            }

            return this;
        }

        // Draws a text element
        this.createLayerText = function(layer, params) {
            var element = $('<span>')
                .html(params.text)
                .css('left', params.x)
                .appendTo(layer.getDOM());

            if (params.click) {
                element.click(params.click);
            }

            return this;
        }

        this.drawLine = function(params) {
            var element = $('<hr>');
            element.attr({
                id: 'layer_' + Canvas()._id
            })
            .appendTo(Canvas()._DOMcanvas);

            this.layers.push(new Layer(element, TYPE.LINE, params));
            ++this._id;

            return this;
        }

        this.createLayerArc = function(into, params, className) {
            var element = $('<div class="arc-' + className + '">');
            element
                .attr({
                    id: 'layer_' + Canvas()._id
                })
                .appendTo(into.getDOM());

            if (params.draggable) {
                // Force a drag and dragstart to be present
                if (!('dragstart' in params)) params.dragstart = function(){};
                if (!('drag' in params)) params.drag = function(){};
                if (!('dragstop' in params)) params.dragstop = function(){};
            }

            this.layers.push(new Layer(element, TYPE.ARC, params));
            ++this._id;

            var container = into.getDOM();
            if (params.draggable) {
                element.draggable({
                    containment: container,
                });
            }

            return this;
        }
    };

    return new Canvas();
});
