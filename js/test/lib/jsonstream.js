/**
 * A combined line splitting and JSON parse Stream Transformer
 * 
 * @copyright (c) 2014 commenthol
 * @licence MIT
 */

'use strict';

var
	util = require('util'),
	Transform = require('stream').Transform;

function JsonStream(options) {
	if (!(this instanceof JsonStream)) {
		return new JsonStream(options);
	}
	var self = this;

	Transform.call(self, { decodeStrings: false }); 

	this._writableState.objectMode = false;
  this._readableState.objectMode = true;

	this.options = options || {};
	this.buffer = '';
	this.matcher = this.options.matcher || /\r?\n/;

	this.on('pipe', function(src){
		src.on('error', function(err) {
			self.emit('error', err);
		});
	});

	return this;
}

util.inherits(JsonStream, Transform);

JsonStream.prototype.emitLines = function(chunk) {
	var
		lines;

	if (chunk) {
		lines = (this.buffer + chunk).split(this.matcher);

		this.buffer = lines.pop();

		for (var i = 0; i < lines.length; i++) {
			this.parse(lines[i]);
		}
	}
};

JsonStream.prototype.parse = function (line) {
	var res;

	line = (line || '').replace(/,\s*$/, '');
	if (/^\s*$/.test(line)) {
		return;
	}
	
	try {
		res = JSON.parse(line);
	}
	catch(e) {
		console.error('error parsing: "' + line + '" : ' + e.toString());
		return;
	}

	this.push(res);
};

JsonStream.prototype._transform = function(chunk, encoding, done) {
	this.emitLines(chunk);
	done();
};

JsonStream.prototype._flush = function(done) {
	this.parse(this.buffer);
	done();
};

module.exports = JsonStream;
