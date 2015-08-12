/**
 * handle yaml file operations
 * @license MIT
 * @copyright 2015 commenthol@gmail.com
 */

'use strict';

var fs = require('fs'),
	yaml = require('js-yaml');

var file = {

	/**
	 * sync loading of `filename`
	 * @throws {Error} if filename not found or on parsing errors
	 * @param {String} filename - yaml filename
	 * @return {Object} - parsed contents
	 */
	loadSync: function(filename) {
		var obj,
			content;

		content = fs.readFileSync(filename, 'utf8');
		if (content) {
			obj = JSON.parse(content);
		}
		return obj;
	},

	/**
	 * @callback loadCallback
	 * @param {Error} error - error or null
	 * @param {Object} obj - parsed contents
	 */
	/**
	 * async loading of filename
	 * @param {String} filename - yaml filename
	 * @param {loadCallback} callback
	 */
	load: function(filename, callback) {
		fs.readFile(filename, 'utf8', function (error, content){
			var obj;

			if (!error && content) {
				try {
					obj = JSON.parse(content);
				}
				catch (e) {
					error = e;
				}
			}
			if (callback) callback(error, obj);
		});
	},

	/**
	 * watch filename for changes
	 * @param {String} filename - yaml filename
	 * @param {Function} callback
	 */
	watch: function(filename, callback) {
		fs.watchFile(filename, function (curr, prev){
			if (curr.mtime === prev.mtime) {
				return;
			}
			if (callback) callback();
		});
	},

	/**
	 * file handlers with yaml parsing
	 */
	yaml: {
		/**
		 * sync loading of `filename` with yaml parse
		 * @throws {Error} if filename not found or on parsing errors
		 * @param {String} filename - path to `filename`
		 * @return {Object} parsed content
		 */
		loadSync: function(filename) {
			return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
		},

		/**
		 * load `regexes` together with `models`
		 * @throws {Error} if filename not found or on parsing errors
		 * @param {String} regexes - path to `regexes.yaml file
		 * @param {String} models - path to `models.yaml file
		 * @return {Object} parsed content
		 */
		loadFilesSync: function(regexes, models) {
			var obj = {};
			obj = file.yaml.loadSync(regexes);
			obj.device_models =	file.yaml.loadSync(models).device_models;
			return obj;
		}
	}
};

module.exports = file;
