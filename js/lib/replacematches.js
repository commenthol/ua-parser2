'use strict';

module.exports = function multiReplace(str, m) {
  return str.replace(/\$(\d)/g, function(tmp, i) {
    return m[i] || '';
  }).trim();
}
