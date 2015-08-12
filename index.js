"use strict";

var
	file = require('./lib/file'),
	extend = require('util')._extend;

/**
 * ua-parser
 *
 * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
 * @property {string} options.file - filename used as regexes file.
 * @property {string} options.models - filename used as models file.
 */
module.exports = function(options) {

	var
		uaParser = {},
		dummy = function(){}, // prevent exception if parsers are not yet fully loaded
		parseUA = dummy,
		parseEngine = dummy,
		parseOS = dummy,
		parseDevice = dummy,
		parseModel = dummy,
		lookupModel = dummy,
		config = {
			async : false,
		};

	/**
	 * Parse the User-Agent string `str` for User-Agent
	 *
	 * @param {string} str - Browsers User-Agent string
	 * @return {Object} - { family:, major:, minor:, patch: }
	 */
	uaParser.parseUA = function (str) {
		return parseUA(str);
	};

	/**
	 * Parse the User-Agent string `str` for Engine
	 *
	 * @param {string} str - Browsers User-Agent string
	 * @return {Object} - { family:, major:, minor:, patch: }
	 */
	uaParser.parseEngine = function (str) {
		return parseEngine(str);
	};

	/**
	 * Parse the User-Agent string `str` for Operating System
	 *
	 * @param {string} str - Browsers User-Agent string
	 * @return {Object} - { family:, major:, minor:, patch:, patchMinor: }
	 */
	uaParser.parseOS = function (str) {
		return parseOS(str);
	};

	/**
	 * Parse the User-Agent string `str` for Device
	 *
	 * @param {string} str - Browsers User-Agent string
	 * @return {Object} { family:, brand:, model: }
	 */
	uaParser.parseDevice = function (str) {
		var device,
			model;

		device = parseDevice(str);

		if (device.brand && device.brand.indexOf('Generic_') === 0) {
			model = parseModel(device.model);
			if (model.brand) {
				if (device.debug) {
					device.debug += ' ' + model.debug;
				}
				device.brand = model.brand;
				device.model = model.model;
				if (model.type) device.type = model.type;
			}
		}
		device = lookupModel(device);

		return device;
	};

	/**
	 * @api private
	 */
	uaParser._parseModel = function(strModel) {
		return parseModel(strModel);
	};

	/**
	 * @api private
	 */
	uaParser._lookupModel = function(device) {
		return lookupModel(device);
	};

	/**
	 * Parse the User-Agent string `str` for User-Agent, Operating System, Device
	 *
	 * @param {string} str - Browsers User-Agent string
	 * @return {Object} - { family:, brand:, model: }
	 */
	uaParser.parse = function (str) {

		var
			ua     = uaParser.parseUA(str),
			engine = uaParser.parseEngine(str),
			os     = uaParser.parseOS(str),
			device = uaParser.parseDevice(str);

		return {
			ua: ua,
			engine: engine,
			os: os,
			device: device,
			string: str
		};
	};

	/*
	 * Create the different parsers
	 * @private
	 * @param {Object} regexes - The regexes pattern objects
	 */
	function createParsers (regexes) {
		var error;

		if (regexes) {
			parseUA      = require('./lib/parser')(regexes.user_agent_parsers).parse || dummy;
			parseEngine  = require('./lib/parser')(regexes.engine_parsers).parse || dummy;
			parseOS      = require('./lib/parser')(regexes.os_parsers, { usePatchMinor: true }).parse || dummy;
			parseDevice  = require('./lib/parser')(regexes.device_parsers, { device: true }).parse || dummy;
			parseModel   = require('./lib/parser')(regexes.device_model_parsers, { device: true }).parse || dummy;
			lookupModel  = require('./lib/models')(regexes.device_models).parse || dummy;
		}
		else {
			error = new Error('bad regexes');
		}

		return error;
	};

	/*
	 * Set some options persistently
	 * @private
	 * @param {Object} options
	 */
	var setOptions = function (options) {
		var i;

		options = options || {};

		if (typeof options === 'string') {
			options = { file: options };
		}

		if (!options.file) config.file = require('ua-parser2-rules').file;

		options = extend(config, options);

		for (i in config) {
			if (i !== "file" && options[i]) {
				config[i] = options[i];
			}
		}

		return options;
	};

	/**
	 * Synchronously load the ua-parsers regexes file
	 *
	 * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
	 * @property {string} options.file - filename used as regexes file.
	 * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
	 * @return {Boolean} true if file was loaded otherwise false.
	 */
	uaParser.loadSync = function (options) {
		var regexes,
			deviceModels,
			err;

		options = setOptions(options);

		try {
			if (options.regexes && options.models) {
				regexes = file.yaml.loadFilesSync(options.regexes, options.models);
			}
			else {
				regexes = file.loadSync(options.file);
			}
			err = createParsers(regexes);
		}
		catch(e) {
			err = e;
		}

		return err;
	};

	/**
	 * Asynchronously load the ua-parsers regexes file
	 *
	 * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
	 * @property {string} options.file - filename used as regexes file.
	 * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
	 * @param {Function} callback - callback(error)
	 */
	uaParser.load = function (options, callback/*(error)*/) {

		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = setOptions(options);

		file.load(options.file, function(err, regexes) {
			if (err) {
				callback && callback(err);
				return;
			}
			err = createParsers(regexes);
			callback && callback(err);
		});
	};

	/**
	 * Watch a regexes file and reload if there are any changes
	 *
	 * @param {Object|string} options - (optional) if "undefined" than default file is choosen. If string is given than that file is used.
	 * @property {string} options.file - filename used as regexes file.
	 * @property {Boolean} options.backwardsCompatible - set "true" if backwardsCompatible interface is desired
	 * @param {Function} callback - callback(error)
	 */
	uaParser.watch = function (options, callback/*(error)*/) {

		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = setOptions(options);

		file.watch(options.file, function(){
			uaParser.load(options, callback);
		});
	};

	options = setOptions(options);

	if (!config.async) {
		var err = uaParser.loadSync(options);
		if (err) {
			console.error(err);
		}
	}

	return uaParser;
};
