'use strict'

/* global describe, it */

var
  assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  Device = require('../lib/device'),
  makeParser = require('../lib/parser')

var
  options = { device: true }

describe('Device object', function () {
  it('Device constructor with no arguments', function () {
    var device = new Device()
    assert.strictEqual(device.family, 'Other')
    assert.strictEqual(device.toString(), 'Other')
  })

  it('Device constructor with valid arguments', function () {
    var device = new Device('Foo')
    assert.strictEqual(device.family, 'Foo')
    assert.strictEqual(device.toString(), 'Foo')
  })

  it('Device constructor with valid Brand Model arguments', function () {
    var device = new Device('Sang', 'Gum', 'Sang A')
    assert.strictEqual(device.family, 'Sang')
    assert.strictEqual(device.brand, 'Gum')
    assert.strictEqual(device.model, 'Sang A')
    assert.strictEqual(device.toString(), 'Gum Sang A')
  })
})

describe('Device parser', function () {
  it('makeParser returns a function', function () {
    assert.equal(typeof makeParser([]).parse, 'function')
  })

  it('Unexpected args don\'t throw', function () {
    var parse = makeParser([], options).parse
    assert.doesNotThrow(function () { parse('Foo') })
    assert.doesNotThrow(function () { parse('') })
    assert.doesNotThrow(function () { parse() })
    assert.doesNotThrow(function () { parse(null) })
    assert.doesNotThrow(function () { parse({}) })
    assert.doesNotThrow(function () { parse(123) })
  })

  it('Parser returns an instance of Device when unsuccessful at parsing', function () {
    var parse = makeParser([{regex: 'foo'}], options).parse
    assert.ok(parse('bar') instanceof Device)
  })

  it('Parser returns an instance of Device when sucessful', function () {
    var parse = makeParser([{regex: 'foo'}], options).parse
    assert.ok(parse('foo') instanceof Device)
  })

  it('Parser correctly identifies Device name', function () {
    var parse = makeParser([{regex: '(foo)'}], options).parse
    assert.strictEqual(parse('foo').family, 'foo')
  })

  it('Parser correctly processes replacements', function () {
    var parse = makeParser([{
      regex: '(foo)',
      device: '$1bar'
    }], options).parse

    var device = parse('foo')
    assert.strictEqual(device.family, 'foobar')
  })
})

describe('Device parser groups', function () {
  var
    contents = fs.readFileSync(path.join(__dirname, 'groupdevice.yaml'), 'utf8'),
    regexes = yaml.safeLoad(contents),
    parse = makeParser(regexes.rules, options).parse

  it('Parser correctly processes groups matching "gumsang"', function () {
    var device = parse('gumsang tststs')
    assert.deepEqual(device, { family: 'gumsang tsts', brand: 'GumSanG', model: 'tsts' })
  })

  it('Parser correctly processes groups matching "THC" and "Bandroid"', function () {
    var device = parse('Bandroid THC TWO1212')
    assert.deepEqual(device, {'family': 'THC TWO', 'brand': 'THC', 'model': 'TWO 1212'})
  })

  it('Parser correctly processes groups matching "CHC"', function () {
    var device = parse('CHC POOL4 Bandroid')
    assert.deepEqual(device, {'family': 'CHC', 'brand': 'CHC by THC', 'model': 'LOOP 4'})
  })

  it('Parser correctly processes groups matching no group', function () {
    var device = parse('price YBoY')
    assert.deepEqual(device, {'family': 'YBoY ice', 'brand': 'YBoY', 'model': 'ice'})
  })

  it('Parser correctly processes groups without a match', function () {
    var device = parse('price ZBoZ')
    assert.deepEqual(device, {'family': 'Other', 'brand': null, 'model': null})
  })

  it('Parser correctly processes preset', function () {
    var device = parse('cool YBoY Mobile')
    assert.deepEqual(device, {family: 'YBoY cool', brand: 'YBoY', model: 'cool', type: 'mobile'})
  })
})
