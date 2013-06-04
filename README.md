node-loadpkg
============
Pythonic directory-package imports for NodeJs

Synopsis
--------

    $> ls *
    models/  db/

    models:
    some_model.js  another_model.js  cool.js  _hidden_file.js

    db:
    databases.yaml  fixtures.json

    node> var models = require("loadpkg")("./models");
    node> Object.keys(models)
    ['SomeModel', 'AnotherModel', 'Cool', 'hiddenFile']

    node> var db = require("loadpkg")("./db");
    node> Object.keys(db)
    ['Fixtures', 'Databases']
