'use strict'

QUnit.module('Rule')

test('create empty instance', function () {
    jss.uid.reset()
    var rule = jss.createRule()
    equal(rule.type, 'regular')
    equal(rule.className, 'jss-0-0')
    equal(rule.selector, '.jss-0-0')
    rule = jss.createRule()
    equal(rule.className, 'jss-0-1')
    equal(rule.selector, '.jss-0-1')
    deepEqual(rule.style, {})
})

test('create instance with styles only', function () {
    var rule = jss.createRule({float: 'left'})
    deepEqual(rule.style, {float: 'left'})
    equal(rule.className.substr(0, 3), 'jss')
    equal(rule.selector.substr(0, 4), '.jss')
})

test('create instance with styles and options', function () {
    var options = {}
    var rule = jss.createRule({float: 'left'}, options)
    deepEqual(rule.style, {float: 'left'})
    equal(rule.className.substr(0, 3), 'jss')
    equal(rule.selector.substr(0, 4), '.jss')
    strictEqual(rule.options, options)
})

test('create instance with all params', function () {
    var options = {named: false}
    var rule = jss.createRule('a', {float: 'left'}, options)
    deepEqual(rule.style, {float: 'left'})
    equal(rule.className, undefined)
    equal(rule.selector, 'a')
    strictEqual(rule.options, options)
})

test('toString', function () {
    var rule = jss.createRule('a', {float: 'left', width: '1px'}, {named: false})
    equal(rule.toString(), 'a {\n  float: left;\n  width: 1px;\n}')
})

test('multiple declarations with identical property names', function () {
    var rule = jss.createRule('a', {display: ['inline', 'run-in']}, {named: false})
    equal(rule.toString(), 'a {\n  display: inline;\n  display: run-in;\n}')
})

test('@charset', function () {
    var rule = jss.createRule('@charset', '"utf-8"')
    equal(rule.type, 'simple')
    equal(rule.name, '@charset')
    equal(rule.value, '"utf-8"')
    equal(rule.toString(), '@charset "utf-8";')
})

test('@import', function () {
    var rule = jss.createRule('@import', '"something"')
    equal(rule.type, 'simple')
    equal(rule.toString(), '@import "something";')
    rule = jss.createRule('@import', 'url("something") print')
    equal(rule.toString(), '@import url("something") print;')
})

test('@namespace', function () {
    var rule = jss.createRule('@namespace', 'svg url(http://www.w3.org/2000/svg)')
    equal(rule.type, 'simple')
    equal(rule.toString(), '@namespace svg url(http://www.w3.org/2000/svg);')
})

test('@keyframes', function () {
    var rule = jss.createRule('@keyframes id', {
        from: {top: 0},
        '30%': {top: 30},
        '60%, 70%': {top: 80}
    })
    equal(rule.type, 'keyframe')
    equal(rule.selector, '@keyframes id')
    equal(rule.toString(), '@keyframes id {\n  from {\n    top: 0;\n  }\n  30% {\n    top: 30;\n  }\n  60%, 70% {\n    top: 80;\n  }\n}')
})

test('@media', function () {
    var rule = jss.createRule('@media print', {button: {display: 'none'}}, {named: false})
    equal(rule.type, 'conditional')
    equal(rule.selector, '@media print')
    equal(rule.toString(), '@media print {\n  button {\n    display: none;\n  }\n}')
})

test('@media named', function () {
    jss.uid.reset()
    var rule = jss.createRule('@media print', {
        button: {
            display: 'none'
        }
    })
    equal(rule.type, 'conditional')
    equal(rule.selector, '@media print')
    equal(rule.toString(), '@media print {\n  .jss-0-0 {\n    display: none;\n  }\n}')
})

