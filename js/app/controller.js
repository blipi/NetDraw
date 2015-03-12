define(function (require) {

    var $ = require('jquery');
    var canvasObj = require('app/canvas');

    require('caffeconstants');
    require('tarjan');
    require('jcanvas');

    var Orientation = {
        HORIZONTAL: 0,
        VERTICAL: 1
    };

    var Controller = function () {

        if (Controller.prototype._instance) {
            return Controller.prototype._instance;
        }

        Controller.prototype._instance = this;

        this._selection = null;
        this._drawingLine = null;
        this._initialNode = null;
        this._callCount = 0;

        this._autoAdjustArcs = false;
        this._moveArcs = false;
        this._freeDrawing = false;

        this._drawOrientation = Orientation.HORIZONTAL;

        this._mappings = {
            from: {},
            to: {}
        };

        this._DAG = {};
        this._DAG[Phase.TEST] = {};
        this._DAG[Phase.TRAIN] = {};

        this._phase = Phase.MENU;

        this.getPhase = function () {
            return this._phase;
        }

        this.setPhase = function (phase) {
            canvasObj._changePhase(phase);
            this._phase = phase;
        }

        this.autoAdjustArcs = function () {
            return this._autoAdjustArcs;
        };

        this.canMoveArcs = function () {
            return this._moveArcs;
        };

        this.freeDrawing = function () {
            return this._freeDrawing;
        };

        this.verticalDrawing = function () {
            return this._drawOrientation == Orientation.VERTICAL;
        };

        this.getCanvas = function () {
            return canvasObj;
        };

        this.getDOMCanvas = function () {
            return $('#canvas');
        };

        this.getWrapper = function () {
            return $('#wrapper');
        };

        this.getInitialNode = function () {
            ++this._callCount;

            if (this._callCount >= 2) {
                this._callCount = 0;

                var tmp = this._initialNode;
                this._initialNode = null;
                return tmp;
            }

            return null;
        };

        this.setInitialNode = function (i) {
            this._initialNode = i;
            this._callCount = 0;
        };

        this.getSelection = function () {
            return this._selection;
        };

        this.setSelection = function (selection) {
            this.clearSelection();
            this._selection = selection;
            this._selection._DOMElement.addClass('selected');
        };

        this.clearSelection = function () {
            if (this._selection) {
                this._selection._DOMElement.removeClass('selected');
                this._selection = null;
            }
        };

        this.getDrawingLine = function () {
            return this._drawingLine;
        };

        this.setDrawingLine = function (drawingLine) {
            this._drawingLine = drawingLine;
        };

        this.clearDrawingLine = function () {
            this._drawingLine = null;
        };

        this.getDAG = function () {
            return this._DAG[this._phase];
        }

        this.getMappings = function () {
            return this._mappings;
        };

        this.getMappingsFor = function (origin, layer) {
            return this._mappings[origin][layer.node.id];
        };

        this.createMapping = function (line) {
            var from = line.node.from;
            var to = line.node.to;

            this._mappings.from[from.node.id].push(line);
            this._mappings.to[to.node.id].push(line);

            var DAG = this.getDAG();
            if (!(from.node.id in DAG)) {
                DAG[from.node.id] = [];
            }

            for (var i = 0, len = DAG[from.node.id].length; i < len; ++i) {
                if (DAG[from.node.id][i].id == to.node.id) {
                    // Duplicating a connection
                    return false;
                }
            }

            DAG[from.node.id].push(to.node.dagNODE);

            return true;
        };

        this.removeMapping = function (origin, id, line) {
            var index = this._mappings[origin][id].indexOf(line);
            if (index >= 0) {
                this._mappings[origin][id].splice(index, 1);
                return true;
            }

            return false;
        };

        this.removeBothMappings = function (line) {
            var from = line.node.from;
            var to = line.node.to;

            this.removeMapping('from', from.node.id, line);
            this.removeMapping('to', to.node.id, line);

            var DAG = this.getDAG();
            var found = false;
            for (var i = 0, len = DAG[from.node.id].length; i < len; ++i) {
                if (DAG[from.node.id][i].id == to.node.id) {
                    found = true;
                    break;
                }
            }

            if (found) {
                DAG[from.node.id].splice(i, 1);
            }

            return found;
        };

        this.removeLayerMappings = function (layer) {
            this._mappings.from[layer.node.id] = [];
            this._mappings.to[layer.node.id] = [];
        };

        this.createLayerMappings = function (layer) {
            this.removeLayerMappings(layer);
        };
    };

    return new Controller();
});
