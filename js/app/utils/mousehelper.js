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

        this.isDoubleClick = function() {
            if (Date.now() - this._click_last < 500) {
                this._doubleClick = true;
            }

            return this._doubleClick;
        }

        this.isDown = function() {
            return this._down;
        }

        this.mousedown = function(e) {
            if (Date.now() - MouseHelper()._doubleClick_last < 300) {
                MouseHelper()._doubleClick = true;
            } else {
                MouseHelper()._doubleClick = false;
            }
            
            MouseHelper()._doubleClick_last = Date.now();
            MouseHelper()._down = true;
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
