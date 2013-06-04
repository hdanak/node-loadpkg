var self;
self = module.exports = {
    camelize: function(x) {
        return x
            // first lowercase everything
            .toLowerCase()
            // simplify all non-letter/dot symbols to '_'
            .replace(/[^\w.]+/g, '_').replace(/_+/g, '_')
            // uppercase first letter if not preceded by '_'
            .replace(/^[^_]/g, function(m) { return m.toUpperCase(); })
            // otherwise remove preceding '_'
            .replace(/^_/, '')
            // uppercase every letter following a '_'
            .replace(/_([^_]*)/g, function(m, m1) {
                return m1.charAt(0).toUpperCase() + m1.substr(1);
            });
    },
    defined: function(q) {
        return !(q === undefined);
    },
    ifndef: function(q, x) {
        return (q === undefined) ? x : q;
    },
    setdefault: function(o, k, d, inherited) {
        inherited = self.ifndef(inherited, true);
        if (inherited)
            return o[k] = self.ifndef(o[k], d);
        else
            return k in o ? o[k] : o[k] = d;
    },
    setdefaults: function(o, ds) {
        Object.keys(ds).forEach(function (k) {
            self.setdefault(o, k, ds[k]);
        });
    },
    bind: function(o, m) { return o[m].bind(o); },
    tee: function(src, a, b, filter, self) {
        src.forEach(function (x) {
            var test = filter(x);
            if (test === true)  a.push(x);
            if (test === false) b.push(x);
        }, self);
    },
    singleton: function(fx) {
        var val;
        return function () {
            return self.defined(val) ? val : val = fx.apply(self, arguments);
        }
    },
};
