'use strict';

var
	fs = require('fs'),
	yaml = require('js-yaml');

var M = {

	load: function(filename) {
		return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
	},

	loadFiles: function(rules, models) {
		var obj = {};
		obj = M.load(rules);
		obj.device_models =	M.load(models).device_models;
		return obj;
	},

	saveJson: function(filename, obj) {
		return fs.writeFileSync(filename, JSON.stringify(obj, null, '\t'), 'utf8');
	}
}

module.exports = M;