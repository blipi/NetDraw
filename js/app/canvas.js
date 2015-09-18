define(['require', 'jquery', 'app/top', 'app/bottom', 'app/line', 'protobuf.2'], function (require, $, top, bottom, line, pb) {

    require('caffeconstants');

    var controller = null;
    var layer = null;
    var mouse = null;
    var parser = new ProtoBuf();

    var TYPE = {
        RECT: {value: 0, name: 'rect'},
        TEXT: {value: 1, name: 'text'},
        ARC: {value: 2, name: 'arc'},
        LINE: {value: 3, name: 'line'},
    };

    var BoundingBox = function (_x, _y, _w, _h) {
        return {x: _x, y: _y, w: _w, h: _h};
    };

    var Layer = function (DOMElement, type, params) {
        this._DOMElement = DOMElement;
        this._DOMWrapper = DOMElement.children('.wrapper');
        this._DOMNoRotate = DOMElement.children('.no-rotate');
        this._type = type;

        this.getDOM = function () {
            return this._DOMWrapper;
        };

        this.getStaticDOM = function () {
            return this._DOMNoRotate;
        };

        this.prepareMenu = function () {
            this._DOMWrapper.children('button').show();
        };

        this._setCSS = function (what, value) {
            this._DOMElement.css(what, value);
        };

        this.fixTo = function (to) {
            this._DOMElement.draggable({
                containment: Canvas._DOMcanvas,
            });
        };

        this.boundingBox = function () {
            return BoundingBox(this.x, this.y, this.width, this.height);
        };

        this.rotationBox = function () {
            var bb = this.boundingBox();
            if (controller.verticalDrawing()) {
                var tmp = bb.w;
                bb.w = bb.h;
                bb.h = tmp;
            }

            return bb;
        };

        this.hide = function () {
            var fromRelationships = controller.getMappingsFor('from', this);
            var toRelationships = controller.getMappingsFor('to', this);

            var n = fromRelationships.length;
            var i = 0;
            var line = null;

            for (; i < n; ++i) {
                line = fromRelationships[i];

                // TODO: We should hide this top if no other relationship starts from here
                // line.top.hide();
                // line.bottom.hide();
                line._DOMElement.hide();
            }

            n = toRelationships.length;
            i = 0;

            for (; i < n; ++i) {
                line = toRelationships[i];

                // TODO: We should hide this top if no other relationship starts from here
                // line.top.hide();
                // line.bottom.hide();
                line._DOMElement.hide();
            }

            this.visible = false;
        };

        this.move = function (x, y) {
            if (typeof(x) !== 'undefined') {
                this.x = x;
            }
            if (typeof(y) !== 'undefined') {
                this.y = y;
            }

            var fromRelationships = controller.getMappingsFor('from', this);
            var toRelationships = controller.getMappingsFor('to', this);

            var n = fromRelationships.length;
            var i = 0;
            var line = null;

            for (; i < n; ++i) {
                line = fromRelationships[i];
                var coords = controller.screenCoordinates(line.top);
                line.x1 = coords.x;
                line.y1 = coords.y;
            }

            n = toRelationships.length;
            i = 0;

            for (; i < n; ++i) {
                line = toRelationships[i];
                var coords = controller.screenCoordinates(line.bottom);
                line.x2 = coords.x;
                line.y2 = coords.y;
            }
        };

        this.createTop = function (name) {
            return top.create(this, name);
        };

        this.createBottom = function () {
            bottom.create(this);
        };

        this.remove = function () {
            if (this.node.func == 'top') {
                top.remove(this);
            } else if (this.node.func == 'bottom') {
                bottom.remove(this);
            } else {
                layer.remove(this);
            }
        };

        for (var e in params) {
            this[e] = params[e];
        }
    };

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
            } else {
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

        set text(t) {
            if (typeof(t) === 'string') {
                this._DOMWrapper.children('span').html(t);
            }
        },

        set textX(x) {
            this._DOMWrapper.children('span').css('left', x);
        },

        // Click and all callbacks
        set click(f) {
            this._DOMElement.unbind('click');
            this._DOMElement.click(function (e) {
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mousedown(f) {
            this._DOMElement.unbind('mousedown');
            this._DOMElement.mousedown(function (e) {
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mouseup(f) {
            this._DOMElement.unbind('mouseup');
            this._DOMElement.mouseup(function (e) {
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        // Click and all callbacks
        set mouseout(f) {
            this._DOMElement.unbind('mouseout');
            this._DOMElement.mouseout(function (e) {
                f.call(Canvas(), Canvas().findLayer($(this).attr('id')), e);
            });
        },

        set dragstart(f) {
            this._dragstart = f;

            this._DOMElement.unbind('dragstart');
            this._DOMElement.on('dragstart', function (event, ui) {
                var canvas = Canvas();
                var layer = canvas.findLayer($(this).attr('id'));

                layer._dragstart.call(canvas, layer, event);
            });
        },

        set drag(f) {
            this._drag = f;

            this._DOMElement.unbind('drag');
            this._DOMElement.on('drag', function (event, ui) {
                if (ui && ui.helper && !$(this).hasClass('ui-draggable-disabled')) {
                    var canvas = Canvas();
                    var layer = canvas.findLayer($(this).attr('id'));

                    layer._drag.call(canvas, layer, event);
                }
            });
        },

        set dragstop(f) {
            this._dragstop = f;

            this._DOMElement.unbind('dragstop');
            this._DOMElement.on('dragstop', function (event, ui) {
                var canvas = Canvas();
                var layer = canvas.findLayer($(this).attr('id'));

                mouse.mouseup(event);
                layer._dragstop.call(canvas, layer, event);
            });
        },

        // ----------------------------- //
        //          GETTERS              //
        // ----------------------------- //
        get x() { return controller.screenCoordinates(this._DOMElement).x; },
        get y() { return controller.screenCoordinates(this._DOMElement).y; },
        get width() { return parseInt(this._DOMElement.css('width')); },
        get height() { return parseInt(this._DOMElement.css('height')); },
        get text() { return this._DOMWrapper.children('span').html(); },

        // Special cases
        get dragstart() { return this._dragstart; }
    };

    var Canvas = function () {

        if (Canvas.prototype._instance) {
            return Canvas.prototype._instance;
        }

        Canvas.prototype._instance = this;

        this.initialize = function () {
            controller = require('app/controller');
            layer = require('app/layer');
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
        this.scaleCanvas = function (params) { throw 'Not implemented'; };
        // Not implemented
        this.restoreCanvas = function (params) { throw 'Not implemented'; };
        // Not implemented
        this.setLayer = function (params) { throw 'Not implemented'; };
        // Not implemented
        this.drawPolygon = function (params) { throw 'Not implemented'; };

        // Wrap JQuery calls
        this.css = function () {
            return this._DOMcanvas.css.apply(this._DOMcanvas, arguments);
        };
        this.attr = function () {
            return this._DOMcanvas.attr.apply(this._DOMcanvas, arguments);
        };
        this.click = function (f) {
            return this._DOMcanvas.click(function (e) {
                f.call(Canvas()._DOMcanvas, e);
            });
        };
        this.mousedown = function (f) {
            return this._DOMcanvas.mousedown(function (e) {
                f.call(Canvas()._DOMcanvas, e);
            });
        };
        this.mousemove = function (f) {
            return this._DOMcanvas.mousemove(function (e) {
                f.call(Canvas()._DOMcanvas, e);
            });
        };
        this.mouseout = function (f) {
            return this._DOMcanvas.mouseout(function (e) {
                f.call(Canvas()._DOMcanvas, e);
            });
        };
        this.mouseup = function (f) {
            return this._DOMcanvas.mouseup(function (e) {
                f.call(Canvas()._DOMcanvas, e);
            });
        };

        this._changePhase = function (phase) {
            throw 'DEPRECATED';
        };

        // Return layers array
        this.getLayers = function () {
            return this.layers;
        };

        this.getMainLayers = function () {
            var layers = this.getLayers();
            var mainLayers = [];

            // Find a layer with no bottom (that is, an initial layer)
            for (var i = 0, len = layers.length; i < len; ++i) {
                var layer = layers[i];

                // Skip non deletable layers, that is, menu items
                if (!ValidPhase(layer.phase)) {
                    continue;
                }

                mainLayers.push(layer);
            }

            return mainLayers;
        };

        // Return a layer
        this.getLayer = function (idx) {
            var layers = this.getLayers();

            if (idx >= 0) {
                return layers[idx];
            }

            return layers[layers.length + idx];
        };

        // Find a layer
        this.findLayer = function (id) {
            var layers = this.getLayers();

            for (var i in layers) {
                if (layers[i]._DOMElement.attr('id') == id) {
                    return layers[i];
                }
            }

            return null;
        };

        // Find a layer
        this.findLayerByName = function (name) {
            var layers = this.getMainLayers();

            for (var i in layers) {
                if (layers[i].node.params.name.value == name) {
                    return layers[i];
                }
            }

            return null;
        };

        // Move a layer
        this.bringToFront = function (layer) {
            this.max = typeof(this.max) === 'undefined' ? 3 : this.max;
            var current = parseInt(layer._DOMElement.css('z-index'));

            current = isNaN(current) ? 0 : current;

            if (current < this.max) {
                layer._DOMElement.css('z-index', this.max + 1);
                this.max += 1;
            }
        };

        this.removeLayer = function (layer) {
            // Get layers
            var layers = this.getLayers();

            // Remove from DOM
            layer._DOMElement.remove();

            for (var i = 0, len = layers.length; i < len; ++i) {
                if (layers[i].node.id == layer.node.id) {
                    layers.splice(i, 1);
                    break;
                }
            }
        };

        this.removeAllLayers = function () {
            var layers = this.getLayers();

            var start = 0;
            while (layers.length > start) {
                if (!ValidPhase(layers[start].phase)) {
                    ++start;
                    continue;
                }

                layers[start].remove();
            }
        };

        // Animates a layers
        this.animateLayer = function (layer, params, speed, type) {
            if ('y' in params) {
                params.top = params.y;
            }
            speed = typeof(speed) === 'undefined' ? 'medium' : speed;
            type = typeof(type) === 'undefined' ? 'swing' : type;

            layer._DOMElement.animate(params);
        };

        this.getProto = function () {
            var parser = new ProtoBuf();
            var queue = [];
            var parsed = [];
            var done = [];
            var proto = '';

            var getFalseName = function (layer) {
                return layer.node.params.name.value + '$$' + layer.phase;
            };

            var follow = function (layer) {
                // Check if all our bottoms are already parsed, if not add to queue again
                var toRelationships = controller.getMappingsFor('to', layer);
                for (var i = 0, len = toRelationships.length; i < len; ++i) {
                    var fromLayer = toRelationships[i].from;

                    if ($.inArray(getFalseName(fromLayer), done) < 0) {
                        queue.push(layer);
                        return;
                    }
                }

                // Add text to prototxt
                var params = parser.decompile(layer.node.params);
                params = 'layer {\n' + params + '}\n';
                proto += params;

                // Add tops to queue
                var fromRelationships = controller.getMappingsFor('from', layer);
                for (var i = 0, len = fromRelationships.length; i < len; ++i) {
                    var toLayer = fromRelationships[i].to;

                    var layerName = getFalseName(toLayer);
                    if ($.inArray(layerName, parsed) < 0) {
                        queue.push(toLayer);
                        parsed.push(layerName);
                    }
                }

                // Done with this layer, it has been added to prototxt
                done.push(getFalseName(layer));
            };

            // Get DAG components (V, E)
            var layers = this.getMainLayers();
            var V = [];
            var E = controller.getDAG();

            // Setup V
            for (var i = 0, len = layers.length; i < len; ++i) {
                V.push(layers[i].node.dagNODE);
            }

            // Call tarjan algorithm
            var strongDAG = tarjan(V, E);
            // Every entry on the array must be an array of size 1!
            for (var i = 0, len = strongDAG.length; i < len; ++i) {
                if (strongDAG[i].length > 1) {
                    // We must reset all dagNODE
                    for (var j = 0, end = V.length; j < end; ++j) {
                        V[j].reset();
                    }

                    return false;
                }
            }

            // Find a layer with no bottom (that is, an initial layer)
            for (var i = 0, len = layers.length; i < len; ++i) {
                var layer = layers[i];

                var toRelationships = controller.getMappingsFor('to', layer);
                if (toRelationships.length === 0) {
                    queue.push(layer);
                    parsed.push(getFalseName(layer));
                }
            }

            // Until queue is empty, follow queue layer
            while (queue.length) {
                follow(queue.shift());
            }

            console.log(proto);

            return proto;
        };

        // Draws a rectangle
        this.drawBoxInto = function (into, params) {
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
        };

        // Draws a rectangle
        this.createLayer = function (params) {
            return this.createLayerInto(this._DOMcanvas, params);
        };

        // Draws a rectangle
        this.createLayerInto = function (into, params, containment, className) {
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
                if (!('dragstart' in params)) { params.dragstart = function () {}; }
                if (!('drag' in params)) { params.drag = function () {}; }
                if (!('dragstop' in params)) { params.dragstop = function () {}; }
            }

            if (params.node.id) {
                params.node.dagNODE = new Node(params.node.id);
            }

            // Add phase
            params.phase = controller.getPhase();

            var layer = new Layer(element, TYPE.RECT, params);
            this.getLayers().push(layer);

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
        };

        // Draws a text element
        this.createLayerText = function (layer, params) {
            var element = $('<span>')
                .html(params.text)
                .css('left', params.x)
                .appendTo(layer.getDOM());

            if (params.click) {
                element.click(params.click);
            }

            return this;
        };

        this.drawLine = function (params) {
            var element = $('<hr>')
                .appendTo(Canvas()._DOMcanvas);

            return new Line(element, params);
        };

        this.createLayerArc = function (into, params, className) {
            var element = $('<div class="arc-' + className + '">')
                .css({left: params.x, top: params.y})
                .appendTo(into.getStaticDOM())
                .data('name', params.name)
                .data('parent', into._DOMElement.attr('id'));

            // Provide some enclosure
            function setupCallbacks(params, node) {
                var arcCallback = function (e, me, f) {
                    var id = me.data('parent');
                    f(Canvas().findLayer(id), me, e);
                };

                if (params.click) {
                    node.click(function (e) { arcCallback(e, node, params.click); });
                }
                if (params.dblclick) {
                    node.dblclick(function (e) { arcCallback(e, node, params.dblclick); });
                }
                if (params.mousedown) {
                    node.mousedown(function (e) { arcCallback(e, node, params.mousedown); });
                }
            }
            setupCallbacks(params, element);

            return element;
        };
    };

    return new Canvas();
});
