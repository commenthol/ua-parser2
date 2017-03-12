'use strict'

function Device (family, brand, model, type, debug) {
  if (family && typeof family === 'object') {
    brand = family.brand
    model = family.model
    type = family.type
    debug = family.debug
    family = family.family
  }
  this.family = family || 'Other'
  this.brand = brand || null
  this.model = model || null
  if (typeof type !== 'undefined') { this.type = type || null }
  if (typeof debug !== 'undefined') { this.debug = debug || null }
}

Device.prototype.toString = function () {
  var output = ''
  if (this.brand !== null) {
    output += this.brand
    if (this.model !== null) {
      output += ' ' + this.model
    }
  } else if (this.family) {
    output = this.family
  }
  return output
}

module.exports = Device
