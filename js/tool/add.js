#!/usr/bin/env node

/*!
 * Add new test cases from a txt file containing User-Agent strings to
 * a json based test cases file.
 *
 * If no testcases file is given, the default in "test_resources/tests.json"
 * is choosen for appending the test cases.
 */

'use strict';

var
	fs = require('fs'),
	path = require('path'),
	cmd = require('commander'),
	sh = require("shelljs"),
	SplitStream = require('../test/lib/splitstream'),
	MapStream = require('../test/lib/mapstream'),
	helper = require('../test/lib/helper'),
	parser = require('../')();

var
	pwd = sh.pwd(),
	config = {
		version: '0.0.1',
		params: [ 'ua', 'engine', 'os', 'device' ], /// params to print on console
		testsFile: __dirname + '/../../test_resources/tests.json', /// default tests file
	};

/// the program
cmd
	.version(config.version)
	.option('-u, --useragents <file>', 'Add User-Agents from <file>')
	.option('-t, --tests <file>', 'to tests file <file>')
	.option('-c, --console', 'output details to console')
	.parse(process.argv);

if (cmd.tests) {
	config.testsFile = path.resolve(pwd, cmd.tests);
}
else {
	console.log('\n'+
		'    appending tests to "' + path.relative(pwd, config.testsFile) + '"' +
		'\n');
}

if (! cmd.useragents || /^-/.test(cmd.useragents)) {
	console.error('\n'+
		'    specify user-agents file with "-u <file>".\n' +
		'    exiting...'+
		'\n');
	return;
}

config.uaFile = path.resolve(pwd, cmd.useragents);

/*
 * parse a single user-agent and write the result to the stream
 */
function parse(txt, encoding, done) {
	var
		i,
		out = [],
		res;
		
	res = parser.parse(txt.toString());
	res = helper.compact.strip(res);

	if (cmd.console){
		out.push('== ' + res.string);
		config.params.forEach(function(p){
			out.push(p + ': ' + JSON.stringify(res[p]));
		});
		console.log(out.join('\n') + '\n');
	}
	
	config.params.forEach(function(p){
		if (res[p] && res[p].debug) { delete(res[p].debug); }
	});
	this.push(JSON.stringify(res) + '\n'); // jshint ignore:line

	done();
}

/*
 * the pipe - appending new parse results to the tests output
 */
fs.createReadStream(config.uaFile)
	.pipe(new SplitStream())
	.pipe(new MapStream({ map: parse }))
	.pipe(fs.createWriteStream(config.testsFile, { flags: 'a', encoding: 'utf8'}));
