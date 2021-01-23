'use strict'

const UA = require('./ua')
const Device = require('./device')

function replaceMatches (str, m) {
  return str.replace(/\${(\d+)}|\$(\d+)/g, function (tmp, i, j) {
    return m[(i || j)] || ''
  }).trim()
}

// debug fn to measure regex match delay
function measureRegex (regex) { // eslint-disable-line no-unused-vars
  const _regex = {}

  const max = process.env.DIFF || 50

  const fn = (name) => (...args) => {
    const start = Date.now()
    const m = regex[name](...args)
    const diff = Date.now() - start
    if (diff > max) console.log(diff, regex)
    return m
  }

  _regex.match = fn('match')
  _regex.exec = fn('exec')

  return _regex
}

function parser (regexes, options) {
  const self = {}

  self.options = options || {}

  function _replacePattern (regex) {
    const pattern = self.options.pattern || {}
    Object.keys(pattern).forEach(function (p) {
      if (regex.indexOf(p) !== -1) {
        regex = regex.replace(p, pattern[p])
      }
    })
    return regex
  }

  function _regexp (obj) {
    const pattern = _replacePattern(obj.regex)
    const patternLc = obj.regex_flag === 'i' ? pattern.toLowerCase() : pattern
    const regex = new RegExp(patternLc, obj.regex_flag)
    // if (!require('safe-regex')(regex)) console.log(regex)
    // return measureRegex(regex) // DEBUG
    return regex
  }

  function _make (obj) {
    const regexp = _regexp(obj)

    if (obj.group) {
      return _makeGroup(obj)
    } else if (!self.options.device) {
      return parse
    } else {
      return parseDevice
    }

    function parse (str, preset) {
      const m = regexp.exec(str)
      if (!m) { return null }

      preset = preset || {}
      const family = (obj.family ? replaceMatches(obj.family, m) : m[1]) || preset.family
      const major = (obj.v1 ? replaceMatches(obj.v1, m) : m[2]) || preset.major
      const minor = (obj.v2 ? replaceMatches(obj.v2, m) : m[3]) || preset.minor
      const patch = (obj.v3 ? replaceMatches(obj.v3, m) : m[4]) || preset.patch
      const type = (obj.type ? replaceMatches(obj.type, m) : undefined) || preset.type
      let patchMinor
      if (self.options.usePatchMinor) {
        patchMinor = (obj.v4 ? replaceMatches(obj.v4, m) : m[5]) || preset.v4 || null
      }
      const ret = new UA(family, major, minor, patch, patchMinor, type, obj.debug)

      if (obj.preset) ret.preset = true
      return ret
    }

    function parseDevice (str, preset) {
      const m = regexp.exec(str)
      if (!m) { return null }

      preset = preset || {}
      const
        family = (obj.device ? replaceMatches(obj.device, m) : m[1]) || preset.family,
        brand = (obj.brand ? replaceMatches(obj.brand, m) : undefined) || preset.brand || null,
        model = (obj.model ? replaceMatches(obj.model, m) : m[1]) || preset.model,
        type = (obj.type ? replaceMatches(obj.type, m) : undefined) || preset.type,
        ret = new Device(family, brand, model, type, obj.debug)

      if (obj.preset) ret.preset = true
      return ret
    }
  }

  function _makeGroup (obj) {
    const regexp = _regexp(obj)
    const parsers = (obj.group || []).map(_make)

    function parseGroup (str, preset) {
      const m = regexp.exec(str)
      if (!m) { return null }

      return _parse(parsers, str, preset)
    }

    return parseGroup
  }

  function _parse (parsers, str, preset) {
    let obj, length, i

    for (i = 0, length = parsers.length; i < length; i++) {
      obj = parsers[i](str, preset)
      if (obj) {
        if (obj.preset) {
          preset = Object.assign(preset, obj)
        } else {
          break
        }
      }
    }
    return obj
  }

  const parsers = (regexes || []).map(_make)

  self.parse = function (str) {
    const obj = _parse(parsers, str, {})

    str = (str || '').toString().substr(0, 500)

    if (!self.options.device) {
      return new UA(obj)
    } else {
      return new Device(obj)
    }
  }

  return self
}

module.exports = parser
