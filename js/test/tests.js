'use strict'

/* global describe, it */
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const SplitLine = require('streamss').SplitLine
const jsonArray = require('streamss').JsonArray
const throughObj = require('streamss').throughObj
const helper = require('./lib/helper')
const parser = require('../')()

const
  config = {
    tests: path.resolve(__dirname, '../../test_resources/tests.json'),
    fasttests: path.resolve(__dirname, '../../test_resources/quick-tests.json')
  }

function msg (name, actual, expected, string) {
  string = (string ? string + '\n' : '')
  return string + name +
    '\n     is: ' + JSON.stringify(actual) +
    '\n should: ' + JSON.stringify(expected)
}

function test (obj, encoding, done) {
  let res
  const exp = helper.compact.unstrip(obj)

  describe('', function () {
    it(exp.string, function () {
      res = parser.parse(exp.string);

      ['ua', 'os', 'engine', 'device'].forEach(function (p) {
        if (p === 'os') {
          res[p].patchMinor = res[p].patchMinor || null
        }
        assert.deepEqual(res[p], exp[p], msg(p, res[p], exp[p]/*, exp.string */))
      })
    })
  })

  done()
}

if (!fs.existsSync(config.tests)) {
  config.tests = config.fasttests
}

describe('tests', function () {
  this.timeout(50000)

  it('exec', function (testDone) {
    fs.createReadStream(config.tests)
      .pipe(new SplitLine({ chomp: true }))
      .pipe(jsonArray.parse())
      .pipe(throughObj(test, function () {
        testDone()
      })
      )
  })
})
