'use strict'

var
  UA = require('./ua'),
  Device = require('./device')

function assign (target, source) {
  if (!source) return target
  target = target || {}
  Object.keys(source).forEach(function (p) {
    target[p] = source[p]
  })
  return target
}

function replaceMatches (str, m) {
  return str.replace(/\${(\d+)}|\$(\d+)/g, function (tmp, i, j) {
    return m[(i || j)] || ''
  }).trim()
}

function parser (regexes, options) {
  var
    parsers,
    self = {}

  self.options = options || {}

  function _replacePattern (regex) {
    var pattern = self.options.pattern || {}
    Object.keys(pattern).forEach(function (p) {
      if (regex.indexOf(p) !== -1) {
        regex = regex.replace(p, pattern[p])
      }
    })
    return regex
  }

  function _regexp (obj) {
    var regex = _replacePattern(obj.regex)
    regex = new RegExp(regex, obj.regex_flag)
    // if (!require('safe-regex')(regex)) console.log(regex)
    return regex
  }

  function _make (obj) {
    var regexp = _regexp(obj)

    if (obj.group) {
      return _makeGroup(obj)
    } else if (!self.options.device) {
      return parse
    } else {
      return parseDevice
    }

    function parse (str, preset) {
      var m = regexp.exec(str)
      if (!m) { return null }

      preset = preset || {}
      var
        family = (obj.family ? replaceMatches(obj.family, m) : m[1]) || preset.family,
        major = (obj.v1 ? replaceMatches(obj.v1, m) : m[2]) || preset.major,
        minor = (obj.v2 ? replaceMatches(obj.v2, m) : m[3]) || preset.minor,
        patch = (obj.v3 ? replaceMatches(obj.v3, m) : m[4]) || preset.patch,
        type = (obj.type ? replaceMatches(obj.type, m) : undefined) || preset.type,
        patchMinor,
        ret
      if (self.options.usePatchMinor) {
        patchMinor = (obj.v4 ? replaceMatches(obj.v4, m) : m[5]) || preset.v4 || null
      }
      ret = new UA(family, major, minor, patch, patchMinor, type, obj.debug)

      if (obj.preset) ret.preset = true
      return ret
    }

    function parseDevice (str, preset) {
      var m = regexp.exec(str)
      if (!m) { return null }

      preset = preset || {}
      var
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
    var
      regexp = _regexp(obj),
      parsers = (obj.group || []).map(_make)

    function parseGroup (str, preset) {
      var m = regexp.exec(str)
      if (!m) { return null }

      return _parse(parsers, str, preset)
    }

    return parseGroup
  }

  function _parse (parsers, str, preset) {
    var obj, length, i

    for (i = 0, length = parsers.length; i < length; i++) {
      obj = parsers[i](str, preset)
      if (obj) {
        if (obj.preset) {
          preset = assign(preset, obj)
        } else {
          break
        }
      }
    }
    return obj
  }

  parsers = (regexes || []).map(_make)

  self.parse = function (str) {
    var obj

    str = (str || '').toString().substr(0, 500)
    obj = _parse(parsers, str, {})

    if (!self.options.device) {
      return new UA(obj)
    } else {
      return new Device(obj)
    }
  }

  return self
}

module.exports = parser
