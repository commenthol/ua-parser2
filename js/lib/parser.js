'use strict';

var
	UA = require('./ua'),
	replaceMatches = require('./replacematches');

function parser (regexes, options) {
	var self = {};
	self.options = options || {};

	function _make(obj) {
		var
			regexp        = (obj.regex_flag ? new RegExp(obj.regex, obj.regex_flag) : new RegExp(obj.regex)),
			famRep        = obj.family,
			majorRep      = obj.v1,
			minorRep      = obj.v2,
			patchRep      = obj.v3,
			patchMinorRep = obj.v4,
			typeRep       = obj.type,
			debug         = obj.debug;

		function parse (str) {
			var m = str.match(regexp);
			if (!m) { return null; }

			var
				family = famRep  ? replaceMatches(famRep, m)   : m[1],
				major = majorRep ? replaceMatches(majorRep, m) : m[2],
				minor = minorRep ? replaceMatches(minorRep, m) : m[3],
				patch = patchRep ? replaceMatches(patchRep, m) : m[4],
				type  = typeRep  ? replaceMatches(typeRep, m)  : undefined,
				patchMinor;

			if (self.options.usePatchMinor) {
				patchMinor = (patchMinorRep ? replaceMatches(patchMinorRep, m) : m[5]) || null;
			}
			return new UA(family, major, minor, patch, patchMinor, type, debug);
		}

		if (obj.group) {
			return _makeGroup(obj);
		}
		else {
			return parse;
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

	self.parsers = (regexes||[]).map(_make);

	self.parse = function (str) {
		var obj, length, i;

		if (typeof str === 'string') {
			for (i = 0, length = self.parsers.length; i < length; i++) {
				obj = self.parsers[i](str);
				if (obj) { return obj; }
			}
		}

		return obj || new UA();
	};

	return self;
}

module.exports = parser;
