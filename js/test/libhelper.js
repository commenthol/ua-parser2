'use strict'

/* global describe, it */

var
  assert = require('assert'),
  helper = require('./lib/helper')

describe('#compact', function () {
  var
    org = {'ua': {'family': 'NCSA Mosaic', 'major': null, 'minor': null, 'patch': null}, 'engine': {'family': 'Other', 'major': null, 'minor': null, 'patch': null}, 'os': {'family': 'Other', 'major': null, 'minor': null, 'patch': null, 'patchMinor': null}, 'device': {'family': 'Other', 'brand': null, 'model': null}, 'string': 'Mozilla/1.0 (compatible; NCSA Mosaic; Atari 800-ST)'},
    com = {'ua': {'family': 'NCSA Mosaic'}, 'string': 'Mozilla/1.0 (compatible; NCSA Mosaic; Atari 800-ST)'}

  it('strip', function () {
    var
      clone = helper.merge(org),
      res = helper.compact.strip(clone)
    assert.deepEqual(res, com)
  })

  it('unstrip', function () {
    var
      res = helper.compact.unstrip(com)
    assert.deepEqual(res, org)
  })
})
