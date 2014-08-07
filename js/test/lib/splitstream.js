/**
 * A splitting lines Stream Transformer
 * 
 * @copyright (c) 2014 commenthol
 * @licence MIT
 */

'use strict';

var
	util = require('util'),
	Transform = require('stream').Transform;

function SplitStream(options) {
	if (!(this instanceof SplitStream)) {
		return new SplitStream(options);
	}
	var self = this;

	Transform.call(self, { encoding: 'utf8' });

	this.options = options || {};
	this.buffer = '';
	this.matcher = this.options.matcher || /\r?\n/;

	this.on('pipe', function(src){
		src.on('error', function(err) {
		});
	});

	return this;
}

util.inherits(SplitStream, Transform);

SplitStream.prototype.emitLines = function(chunk) {
	var
		lines;

	if (chunk) {
		lines = (this.buffer + chunk.toString()).split(this.matcher);

		this.buffer = lines.pop();

		for (var i = 0; i < lines.length; i++) {
			this.push(lines[i]);
		}
	}
};

SplitStream.prototype._transform = function(chunk, encoding, done) {
	this.emitLines(chunk);
	done();
};

SplitStream.prototype._flush = function(done) {
	this.push(this.buffer);
	done();
};

module.exports = SplitStream;
