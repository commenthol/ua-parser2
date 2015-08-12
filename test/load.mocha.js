"use strict";

/* global describe, it, before */

// Note: These tests here cannot be executed together with the other tests as mocha does not have a defined execution order

var
	assert = require('assert'),
	fs = require('fs'),
	yaml = require('./lib/yaml'),
	uaParserM = require('../index');

var
	uaParser,
	file              = __dirname + '/fixtures/rules.json',
	testfile          = __dirname + '/fixtures/load-rules.json',
	testfileWatch     = __dirname + '/fixtures/watch-rules.json',
	testfileNotExists = __dirname + '/fixtures/does-not-exist.json';

function once() {
	var
		i,
		obj,
		device_Models = yaml.load(__dirname + '/fixtures/models.yaml'),
		files = {
			'regexes.yaml': file,
			'load-regexes.yaml': testfile,
			'watch-regexes.yaml': testfileWatch
		};

	for (i in files) {
		obj = yaml.load(__dirname + '/fixtures/' + i);
		obj.device_Models = device_Models;
		yaml.saveJson(files[i], obj);
	}
}
//~ return once();

function run(type) {
	type = type || 'NORMAL';
	var ua = "user-agent";
	var uaParsed = uaParser.parse(ua);
	assert.equal(uaParsed.ua.family, type);
	assert.equal(uaParsed.os.family, type);
	assert.equal(uaParsed.device.family, type);
	//~ console.log(JSON.stringify(uaParsed));
}

function copySync(src, dest) {
	var content = fs.readFileSync(src, 'utf-8');
	fs.writeFileSync(dest, content, 'utf-8');
}

describe("load regexes", function(){

	before(function(){
		uaParser = uaParser || uaParserM(file);
	});

	it('- load custom regexes file', function(){
		var error = uaParser.loadSync({ file: file });
		assert.equal(error, null);
		run();
	});

	it("- not existing", function(){
		var error = uaParser.loadSync(testfileNotExists);
		assert.ok(/ENOENT/.test(error.message));
	});

	it("- async load not existing", function(done){
		uaParser.load(testfileNotExists, function(error){
			assert.ok(/ENOENT/.test(error.message));
			done();
		});
	});

	it("- async load existing", function(done){
		uaParser.load(testfile , function(error){
			assert.equal(error, null);
			run('TEST');
			done();
		});
	});
});

describe ("watch tests", function(){

	before(function(){
		uaParser = uaParser || uaParserM(file);
	});

	it("- async watch existing", function(done){
		this.timeout(10000);

		copySync(file, testfileWatch);
		uaParser.loadSync(testfileWatch);
		run();

		uaParser.watch(testfileWatch , function(error){
			fs.unwatchFile(testfileWatch);
			assert.equal(error, null);
			run('TEST');
			done();
		});

		setTimeout(function(){
			copySync(testfile, testfileWatch);
		}, 10);

	});
});
