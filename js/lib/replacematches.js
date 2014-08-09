'use strict';

module.exports = function multiReplace(str, m) {
  return str.replace(/\${(\d+)}|\$(\d+)/g, function(tmp, i, j) {
    return m[(i||j)] || '';
  }).trim();
};
