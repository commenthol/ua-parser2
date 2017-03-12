'use strict'

/* global describe, it */

var assert = require('assert'),
  helpers = require('../lib/helpers')

describe('Helpers', function () {
  it('startsWithDigit', function () {
    assert.ok(helpers.startsWithDigit('0'))
    assert.ok(helpers.startsWithDigit('1'))
    assert.ok(helpers.startsWithDigit('0a'))
    assert.ok(!helpers.startsWithDigit('a'))
  })
})
