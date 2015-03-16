var Line = function (DOMElement, params) {
    this._DOMElement = DOMElement;

    this._setCSS = function (what, value) {
        this._DOMElement.css(what, value);
    };

    this._setAngle = function () {
        if ('_x1' in this && '_y1' in this && '_x2' in this && '_y2' in this) {
            var angle = Math.atan2(this._y2 - this._y1, this._x2 - this._x1) * 180.0 / Math.PI;
            this._setCSS('transform-origin', '0 0');
            this._setCSS('transform', 'rotate(' + angle + 'deg)');
            this._setCSS('width', Math.sqrt(Math.pow(this._x1 - this._x2, 2) + Math.pow(this._y1 - this._y2, 2)));
        }
    };

    this.remove = function () {
        this._DOMElement.remove();
    };

    for (var e in params) {
        this[e] = params[e];
    }
};

Line.prototype = {
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

    get x1() { return this._x1; },
    get y1() { return this._y1; },
    get x2() { return this._x2; },
    get y2() { return this._y2; },
};
