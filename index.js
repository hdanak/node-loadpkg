var util = require('./util');
module.exports = function loadpkg(base, opts) {
    var yaml = require('js-yaml'),
        path = require('path'),
        fs   = require('fs'),
        pkg  = {};

    base = util.ifndef(base, '.');
    opts = util.ifndef(opts, {});
    util.setdefaults(opts, {
        camelcase:  true,
        init:       false,
        lazy:       true,
        watch:      false,
        loaders:    {},
        ignore:     [],
        filter:     function() { return true },
        error:      function() {},
    });

    function initCheck(f) {
        if (!opts.init) return false;
        if (typeof opts.init === 'string' || opts.init instanceof RegExp)
            return !!f.match(opts.init);
        if (opts.init) try {
            return !!f.match(util.escapeRegExp(
                        require(path.join(base, 'package.json')).main));
        } catch (e) {}
        return !!f.match(/^index\./);
    }

    fs.readdirSync(base).filter(function (f) {
        return f.match(/^\w/)
            && path.join(base, f) !== module.parent.filename
            && !initCheck(f)
            && opts.ignore.indexOf(f) == -1
    }).filter(opts.filter).map(function (f) {
        var info = { ext: '', filename: f, abs: path.join(base, f) };
        if (fs.statSync(info.abs).isFile()) {
            info.ext = (f.match(/\.([^.]+)$/) || ['',''])[1];
            info.loader = info.ext in opts.loaders ? opts.loaders[info.ext] : require;
        }
        info.key = info.ext ? f.replace(/\.[^.]*$/, '') : f;
        if (opts.camelcase)
            info.key = util.camelize(info.key);
        return info;
    }).forEach(function (info) {
        if (opts.watch)
            info.watcher = fs.watch(info.abs, { persistent: false }, function(ev, f) {
                switch (ev) {
                case 'change':
                    createModuleLoader(pkg, info, opts);
                    break;
                case 'error':
                    opts.error.call({ opts: opts, info: info, pkg: pkg }, ev, f);
                case 'rename':
                    watcher.close();
                }
            });
        createModuleLoader(pkg, info, opts);
    });
    return pkg;
};
function createModuleLoader(pkg, info, opts) {
    var m = util.singleton(function () {
        try {
            return info.loader(info.abs);
        } catch(e) {
            opts.error.call({ opts: opts, info: info, pkg: pkg }, e);
            delete pkg[info.key];
            if (info.watcher) {
                info.watcher.close();
                delete info.watcher;
            }
        }
    });
    if (!opts.lazy && !(pkg[info.key] = m())) {
        delete pkg[info.key]; return;
    }
    pkg[info.key] = null;
    Object.defineProperty(pkg, info.key, { get: m, configurable: true });
}
