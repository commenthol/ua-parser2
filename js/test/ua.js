'use strict'

/* global describe, it */

var
  assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  UA = require('../lib/ua'),
  makeParser = require('../lib/parser')

describe('UA object', function () {
  it('UA constructor with no arguments', function () {
    var ua = new UA()
    assert.strictEqual(ua.family, 'Other')
    assert.strictEqual(ua.major, null)
    assert.strictEqual(ua.minor, null)
    assert.strictEqual(ua.patch, null)
  })

  it('UA constructor with valid arguments', function () {
    var ua = new UA('Firefox', '16', '3', 'beta')
    assert.strictEqual(ua.family, 'Firefox')
    assert.strictEqual(ua.major, '16')
    assert.strictEqual(ua.minor, '3')
    assert.strictEqual(ua.patch, 'beta')
    assert.ok(!('patchMinor' in ua))
    assert.ok(!('type' in ua))
  })

  it('UA constructor with valid arguments and type', function () {
    var ua = new UA('Firefox', '16', '3', 'beta', '', 'browser')
    assert.strictEqual(ua.family, 'Firefox')
    assert.strictEqual(ua.major, '16')
    assert.strictEqual(ua.minor, '3')
    assert.strictEqual(ua.patch, 'beta')
    assert.strictEqual(ua.type, 'browser')
  })

  it('UA#toVersionString with only numerical args', function () {
    assert.strictEqual(new UA('Firefox', '16', '3', '2').toVersionString(), '16.3.2')
  })

  it('UA#toVersionString with non numerical patch version', function () {
    assert.strictEqual(new UA('Firefox', '16', '3', 'beta').toVersionString(), '16.3beta')
  })

  it('UA#toString for known UA', function () {
    assert.strictEqual(new UA('Firefox', '16', '3', '2').toString(), 'Firefox 16.3.2')
  })

  it('UA#toString for unknown UA', function () {
    assert.strictEqual(new UA().toString(), 'Other')
  })
})

describe('UA parser', function () {
  it('makeParser returns a function', function () {
    assert.equal(typeof makeParser([]).parse, 'function')
  })

  it('Unexpected args don\'t throw', function () {
    var parse = makeParser([]).parse
    assert.doesNotThrow(function () { parse('Foo') })
    assert.doesNotThrow(function () { parse('') })
    assert.doesNotThrow(function () { parse() })
    assert.doesNotThrow(function () { parse(null) })
    assert.doesNotThrow(function () { parse({}) })
    assert.doesNotThrow(function () { parse(123) })
  })

  it('Parser returns an instance of UA when unsuccessful at parsing', function () {
    assert.ok(makeParser([]).parse('bar') instanceof UA)
  })

  it('Parser returns an instance of UA when sucessful', function () {
    var parse = makeParser([{regex: 'foo'}]).parse
    assert.ok(parse('foo') instanceof UA)
  })

  it('Parser correctly identifies UA name', function () {
    var parse = makeParser([{regex: '(foo)'}]).parse
    assert.strictEqual(parse('foo').family, 'foo')
  })

  it('Parser correctly identifies version numbers', function () {
    var parse = makeParser([{regex: '(foo) (\\d)\\.(\\d)\\.(\\d)'}]).parse,
      ua = parse('foo 1.2.3')
    assert.strictEqual(ua.family, 'foo')
    assert.strictEqual(ua.major, '1')
    assert.strictEqual(ua.minor, '2')
    assert.strictEqual(ua.patch, '3')
  })

  it('Parser correctly processes replacements', function () {
    var parse = makeParser([{
      regex: '(foo) (\\d)\\.(\\d).(\\d)',
      family: '$1bar',
      v1: 'a',
      v2: 'b',
      v3: 'c'
    }]).parse

    var ua = parse('foo 1.2.3')
    assert.strictEqual(ua.family, 'foobar')
    assert.strictEqual(ua.major, 'a')
    assert.strictEqual(ua.minor, 'b')
    assert.strictEqual(ua.patch, 'c')
  })

  it('Parser correctly processes replacements with curly brackets', function () {
    var parse = makeParser([{
      regex: '(foo) (\\d)\\.(\\d).(\\d) (?:(a)|(b)|(c)|(d)|(e)|(f)|(g)|(h)|(i)|(j)|(k)|(l)|(m)|(n)|(o)|(p)|(q)|(r)|(s)|(t)|(u)|(v)|(w)|(x)|(y)|(z))',
      family: '$1bar',
      v1: '$1$2$3$4$5$6$7$8$9$10$11$12$13$14$15$16$17$18$19$20$21$22$23$24$25$26$27$28$29$30',
      v2: '$100a', // this matches $100 which is not present
      v3: '${1}00' // eslint-disable-line
      // match $1
    }]).parse

    var ua = parse('foo 1.2.3 z')
    assert.strictEqual(ua.family, 'foobar')
    assert.strictEqual(ua.major, 'foo123z')
    assert.strictEqual(ua.minor, 'a')
    assert.strictEqual(ua.patch, 'foo00')
  })
})

