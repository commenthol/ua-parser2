#!/usr/bin/env node

/*!
 * add or remove debug info to the regexes.yaml file
 *
 * if debug info is within the regexes.yaml file it is being removed
 * otherwise added.
 */

'use strict'

/**
 * Module dependencies
 */
var
  fs = require('fs'),
  path = require('path')

/**
 * Module variables
 */
var regexes = path.resolve(__dirname, '../../regexes.yaml')

/**
 * add leading zeros
 *
 * @param  {Integer} n: number
 * @param  {Integer} length: length of output string
 * @return {String}  String of length `length` containing Number with
 *                   leading zeros
 */
function addZeros (n, length) {
  var str = '' + n
  var z = '00000000'
  if (str.length >= length) {
    return str
  }
  return z.substr(0, length - str.length) + str
}

/**
 * add debug info
 *
 * @param {Boolean}  add: true: add debuginfo, false: remove debuginfo
 *                   if undefined toggle.
 * @return {Boolean} true: file changed, false: file remains unchanged
 */
function main (add) {
  var data = fs.readFileSync(regexes, 'utf8')
  var cnt = 0
  var hasDebugInfo = false

  if (/^\s*debug:\s*'[^']*'/m.test(data)) {
    hasDebugInfo = true
  }

  if ((add === true && hasDebugInfo === true) ||
      (add === false && hasDebugInfo === false)) {
    return false
  }

  // write a backup - for any cases
  fs.writeFileSync(regexes + '.bak', data, 'utf8')

  // delete all debug lines
  data = data.replace(/^\s*debug:\s*'[^']*'[ \t]*\n/mg, '')

  // add debug info
  if (!hasDebugInfo) {
    data = data.replace(/(^[ \t]*)(- regex:\s*'[^']*'[ \t]*)/mg, function (m, m1, m2) {
      return m1 + m2 + '\n' + m1 + "  debug: '#" + addZeros(++cnt, 4) + "'"
    })
    console.log('\n    debug info added to regexes.yaml\n')
  } else {
    console.log('\n    debug info removed from regexes.yaml\n')
  }

  fs.writeFileSync(regexes, data, 'utf8')

  return true
}

module.exports = main

if (require.main === module) {
  main()
}
