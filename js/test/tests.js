'use strict';

/* global describe, it */

var
	assert = require('assert'),
	fs = require('fs'),
	JsonStream = require('./lib/jsonstream'),
	MapStream = require('./lib/mapstream'),
	helper = require('./lib/helper'),
	parser = require('../')();

var
	config = {
		tests: __dirname + '/../../test_resources/tests.json'
		//~ tests: __dirname + '/../../test_resources/x.json'
	};

function msg(name, actual, expected, string) {
	string = (string ? string + '\n' : '' );
	return string + name + 
		"\n     is: " + JSON.stringify(actual) +
		"\n should: " + JSON.stringify(expected);
}

function test(obj, encoding, done) {
	var
		res,
		exp;

	exp = helper.compact.unstrip(obj);

	describe('', function(){
		it(exp.string, function(){

			res = parser.parse(exp.string);

			['ua', 'os', 'engine', 'device'].forEach(function(p){
				if (p === 'os') {
					res[p].patchMinor = res[p].patchMinor || null;
				}
				assert.deepEqual(res[p], exp[p], msg(p, res[p], exp[p]/*, exp.string*/));
			});

		});
	});

	done();
}


describe('tests', function(){
	this.timeout(500000);
	
	it('exec', function(done){
		fs.createReadStream(config.tests)
			.pipe(new JsonStream())
			.pipe(new MapStream({ map: test, onfinish: done }));
	});
});
