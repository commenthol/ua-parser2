'use strict'

/* global describe, it */

var assert = require('assert')
var safe = require('safe-regex')
var path = require('path')
var fs = require('fs')
var yaml = require('js-yaml')

function load (filename) {
  var contents = fs.readFileSync(filename, 'utf8')
  return yaml.safeLoad(contents)
}

function getRegexes (type, regexes) {
  var arr = []
  var options = {
    pattern: regexes.pattern
  }

  function _replacePattern (regex) {
    var pattern = options.pattern || {}
    Object.keys(pattern).forEach(function (p) {
      if (regex.indexOf(p) !== -1) {
        regex = regex.replace(p, pattern[p])
      }
    })
    return regex
  }

  function _regexp (obj) {
    var regex = _replacePattern(obj.regex)
    arr.push({
      regex: regex,
      debug: obj.debug
    })
  }

  function _make (obj) {
    _regexp(obj)
    if (obj.group) {
      _makeGroup(obj)
    }
  }
  function _makeGroup (obj) {
    _regexp(obj)
    ;(obj.group || []).forEach(_make)
  }

  regexes[type].forEach(_make)

  return arr
}

describe('regexes', function () {
  var filename = path.resolve(__dirname, '..', '..', 'regexes.yaml')
  var regexes = load(filename)

  ;[
    'user_agent_parsers',
    'engine_parsers',
    'os_parsers',
    'device_parsers'
  ].forEach(describeType)

  function describeType (type) {
    describe(type, function () {
      var arr = getRegexes(type, regexes)
      arr.forEach(testRegex)
    })
  }

  function testRegex (obj) {
    var regex = obj.regex
    it(regex, function () {
      assert.ok(safe(regex), obj.debug)
    })
  }
})

// console.log(regexes)
// console.log(getRegexes(regexes))
