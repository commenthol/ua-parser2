#!/usr/bin/env node

/**
 * generate quick tests
 * @license MIT
 * @copyright 2015 commenthol
 */

const fs = require('fs')
const path = require('path')
const { SplitLine, through } = require('streamss')

const config = {
  each: 500,
  testResources: path.resolve(__dirname, '../../test_resources'),
  in: 'tests.json',
  out: 'quick-tests.json'
}

const streamIn = path.resolve(config.testResources, config.in)
const streamOut = path.resolve(config.testResources, config.out)
let count = config.each

function select (line, encoding, done) {
  if (count-- <= 1) {
    count = config.each
    this.push(line)
  }
  done()
}

fs.createReadStream(streamIn, { encoding: 'utf8' })
  .pipe(new SplitLine({ chomp: false }))
  .pipe(through(select))
  .pipe(fs.createWriteStream(streamOut, { flags: 'w', encoding: 'utf8' }))
