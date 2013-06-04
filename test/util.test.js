
var util = require('../util');

var camelize = util.camelize;
test("camelize", 11, function() {
    ok( camelize('_hello_world')    === 'helloWorld' );
    ok( camelize('HeLlO_worlD')     === 'HelloWorld' );
    ok( camelize('heLlO_WorlD')     === 'HelloWorld' );
    ok( camelize('heLlOWorlD')      === 'Helloworld' );
    ok( camelize('heLlOWorlD_')     === 'Helloworld' );
    ok( camelize('_heLlO_WorlD_')   === 'helloWorld' );
    ok( camelize('-heLlO_WorlD')    === 'helloWorld' );
    ok( camelize('-heLlO-WorlD')    === 'helloWorld' );
    ok( camelize('heLlO-WorlD')     === 'HelloWorld' );
    ok( camelize('heLlO.WorlD')     === 'Hello.world' );
    ok( camelize('~heLlO.WorlD')    === 'hello.world' );
});

var ifndef = util.ifndef;
test("ifndef", 11, function() {
    ok( ifndef('hello', 'world')    === 'hello' );
    ok( ifndef(undefined, 'world')  === 'world' );
    ok( ifndef(null, 'world')       === null    );
    ok( ifndef(false, 'world')      === false   );
    ok( ifndef('', 'world')         === ''      );
    ok( ifndef(undefined, null)     === null    );
    ok( ifndef(undefined, false)    === false   );
    ok( ifndef(undefined, '')       === ''      );
    ok( ifndef('hello', false)      === 'hello' );
    ok( ifndef('hello')             === 'hello' );
    ok( ifndef('', '')              === ''      );
});

var setdefault = util.setdefault;
test("setdefault", 7, function() {
    var o = { b: false, c: undefined };
    setdefault(o, 'a', 'hello');
        ok( o.a === 'hello' );
    o.a = null;
    setdefault(o, 'a', 'world');
        ok( o.a === null );

    setdefault(o, 'b', 'world');
        ok( o.b === false );
    delete o.b;
    setdefault(o, 'b', 'world');
        ok( o.b === 'world' );

    setdefault(o, 'c', 'world', false);
        ok( o.c === undefined );
    setdefault(o, 'c', 'world');
        ok( o.c === 'world' );
    delete o.c;
    setdefault(o, 'c', 'world');
        ok( o.c === 'world' );
});
