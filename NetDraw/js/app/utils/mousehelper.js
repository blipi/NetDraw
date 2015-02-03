define(['jquery', 'app/controller'], function ($, controller) {
    "use strict";

    var MouseHelper = function() {

        if ( MouseHelper.prototype._instance ) {
            return MouseHelper.prototype._instance;
        }
        
        MouseHelper.prototype._instance = this;

        this._doubleClick = false;
        this._doubleClick_last = 0;
        this._down = false;

        this._canvas_onclick = function(e) {
            var selection = controller.getSelection();
            if (selection != null) {
                selection.strokeStyle = "#000";
                controller.clearSelection();
            }
        };

        this._canvas_onmousedown = function(e) {
            if (e.timeStamp - MouseHelper()._doubleClick_last < 200) {
                MouseHelper()._doubleClick = true;
            } else {
                MouseHelper()._doubleClick = false;
            }
            MouseHelper()._doubleClick_last = e.timeStamp;

            var selection = controller.getSelection();
            if (selection != null) {
                selection.strokeStyle = "#000";
                controller.clearSelection();
            }
        };

        this._window_onmousedown = function(e) {
            MouseHelper()._down = true;
        }

        this._window_onmouseup = function(e) {
            MouseHelper()._down = false;
        }

        this.isDoubleClick = function() {
            return this._doubleClick;
        }

        this.isDown = function() {
            return this._down;
        }
    };

    var mouseHelper = new MouseHelper();
    var canvas = controller.getCanvas();
    canvas.click(mouseHelper._canvas_onclick);
    canvas.mousedown(mouseHelper._canvas_onmousedown);

    $(window).mousedown(mouseHelper._window_onmousedown);
    $(window).mouseup(mouseHelper._window_onmouseup);


    return mouseHelper;
});
