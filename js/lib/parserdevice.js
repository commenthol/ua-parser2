'use strict';

var
	Device = require('./device'),
	replaceMatches = require('./replacematches');

function parser (regexes, options) {
	var self = {};
	self.options = options || {};

	function _make(obj) {
		var
			regexp        = (obj.regex_flag ? new RegExp(obj.regex, obj.regex_flag) : new RegExp(obj.regex)),
			deviceRep = obj.device,
			brandRep  = obj.brand,
			modelRep  = obj.model,
			typeRep   = obj.type,
			debug     = obj.debug;

		function parse (str) {
			var m = str.match(regexp);
			if (!m) { return null; }

			var
				family = deviceRep ? replaceMatches(deviceRep, m) : m[1],
				brand  = brandRep  ? replaceMatches(brandRep, m)  : null,
				model  = modelRep  ? replaceMatches(modelRep, m)  : m[1],
				type   = typeRep   ? replaceMatches(typeRep, m)   : undefined;

			return new Device(family, brand, model, type, debug);
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
			var
				i, length, obj,
				m = str.match(regexp);
			if (!m) { return null; }

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

		return obj || new Device();
	};

	return self;
}

module.exports = parser;
