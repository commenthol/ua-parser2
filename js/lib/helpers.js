'use strict'

const DIGITS = /^\d/

exports.startsWithDigit = startsWithDigit

function startsWithDigit (str) {
  return DIGITS.test(str)
}
