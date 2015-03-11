
var Node = function (id) {
    this.id = id;

    this.reset = function () {
        delete this.index;
        delete this.lowlink;
        delete this.onstack;
    };
};

function tarjan(V, E) {
    var index = 0;
    var S = [];
    var out = [];

    var strongconnect = function (v) {
        v.index = index;
        v.lowlink = index;
        ++index;
        S.push(v);
        v.onstack = true;

        if (v.id in E) {
            for (var i = 0, len = E[v.id].length; i < len; ++i) {
                var w = E[v.id][i];

                if (!('index' in w)) {
                    strongconnect(w);
                    v.lowlink = Math.min(v.lowlink, w.lowlink);
                } else if (w.onstack) {
                    v.lowlink = Math.min(v.lowlink, w.index);
                }
            }
        }

        if (v.lowlink == v.index) {
            var component = [];

            var w = null;
            do {
                w = S.pop();
                w.onstack = false;
                component.push(w);
            } while (v.id != w.id);

            out.push(component);
        }
    };

    for (var i = 0, len = V.length; i < len; ++i) {
        var v = V[i];

        if (!(v instanceof Node)) {
            throw 'Unexpected node type';
        }

        if (!('index' in v)) {
            strongconnect(v);
        }
    }

    return out;
}
