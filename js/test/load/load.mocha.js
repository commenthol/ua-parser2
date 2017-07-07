'use strict'

/* global describe, it */

// Note: These tests here cannot be executed together with the other tests as mocha does not have a defined execution order

var
  assert = require('assert'),
  path = require('path'),
  fs = require('fs'),
  uaParser = require('../../index')(),
  testcasesM = require('./testcases')/* .testcases */

var
  file = path.resolve(__dirname, '../../../regexes.yaml'),
  testfile = path.resolve(__dirname, 'load-regexes.yaml'),
  testfileWatch = path.resolve(__dirname, 'watch-regexes.yaml'),
  testfileNotExists = path.resolve(__dirname, 'does-not-exist.yaml')

function run (testcases) {
  testcases = testcases || testcasesM.testcases
  testcases.forEach(function (tc) {
    it('- ' + tc.string, function () {
      var uaParsed = uaParser.parse(tc.string)
      assert.deepEqual(uaParsed, tc)
      // ~ console.log(JSON.stringify(uaParsed));
    })
  })
}

function copySync (src, dest) {
  var content = fs.readFileSync(src, 'utf-8')
  fs.writeFileSync(dest, content, 'utf-8')
}

describe('load regexes', function () {
  it('- load custom regexes file', function () {
    var error = uaParser.loadSync({ file: file, backwardsCompatible: false })
    assert.equal(error, null)
    run()
  })

  it('- not existing', function () {
    var error = uaParser.loadSync(testfileNotExists)
    assert.ok(/ENOENT/.test(error.message))
  })

  it('- async load not existing', function (done) {
    uaParser.load(testfileNotExists, function (error) {
      assert.ok(/ENOENT/.test(error.message))
      done()
    })
  })

  it('- async load existing', function (done) {
    uaParser.load(testfile, function (error) {
      assert.equal(error, null)
      run()
      done()
    })
  })
})

describe('watch tests', function () {
  it('- async watch existing', function (done) {
    this.timeout(10000)

    copySync(file, testfileWatch)
    run(testcasesM.testcasesRegexes)

    uaParser.watch(testfileWatch, function (error) {
      fs.unwatchFile(testfileWatch)
      assert.equal(error, null)
      run()
      done()
    })

    setTimeout(function () {
      copySync(testfile, testfileWatch)
    }, 10)
  })
})
