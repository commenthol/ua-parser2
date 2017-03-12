'use strict'

/* global describe, it */

var assert = require('assert'),
  OS = require('../lib/ua'),
  makeParser = require('../lib/parser')

var options = {
  usePatchMinor: true
}

describe('os object', function () {
  it('OS constructor with no arguments', function () {
    var os = new OS()
    assert.strictEqual(os.family, 'Other')
    assert.strictEqual(os.major, null)
    assert.strictEqual(os.minor, null)
    assert.strictEqual(os.patch, null)
  })

  it('OS constructor with valid arguments', function () {
    var os = new OS('Bar', '4', '3', '2', '1')
    assert.strictEqual(os.family, 'Bar')
    assert.strictEqual(os.major, '4')
    assert.strictEqual(os.minor, '3')
    assert.strictEqual(os.patch, '2')
    assert.strictEqual(os.patchMinor, '1')
  })

  it('OS#toVersionString with only numerical args', function () {
    assert.strictEqual(new OS('Bar', '4', '3', '2', '1').toVersionString(), '4.3.2.1')
    assert.strictEqual(new OS('Bar', '4', '3', '2').toVersionString(), '4.3.2')
    assert.strictEqual(new OS('Bar', '4', '3').toVersionString(), '4.3')
    assert.strictEqual(new OS('Bar', '4').toVersionString(), '4')
    assert.strictEqual(new OS('Bar').toVersionString(), '')
  })

  it('OS#toVersionString with non numerical args', function () {
    assert.strictEqual(new OS('Bar', '4', '3', '2', 'beta').toVersionString(), '4.3.2beta')
    assert.strictEqual(new OS('Bar', '4', '3', 'beta').toVersionString(), '4.3beta')
  })

  it('OS#toString for known OS', function () {
    assert.strictEqual(new OS('Bar', '4', '3', '2', '1').toString(), 'Bar 4.3.2.1')
  })

  it('OS#toString for unknown OS', function () {
    assert.strictEqual(new OS().toString(), 'Other')
  })
})

describe('OS parser', function () {
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

  it('Parser returns an instance of OS when unsuccessful at parsing', function () {
    var parse = makeParser([], options).parse
    assert.ok(parse('foo') instanceof OS)
  })

  it('Parser returns an instance of OS when sucessful', function () {
    var parse = makeParser([{regex: 'foo'}], options).parse
    assert.ok(parse('foo') instanceof OS)
  })

  it('Parser correctly identifies OS name', function () {
    var parse = makeParser([{regex: '(foo)'}], options).parse
    assert.strictEqual(parse('foo').family, 'foo')
  })

  it('Parser correctly identifies version numbers', function () {
    var parse = makeParser([{regex: '(foo) (\\d)\\.(\\d).(\\d)\\.(\\d)'}], options).parse,
      os = parse('foo 1.2.3.4')
    assert.strictEqual(os.family, 'foo')
    assert.strictEqual(os.major, '1')
    assert.strictEqual(os.minor, '2')
    assert.strictEqual(os.patch, '3')
    assert.strictEqual(os.patchMinor, '4')
  })

  it('Parser correctly processes replacements', function () {
    var parse = makeParser([{
      regex: '(foo) (\\d)\\.(\\d)\\.(\\d)\\.(\\d)',
      family: '$1bar',
      v1: 'a',
      v2: 'b',
      v3: 'c',
      v4: 'd'
    }], options).parse

    var os = parse('foo 1.2.3.4')
    assert.strictEqual(os.family, 'foobar')
    assert.strictEqual(os.major, 'a')
    assert.strictEqual(os.minor, 'b')
    assert.strictEqual(os.patch, 'c')
  })
})