describe('UA parser groups', function () {
  var
    contents = fs.readFileSync(path.join(__dirname, 'group.yaml'), 'utf8'),
    regexes = yaml.safeLoad(contents),
    pattern = regexes.pattern,
    parse = makeParser(regexes.rules, {pattern: pattern}).parse

  it('Parser correctly processes groups matching "foo"', function () {
    var ua = parse('foo 1.2.3')
    assert.strictEqual(ua.family, 'foobar')
    assert.strictEqual(ua.major, 'a')
    assert.strictEqual(ua.minor, 'b')
    assert.strictEqual(ua.patch, 'c')
  })

  it('Parser correctly processes groups matching "FOO"', function () {
    var ua = parse('FOO 1.2.3')
    assert.strictEqual(ua.family, 'FOObar')
    assert.strictEqual(ua.major, 'a')
    assert.strictEqual(ua.minor, 'b')
    assert.strictEqual(ua.patch, 'c')
  })

  it('Parser correctly processes groups matching "Fooooo"', function () {
    var ua = parse('Fooooo 1.2.3')
    assert.strictEqual(ua.family, 'Fooooobar')
    assert.strictEqual(ua.major, 'a3')
    assert.strictEqual(ua.minor, 'b2')
    assert.strictEqual(ua.patch, 'c1')
  })

  it('Parser correctly processes groups not matching "foo browser" within group "foo"', function () {
    var ua = parse('foo browser 1.2.3')
    assert.strictEqual(ua.family, 'browser')
    assert.strictEqual(ua.major, 'foo 1')
    assert.strictEqual(ua.minor, 'foo 2')
    assert.strictEqual(ua.patch, 'foo 3')
  })

  it('Parser correctly processes groups matching "bbar" within group "bar"', function () {
    var ua = parse('bbar 1.2.3')
    assert.strictEqual(ua.family, 'foobar')
    assert.strictEqual(ua.major, 'bar12a')
    assert.strictEqual(ua.minor, 'bar12b')
    assert.strictEqual(ua.patch, 'bar12c')
  })

  it('Parser correctly processes groups matching "bbar" within group "bar"', function () {
    var ua = parse('bbar 1.2.3')
    assert.strictEqual(ua.family, 'foobar')
    assert.strictEqual(ua.major, 'bar12a')
    assert.strictEqual(ua.minor, 'bar12b')
    assert.strictEqual(ua.patch, 'bar12c')
  })

  it('Parser correctly processes groups not matching "Bar"', function () {
    var ua = parse('Bar 1.2.3')
    assert.strictEqual(ua.family, 'Other')
    assert.strictEqual(ua.major, null)
    assert.strictEqual(ua.minor, null)
    assert.strictEqual(ua.patch, null)
  })

  it('Parser correctly processes groups matching "other browser" outside groups', function () {
    var ua = parse('other browser 1.2.3')
    assert.strictEqual(ua.family, 'browser')
    assert.strictEqual(ua.major, 'a other 1')
    assert.strictEqual(ua.minor, 'b other 2')
    assert.strictEqual(ua.patch, 'c other 3')
  })

  it('Parser correctly processes preset', function () {
    var ua = parse('kitti foo 4.5.6')
    assert.deepEqual(ua, {family: 'foobar', major: 'a', minor: 'b', patch: 'c', type: 'app::kitti'})
  })
})
