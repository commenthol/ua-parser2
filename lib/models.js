/**
 * @module models.js
 * @license MIT
 * @copyright 2015 commenthol@gmail.com
 */

'use strict';

var extend = require('util')._extend;

/**
 *
 * @param {Object} deviceModels -
 */
function models(deviceModels) {

	var self = {};

	/**
	 * preparation of deviceModels
	 * create references where possible and
	 * allow lowercase matching in deviceModels
	 */
	var _prep = function() {
		var brand,
			model;

		if (deviceModels) {
			for (brand in deviceModels) {
				// create reference with known device model
				for (model in deviceModels[brand]) {
					_ref(brand, model);
				}
				// make lowercase
				for (model in deviceModels[brand]) {
					// create reference
					if (! deviceModels[brand][model.toLowerCase()]) {
						deviceModels[brand][model.toLowerCase()] = deviceModels[brand][model];
					}
				}
			}
		}
	};

	/**
	 * assign data set as reference
	 * @throws
	 */
	var _ref = function (brand, model) {
		var
			device,
			tmpB = brand,
			tmpM = model;

		// max depth is 5
		for (var i=5; i>0; i--) {
			device = deviceModels[tmpB][tmpM] || {};

			// exit condition: brand and model do not change any more
			if (tmpB === device.brand &&
				tmpM === device.model
			){
				deviceModels[brand][model] = deviceModels[device.brand][device.model];
				return;
			}

			device.brand = device.brand || tmpB;
			device.model = device.model || tmpM;

			if (device.brand &&
				device.model &&
				deviceModels[device.brand] &&
				deviceModels[device.brand][device.model]
			){
				tmpB = device.brand;
				tmpM = device.model;
			}
		}
		throw new Error('Recursion Issue: "' + brand + '" "' + model + '"');
	};

	/**
	 * lookup the device in deviceModels object
	 * @param {String} brand
	 * @param {Object} model
	 * @return {Object}
	 */
	var _lookup = function(brand, model) {
		var o;

		if (!model || !brand) return;

		// lookup
		if (deviceModels[brand]) {
			o = deviceModels[brand][model];
			if (!o) {
				// try again with lowercase
				o = deviceModels[brand][model.toLowerCase()];
			}
			if (o) {
				return extend({}, o);
			}
		}
	};

	/**
	 * char cleanup in `model` for later lookup
	 * @param {String} model
	 * @return {String}
	 */
	self.cleanup = function(model) {
		// cleanup
		return (model||'')
			.replace(/[_/]/g, ' ')
			.trim();
	};

	/**
	 * lookup device in deviceModels
	 * @param {Object} device
	 * @param {Object} device.brand - brand of device
	 * @param {Object} device.model - model of device
	 * @return {Object} looked-up device
	 */
	self.parse = function(device) {
		var o;

		if (device.brand && device.model && deviceModels[device.brand]) {
			device.model = self.cleanup(device.model);

			o = _lookup(device.brand, device.model);
			if (o) {
				o.model = device.model;
				device = extend(device, o);
				if (device.debug) {
					device.debug += ' #M';
				}
			}
		}
		return device;
	};

	_prep();

	return self;
}

module.exports = models;
