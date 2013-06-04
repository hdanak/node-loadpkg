var util = require('./util');
module.exports = function loadpkg(path, opts) {
    var yaml = require('js-yaml'),
        fs   = require('fs'),
        pkg  = {};

    path = util.ifndef(path, '.');
    opts = util.ifndef(opts, {});
    util.setdefaults(opts, {
        camelcase:  true,
        recursive:  false,
        lazy:       true,
        watch:      false,
        exts:       {},
        ignore:     [],
        test:       function() { return true },
        error:      function() {},
    });
    ['js', 'json', 'yaml', 'yml', ''].forEach(function (ext) {
        if (!(ext in opts.exts)) opts.exts[ext] = require;
    });

    fs.readdirSync(path).filter(function (f) {
        return f.match(/^\w/)
            && path+'/'+f !== module.parent.filename
            && f !== 'index.js'
            && opts.ignore.indexOf(f) == -1
    }).filter(opts.test).map(function (f) {
        var info = { ext: '', filename: f, abs: path+'/'+f };
        if (fs.statSync(info.abs).isFile()) {
            info.ext = (f.match(/\.([^.]+)$/) || ['',''])[1];
            if (info.ext in opts.exts)
                info.loader = opts.exts[info.ext];
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
