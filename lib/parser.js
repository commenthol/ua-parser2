/**
 * @module parser.js
 * @license MIT
 * @copyright 2014 commenthol@gmail.com
 */

'use strict';

var
	UA = require('./ua'),
	Device = require('./device');

/**
 * The user-agent parser
 * @param {Object} regexes - regular expressions from `regexes.yaml`
 * @param {Object} options
 * @return {Object} - parsing functions
 */
function parser (regexes, options) {
	var
		parsers,
		self = {};

	self.options = options || {};

	/**
	 * replace multiple matches
	 * @api private
	 * @param {String} str - String with `$1...$99` replacement placeholders
	 * @param {Array} m - Array of matches
	 * @return {String}
	 */
	function replaceMatches(str, m) {
		return str.replace(/\${(\d+)}|\$(\d+)/g, function(tmp, i, j) {
			return m[(i||j)] || '';
		}).trim();
	}

	/**
	 * create regular expression from String
	 * @api private
	 * @param {Object} obj
	 * @param {String} obj.regex - regular expression source
	 * @param {String} [obj.regex_flag] - allowed flags 'i', 'g'
	 */
	function _regexp(obj) {
		return (obj.regex && obj.regex_flag ? new RegExp(obj.regex, obj.regex_flag) : new RegExp(obj.regex));
	}

	/**
	 * creates the parser map for one regex
	 * @api private
	 * @param {Object} obj
	 * @param {String} obj.regex - regular expression source
	 * @param {String} [obj.regex_flag] - allowed flags 'i'
	 * @param {String} [obj.group] - regex parsing group
	 * @return {Function} - parsing function for this regex type
	 */
	function _make(obj) {
		var regexp = _regexp(obj);

		if (obj.group) {
			return _makeGroup(obj);
		}
		else if (typeof obj.replace === 'string') {
			return replace;
		}
		else if (self.options.device) {
			return parseDevice;
		}
		else {
			return parse;
		}

		/**
		 * The parsing function for ua, os, engine
		 * @param {String} str[0] - user-agent string
		 * @return {UA} - user-agent object
		 */
		function parse (str) {
			var m = str[0].match(regexp);
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

		/**
		 * The parsing function for device
		 * @param {String} str[0] - user-agent string
		 * @return {Device} - device object
		 */
		function parseDevice (str) {
			var m = str[0].match(regexp);
			if (!m) { return null; }

			var
				family = obj.family ? replaceMatches(obj.family, m) : m[1],
				brand  = obj.brand  ? replaceMatches(obj.brand , m) : null,
				model  = obj.model  ? replaceMatches(obj.model , m) : m[1],
				type   = obj.type   ? replaceMatches(obj.type  , m) : undefined;

			return new Device(family, brand, model, type, obj.debug);
		}

		/**
		 * A replacement function for all parsers
		 * @param {String} str[0] - user-agent string
		 */
		function replace (str) {
			str[0] = str[0].replace(regexp, obj.replace);
		}
	}

	/**
	 * creates a parsing group
	 * @api private
	 * @param {Object} obj
	 * @param {String} obj.regex - regular expression source
	 * @param {String} [obj.regex_flag] - allowed flags 'i'
	 * @param {String} [obj.group] - regex parsing group
	 * @return {Function} - parsing function for group
	 */
	function _makeGroup(obj) {
		var
			regexp = _regexp(obj),
			parsers = (obj.group||[]).map(_make);

		/**
		 * The parsing function for group
		 * @param {String} str[0] - user-agent string
		 * @return {UA|Device} - user-agent, device object
		 */
		function parseGroup (str) {
			var m = str[0].match(regexp);
			if (!m) { return null; }

			var
				i, length, obj;

			for (i = 0, length = parsers.length; i < length; i++) {
				obj = parsers[i](str);
				if (obj) { return obj; }
			}
		}
		return parseGroup;
	}

	/**
	 * the parsing function
	 * @param {String} str - user-agent string
	 * @return {UA|Device} - user-agent, device object
	 */
	self.parse = function (str) {
		var obj, length, i;

		if (typeof str === 'string') {
			str = [ str ]; // make a reference for the replace function
			for (i = 0, length = parsers.length; i < length; i++) {
				obj = parsers[i](str);
				if (obj) { return obj; }
			}
		}
		if (self.options.device) {
			return obj || new Device();
		}
		else {
			return obj || new UA();
		}
	};

	// create all parser functions
	parsers = (regexes||[]).map(_make);

	return self;
}

module.exports = parser;
