'use strict'

var path = require('path'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  assign = Object.assign || require('util')._extend // eslint-disable-line

/**
 * ua-parser
 *
 * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
 * @property {string} options.file - filename used as regexes file.
 */
module.exports = function (options) {
  var
    uaParser = {},
    dummy = function () {}, // prevent exception if parsers are not yet fully loaded
    parseUA = dummy,
    parseEngine = dummy,
    parseOS = dummy,
    parseDevice = dummy,
    config = {
      async: false,
      file: path.join(__dirname, '..', 'regexes.yaml')
    }

  /**
   * Parse the User-Agent string `str` for User-Agent
   *
   * @param {string} str - Browsers User-Agent string
   * @return {Object} - { family:, major:, minor:, patch: }
   */
  uaParser.parseUA = function (str) {
    return parseUA(str)
  }

  /**
   * Parse the User-Agent string `str` for Engine
   *
   * @param {string} str - Browsers User-Agent string
   * @return {Object} - { family:, major:, minor:, patch: }
   */
  uaParser.parseEngine = function (str) {
    return parseEngine(str)
  }

  /**
   * Parse the User-Agent string `str` for Operating System
   *
   * @param {string} str - Browsers User-Agent string
   * @return {Object} - { family:, major:, minor:, patch:, patchMinor: }
   */
  uaParser.parseOS = function (str) {
    return parseOS(str)
  }

  /**
   * Parse the User-Agent string `str` for Device
   *
   * @param {string} str - Browsers User-Agent string
   * @return {Object} { family:, brand:, model: }
   */
  uaParser.parseDevice = function (str) {
    return parseDevice(str)
  }

  /**
   * Parse the User-Agent string `str` for User-Agent, Operating System, Device
   *
   * @param {string} str - Browsers User-Agent string
   * @return {Object} - { family:, brand:, model: }
   */
  uaParser.parse = function (str) {
    var
      ua = uaParser.parseUA(str),
      engine = uaParser.parseEngine(str),
      os = uaParser.parseOS(str),
      device = uaParser.parseDevice(str)

    return {
      ua: ua,
      engine: engine,
      os: os,
      device: device,
      string: str
    }
  }

  /*
   * Create the different parsers
   * @private
   * @param {Object} regexes - The regexes pattern objects
   */
  function createParsers (regexes) {
    var error = null

    if (regexes) {
      var pattern = regexes.pattern
      parseUA = require('./lib/parser')(
        regexes.user_agent_parsers, {pattern: pattern}).parse || dummy
      parseEngine = require('./lib/parser')(
        regexes.engine_parsers, {pattern: pattern}).parse || dummy
      parseOS = require('./lib/parser')(
        regexes.os_parsers, {pattern: pattern, usePatchMinor: true}).parse || dummy
      parseDevice = require('./lib/parser')(
        regexes.device_parsers, {pattern: pattern, device: true}).parse || dummy
    } else {
      error = new Error('bad regexes')
    }

    return error
  };

  /*
   * Set some options persistently
   * @private
   * @param {Object} options
   */
  function setOptions (options) {
    var i

    options = assign(config, options)

    for (i in config) {
      if (i !== 'file' && options[i]) {
        config[i] = options[i]
      }
    }

    return options
  };

  /**
   * Synchronously load the ua-parsers regexes file
   *
   * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
   * @property {string} options.file - filename used as regexes file.
   * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
   * @return {Boolean} true if file was loaded otherwise false.
   */
  uaParser.loadSync = function (options) {
    var
      regexes,
      contents,
      error = null

    if (typeof options === 'string') {
      options = { file: options }
    }

    options = setOptions(options)

    if (fs.existsSync(options.file)) {
      contents = fs.readFileSync(options.file, 'utf8')

      if (contents) {
        try {
          regexes = yaml.safeLoad(contents)
          error = createParsers(regexes)
        } catch (e) {
          error = e
        }
      } else {
        error = new Error('no content found in ' + options.file)
      }
    } else {
      error = new Error('ENOENT, open \'' + options.file + '\'')
    }

    return error
  }

  /**
   * Asynchronously load the ua-parsers regexes file
   *
   * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
   * @property {string} options.file - filename used as regexes file.
   * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
   * @param {Function} callback - callback(error)
   */
  uaParser.load = function (options, callback/* (error) */) {
    if (typeof options === 'string') {
      options = { file: options }
    } else if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = setOptions(options)

    fs.readFile(options.file, 'utf8', function (error, contents) {
      if (!error && contents) {
        try {
          var regexes = yaml.safeLoad(contents)
          error = createParsers(regexes)
        } catch (e) {
          error = e
        }
      }

      if (callback) callback(error)
    })
  }

  /**
   * Watch a regexes file and reload if there are any changes
   *
   * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
   * @property {string} options.file - filename used as regexes file.
   * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
   * @param {Function} callback - callback(error)
   */
  uaParser.watch = function (options, callback/* (error) */) {
    if (typeof options === 'string') {
      options = { file: options }
    } else if (typeof options === 'function') {
      callback = options
      options = {}
    }

    options = setOptions(options)

    fs.watchFile(options.file, function (curr, prev) {
      if (curr.mtime === prev.mtime) {
        if (callback) callback(null)
        return
      }
      if (callback) uaParser.load(options, callback)
    })
  }

  options = setOptions(options)
  if (!config.async) {
    var err = uaParser.loadSync(options)
    if (err) {
      console.error(err)
    }
  }

  return uaParser
}
