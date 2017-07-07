/*!
 * Collection of utilities for tools and test-cases
 * @copyright (c) 2014 commenthol
 * @license MIT
 */

/* jshint loopfunc:true */

'use strict'

var
  parser = require('../../')()

var M = {}

/**
 * Merges multiple objects from 1..n object sources.
 * 
 * The resulting object is a deep clone of all objects provided.
 * null objects do not merged into an already existing object.
 *
 * Example
 * ```
 * var source1 = { a: { a:1, b:1 } } ;
 * var source2 = { a: { c: { a: true } }, b: { b:2, c:2 } };
 * var source3 = { a: { b:3, d:3 } };
 * var result = merge (source1, source2, source3);
 * result = { a: { a: 1, c: { a: true }, b: 3, d: 3 }, b: { b: 2, c: 2 } };
 * ```
 * 
 * @param  {Object} source1 .. sourceN
 * @return {Object}
 */
function merge () {
  var
    i, j, k,
    target = {}
  for (i in arguments) {
    for (j in arguments[i]) {
      if (arguments[i].hasOwnProperty(j)) {
        if (arguments[i][j] !== null && typeof (arguments[i][j]) === 'object') {
          if (arguments[i][j] instanceof Array) {
            if (!target[j]) {
              target[j] = []
            }
            for (k = 0; k < arguments[i][j].length; k += 1) {
              target[j].push(arguments[i][j][k])
            }
          } else {
            target[j] = merge(target[j], arguments[i][j])
          }
        } else if (arguments[i][j] === null && target[j]) {
          // do nothing
        } else {
          target[j] = arguments[i][j]
        }
      }
    }
  }
  return target
}

/**
 * Compacts a UA parser object to keep information for test-cases small
 */
var compact = {
  /**
   * Default uaparser result for an empty user-agent.
   * @api private
   */
  _empty: parser.parse(''),
  /**
   * Delete all properties of the UAParser object without a significant
   * parsing result
   * @param {Object} ua : UAParser object
   * @return {Object} compacted UAParser object
   * @api public
   */
  strip: function (ua) {
    if (ua) {
      for (var p1 in ua) {
        if (ua[p1] && ua[p1].family === 'Other') {
          delete (ua[p1])
        } else {
          ['major', 'minor', 'patch', 'patchMinor', 'brand', 'model'].forEach(function (p2) {
            if (ua[p1] && ua[p1][p2] === null) {
              delete (ua[p1][p2])
            }
          })
        }
      }
    }
    return ua
  },
  /**
   * Adds all properties to the UAParser object back again
   * @param {Object} ua : compacted UAParser object
   * @return {Object} normal UAParser object
   * @api public
   */
  unstrip: function (ua) {
    return merge(this._empty, { os: { patchMinor: null } }, ua)
  }
}

/// exports
M.merge = merge
M.compact = compact
module.exports = M
