'use strict'

/* global describe, it */

const assert = require('assert')
const safe = require('safe-regex')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

function load (filename) {
  const contents = fs.readFileSync(filename, 'utf8')
  return yaml.load(contents)
}

function getRegexes (type, regexes) {
  const arr = []
  const options = {
    pattern: regexes.pattern
  }

  function _replacePattern (regex) {
    const pattern = options.pattern || {}
    Object.keys(pattern).forEach(function (p) {
      if (regex.indexOf(p) !== -1) {
        regex = regex.replace(p, pattern[p])
      }
    })
    return regex
  }

  function _regexp (obj) {
    const regex = _replacePattern(obj.regex)
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
  const filename = path.resolve(__dirname, '..', '..', 'regexes.yaml')
  const regexes = load(filename)

  ;[
    'user_agent_parsers',
    'engine_parsers',
    'os_parsers',
    'device_parsers'
  ].forEach(describeType)

  function describeType (type) {
    describe(type, function () {
      const arr = getRegexes(type, regexes)
      arr.forEach(testRegex)
    })
  }

  function testRegex (obj) {
    const regex = obj.regex
    it(regex, function () {
      assert.ok(safe(regex), obj.debug)
    })
  }
})

// console.log(regexes)
// console.log(getRegexes(regexes))
