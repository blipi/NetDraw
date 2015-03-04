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

        this._down_last = 0;
        this._up_last = 0;
        this._click_last = 0;
        this._doubleClick_obj = null;
        this._down = false;

        this.isDoubleClick = function(obj) {
            var dblClick = false;
            
            if (this._up_last - this._down_last > 200) {
                // Clear drag (mousedown/mouseup won't work due to internal implementations)
                this._up_last = 0;
                this._down_last = 0;
            }
            else {
                dblClick = (Date.now() - this._click_last) < 500 && this._doubleClick_obj == obj;
                this._doubleClick_obj = obj;

                if (dblClick) {
                    this._doubleClick_obj = null;
                }
            }

            return dblClick;
        }

        this.isDown = function() {
            return this._down;
        }

        this.mousedown = function(e) {
            MouseHelper()._down = true;
            MouseHelper()._down_last = Date.now();
        }

        this.mouseup = function(e) {
            MouseHelper()._down = false;
            MouseHelper()._up_last = Date.now();
        }

        this.click = function(e) {
            MouseHelper()._down = false;
            MouseHelper()._click_last = Date.now();
        }
    };

    return new MouseHelper();
});
