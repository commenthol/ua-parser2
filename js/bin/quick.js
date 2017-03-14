#!/usr/bin/env node

/**
 * generate quick tests
 * @license MIT
 * @copyright 2015 commenthol
 */

var fs = require('fs'),
  path = require('path'),
  splitLine = require('streamss').SplitLine,
  through = require('streamss').Through

var config = {
  each: 500,
  testResources: path.resolve(__dirname, '../../test_resources'),
  in: 'tests.json',
  out: 'quick-tests.json'
}

var streamIn = path.resolve(config.testResources, config.in)
var streamOut = path.resolve(config.testResources, config.out)
var count = config.each

function select (line, encoding, done) {
  if (count-- <= 1) {
    count = config.each
    this.push(line)
  }
  done()
}

fs.createReadStream(streamIn, { encoding: 'utf8' })
  .pipe(splitLine({chomp: false}))
  .pipe(through(select))
  .pipe(fs.createWriteStream(streamOut, { flags: 'w', encoding: 'utf8' }))
