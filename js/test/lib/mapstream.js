/**
 * A Stream Transformer executing a map function
 * 
 * @copyright (c) 2014 commenthol
 * @licence MIT
 */

'use strict';

var
	util = require('util'),
	Transform = require('stream').Transform;

/**
 * @param {Object} options
 * @param {Function} options.onfinish : function to execute on `finish` stream event
 * @param {Function} options.map (obj, encoding, done) : function to execute on each `_transform` event;
 * - {Object} obj : the object from the stream.
 * - done : needs to be called as callback within the `map` function.
 *
 * example
 * ```
 * function mymap (obj, encoding, done) {
 *   console.log(obj);
 *   done();
 * }
 * 
 * fs.createReadStream('file.json')
 *   .pipe(new JsonStream())  // transform each line into a JSON object
 *   .pipe(new MapStream({ map: mymap }));
 * ```
 */ 
function MapStream(options) {
	if (!(this instanceof MapStream)) {
		return new MapStream(options);
	}
	var self = this;

	Transform.call(self, {
		objectMode: options.objectMode || true,
		decodeStrings: options.decodeStrings || false
	}); 

	this.options = options || {};

	this.on('pipe', function(src){
		src.on('error', function(err) {
			self.emit('error', err);
		});
	});

	this.on('finish', function() {
		if (self.options.onfinish) {
			self.options.onfinish();
		}
	});
	
	return this;
}

util.inherits(MapStream, Transform);

MapStream.prototype._transform = function(obj, encoding, done) {
	var self = this;
	if (this.options.map) {
		this.options.map.call(this, obj, encoding, function(err){
			if (err) {
				self.emit('err', err);
			}
			done();
		});
	}
	else {
		this.push(obj);
		done();
	}
};

MapStream.prototype._flush = function(done) {
	done();
};

module.exports = MapStream;
