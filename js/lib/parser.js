'use strict';

var
	UA = require('./ua'),
	Device = require('./device');

function replaceMatches(str, m) {
  return str.replace(/\${(\d+)}|\$(\d+)/g, function(tmp, i, j) {
    return m[(i||j)] || '';
  }).trim();
};

function parser (regexes, options) {
	var
		parsers,
		self = {};

	self.options = options || {};

	function _make(obj) {
		var
			regexp = (obj.regex_flag ? new RegExp(obj.regex, obj.regex_flag) : new RegExp(obj.regex));

		if (obj.group) {
			return _makeGroup(obj);
		}
		else if (! self.options.device) {
			return parse;
		}
		else {
			return parseDevice;
		}

		function parse (str) {
			var m = str.match(regexp);
			if (!m) { return null; }

			var
				family = obj.family ? replaceMatches(obj.family, m) : m[1],
				major  = obj.v1     ? replaceMatches(obj.v1    , m) : m[2],
				minor  = obj.v2     ? replaceMatches(obj.v2    , m) : m[3],
				patch  = obj.v3     ? replaceMatches(obj.v3    , m) : m[4],
				type   = obj.type   ? replaceMatches(obj.type  , m) : undefined,
				patchMinor;

			if (self.options.usePatchMinor) {
				patchMinor = (obj.v4 ? replaceMatches(obj.v4, m) : m[5]) || null;
			}
			return new UA(family, major, minor, patch, patchMinor, type, obj.debug);
		}

		function parseDevice (str) {
			var m = str.match(regexp);
			if (!m) { return null; }

			var
				family = obj.device ? replaceMatches(obj.device, m) : m[1],
				brand  = obj.brand  ? replaceMatches(obj.brand , m) : null,
				model  = obj.model  ? replaceMatches(obj.model , m) : m[1],
				type   = obj.type   ? replaceMatches(obj.type  , m) : undefined;

			return new Device(family, brand, model, type, obj.debug);
		}
	}

	function _makeGroup(obj) {
		var
			regexp = (obj.regex_flag ? new RegExp(obj.regex, obj.regex_flag) : new RegExp(obj.regex)),
			parsers = (obj.group||[]).map(_make);

		function parseGroup (str) {
			var m = str.match(regexp);
			if (!m) { return null; }

			var
				i, length, obj;

			if (typeof str === 'string') {
				for (i = 0, length = parsers.length; i < length; i++) {
					obj = parsers[i](str);
					if (obj) { return obj; }
				}
			}
		}
		return parseGroup;
	}

	parsers = (regexes||[]).map(_make);

	self.parse = function (str) {
		var obj, length, i;

		if (typeof str === 'string') {
			for (i = 0, length = parsers.length; i < length; i++) {
				obj = parsers[i](str);
				if (obj) { return obj; }
			}
		}
		if (! self.options.device) {
			return obj || new UA();
		}
		else {
			return obj || new Device();
		}
	};

	return self;
}

module.exports = parser;