test('@font-face', function () {
    var rule = jss.createRule('@font-face', {
        'font-family': 'MyHelvetica',
        src: 'local("Helvetica")'
    })
    equal(rule.type, 'regular')
    equal(rule.selector, '@font-face')
    equal(rule.toString(), '@font-face {\n  font-family: MyHelvetica;\n  src: local("Helvetica");\n}')
    rule = jss.createRule('@font-face', {
        'font-family': 'MyHelvetica',
        src: 'local("Helvetica")'
    }, {named: true})
    equal(rule.toString(), '@font-face {\n  font-family: MyHelvetica;\n  src: local("Helvetica");\n}')
})

test('@supports', function () {
    jss.uid.reset()
    var rule = jss.createRule('@supports ( display: flexbox )', {
        button: {
            display: 'none'
        }
    })
    equal(rule.type, 'conditional')
    equal(rule.selector, '@supports ( display: flexbox )')
    equal(rule.toString(), '@supports ( display: flexbox ) {\n  .jss-0-0 {\n    display: none;\n  }\n}')
})

test('applyTo', function () {
    jss.createRule({
        float: 'left'
    }).applyTo(document.body)
    equal(document.body.style.float, 'left')

    jss.createRule({
        display: ['inline', 'run-in']
    }).applyTo(document.body)
    equal(document.body.style.display, 'inline')
})

test('applyTo with array value', function () {
    jss.createRule({
        display: ['inline', 'run-in']
    }).applyTo(document.body)
    equal(document.body.style.display, 'inline')
})

test('toJSON', function () {
    var decl = {color: 'red'}
    var rule = jss.createRule(decl)
    deepEqual(rule.toJSON(), decl, 'declarations are correct')
})

test('toJSON with nested rules', function () {
    var decl = {color: 'red', '&:hover': {color: 'blue'}}
    var rule = jss.createRule(decl)
    deepEqual(rule.toJSON(), {color: 'red'}, 'nested rules removed')
})

test('set/get rules virtual prop', function () {
    var rule = jss.createRule()
    rule.prop('float', 'left')
    equal(rule.prop('float'), 'left')
})

test('set/get rules virtual prop with value 0', function () {
    var rule = jss.createRule()
    rule.prop('width', 0)
    equal(rule.prop('width'), 0)
})

test('set/get rules dom prop', function () {
    var ss = jss.createStyleSheet({a: {float: 'left'}}, {link: true})
    var rule = ss.rules.a
    ss.attach()
    rule.prop('color', 'red')
    equal(rule.style.color, 'red', 'new prop is cached')
    equal(rule.prop('color'), 'red', 'new prop is returned')
    equal(rule.DOMRule.style.color, 'red', 'new rule is set to the DOM')
    ss.detach()
})

test('get rules prop from the dom and cache it', function () {
    var ss = jss.createStyleSheet({a: {float: 'left'}}, {link: true})
    var rule = ss.rules.a
    ss.attach()
    equal(rule.prop('color'), '', 'color is empty')
    ok('color' in rule.style, 'value is cached')
    ss.detach()
})

test('add plugin', function () {
    var plugin = function () {}
    jss.use(plugin)
    equal(jss.plugins.registry.length, 1)
    strictEqual(jss.plugins.registry[0], plugin)
    jss.plugins.registry = []
})

test('run plugins', function () {
    var executed = false
    function plugin() {
        executed = true
    }
    jss.use(plugin)
    jss.plugins.run(jss.createRule())
    ok(executed)
    jss.plugins.registry = []
})

test('run plugins on inner rules of an conditional rule', function () {
    var executed = 0
    function plugin() {
        executed++
    }
    jss.use(plugin)
    jss.createRule('@media', {
        button: {float: 'left'}
    })
    equal(executed, 2)
})

test('run plugins on inner rules of a keyframe rule', function () {
    var executed = 0
    function plugin(rule) {
        executed++
    }
    jss.use(plugin)
    jss.createRule('@keyframes', {
        from: {top: 0},
        to: {top: 10}
    })
    equal(executed, 3)
})
