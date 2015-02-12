define(['jquery', 'app/controller'], function ($, controller) {
    "use strict";

    if (!Date.now) {
        Date.now = function() { return new Date().getTime(); }
    }

    var MouseHelper = function() {

        if ( MouseHelper.prototype._instance ) {
            return MouseHelper.prototype._instance;
        }
        
        MouseHelper.prototype._instance = this;

        this._doubleClick = false;
        this._doubleClick_last = 0;
        this._up_last = 0;
        this._click_last = 0;
        this._down = false;

        this._canvas_onclick = function(e) {
            MouseHelper()._click_last = e.timeStamp;
        };

        this._canvas_onmousedown = function(e) {
            if (e.timeStamp - MouseHelper()._doubleClick_last < 300) {
                MouseHelper()._doubleClick = true;
            } else {
                MouseHelper()._doubleClick = false;
            }
            MouseHelper()._doubleClick_last = e.timeStamp;

            controller.clearSelection();
        };

        this._window_onmousedown = function(e) {
            MouseHelper()._down = true;
        }

        this._window_onmouseup = function(e) {
            MouseHelper()._down = false;
            MouseHelper()._up_last = e.timeStamp;
            controller.clearSelection();
        }

        this.isDoubleClick = function() {
            if ((this._doubleClick_last < this._up_last && Date.now() - this._doubleClick_last < 250) ||
                (Date.now() - this._click_last < 250)) {

                this._doubleClick = true;
            }
            return (this._doubleClick && Date.now() - this._doubleClick_last < 500);
        }

        this.isDown = function() {
            return this._down;
        }

        this.initialize = function() {
            var canvas = controller.getCanvas();
            canvas.click(this._canvas_onclick);
            canvas.mousedown(this._canvas_onmousedown);

            $(window).mousedown(this._window_onmousedown);
            $(window).mouseup(this._window_onmouseup);
        }
    };

    return new MouseHelper();
});
