'use strict'

/* global describe, it */

var
  assert = require('assert'),
  fs = require('fs'),
  path = require('path'),
  splitLine = require('streamss').SplitLine,
  jsonArray = require('streamss').JsonArray,
  through = require('streamss').Through,
  helper = require('./lib/helper'),
  parser = require('../')()

var
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
  var
    res,
    exp

  exp = helper.compact.unstrip(obj)

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
      .pipe(splitLine({chomp: true}))
      .pipe(jsonArray.parse())
      .pipe(through.obj(test, function () {
        testDone()
      })
      )
  })
})
