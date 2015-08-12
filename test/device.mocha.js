'use strict';

/* global describe, it, before */

var
	assert = require('assert'),
	path = require('path'),
	yaml = require('./lib/yaml'),
	Device = require('../lib/device'),
	makeParser = require('../lib/parser'),
	uaparser = require('../');

var
	options = { device: true };

describe('Device object', function() {
	it('Device constructor with no arguments', function() {
		var device = new Device();
		assert.strictEqual(device.family, 'Other');
		assert.strictEqual(device.toString(), 'Other');
	});

	it('Device constructor with valid arguments', function() {
		var device = new Device('Foo');
		assert.strictEqual(device.family, 'Foo');
		assert.strictEqual(device.toString(), 'Foo');
	});

	it('Device constructor with valid Brand Model arguments', function() {
		var device = new Device('Sang', 'Gum', 'Sang A');
		assert.strictEqual(device.family, 'Sang');
		assert.strictEqual(device.brand, 'Gum');
		assert.strictEqual(device.model, 'Sang A');
		assert.strictEqual(device.toString(), 'Gum Sang A');
	});
});

describe('Device parser', function() {
	it('makeParser returns a function', function() {
		assert.equal(typeof makeParser([]).parse, 'function');
	});

	it('Unexpected args don\'t throw', function() {
		var parse = makeParser([], options).parse;
		assert.doesNotThrow(function() { parse('Foo'); });
		assert.doesNotThrow(function() { parse(''); });
		assert.doesNotThrow(function() { parse(); });
		assert.doesNotThrow(function() { parse(null); });
		assert.doesNotThrow(function() { parse({}); });
		assert.doesNotThrow(function() { parse(123); });
	});

	it('Parser returns an instance of Device when unsuccessful at parsing', function() {
		var parse = makeParser([{regex: 'foo'}], options).parse;
		assert.ok(parse('bar') instanceof Device);
	});

	it('Parser returns an instance of Device when sucessful', function() {
		var parse = makeParser([{regex: 'foo'}], options).parse;
		assert.ok(parse('foo') instanceof Device);
	});

	it('Parser correctly identifies Device name', function() {
		var parse = makeParser([{regex: '(foo)'}], options).parse;
		assert.strictEqual(parse('foo').family, 'foo');
	});

	it('Parser correctly processes replacements', function() {
		var parse = makeParser([{
			regex: '(foo)',
			family: '$1bar'
		}], options).parse;

		var device = parse('foo');
		assert.strictEqual(device.family, 'foobar');
	});
});

describe('Device parser groups', function() {

	var
		regexes = yaml.load(path.join(__dirname, 'fixtures', 'groupdevice.yaml')),
		parse = makeParser(regexes.device_parsers, options).parse;

	it('Parser correctly processes groups matching "gumsang"', function() {
		var device = parse('gumsang tststs');
		assert.deepEqual(device, { family: 'gumsang tsts', brand: 'GumSanG', model: 'tsts' });
	});

	it('Parser correctly processes groups matching "THC" and "Bandroid"', function() {
		var device = parse('Bandroid THC TWO1212');
		assert.deepEqual(device, {"family":"THC TWO","brand":"THC","model":"TWO 1212"});
	});

	it('Parser correctly processes groups matching "CHC"', function() {
		var device = parse('CHC POOL4 Bandroid');
		assert.deepEqual(device, {"family":"CHC","brand":"CHC by THC","model":"LOOP 4"});
	});

	it('Parser correctly processes groups matching no group', function() {
		var device = parse('price YBoY');
		assert.deepEqual(device, {"family":"YBoY ice","brand":"YBoY","model":"ice"});
	});

	it('Parser correctly processes groups without a match', function() {
		var device = parse('price ZBoZ');
		assert.deepEqual(device, {"family":"Other","brand":null,"model":null});
	});
});

describe('Device Model Parser', function(){

	var uap;

	before(function(){
		uap = uaparser({
			regexes: path.join(__dirname, 'fixtures', 'groupdevice.yaml'),
			models : path.join(__dirname, 'fixtures', 'models.yaml')
		});
	});

	it('Generic_OSa Model1', function(){
		var res = uap.parseDevice('OSa model1');
		var exp = {
			family: 'OSa',
			brand: 'SengGin',
			model: 'Model1',
			name: 'SengGin One'
		};
		assert.deepEqual(res, exp);
	});

	it('Generic_OSa model1', function(){
		var res = uap.parseDevice('OSa model1');
		var exp = {
			family: 'OSa',
			brand: 'SengGin',
			model: 'Model1',
			name: 'SengGin One'
		};
		assert.deepEqual(res, exp);
	});

	it('Generic_OSa Root2', function(){
		var res = uap.parseDevice('OSa Root2');
		var exp = {
			family: 'OSa',
			brand: 'THC',
			model: 'Smasher',
			type: 'smartphone'
		};
		assert.deepEqual(res, exp);
	});

	it('Generic_OSa THC Root', function(){
		var res = uap.parseDevice('OSa THC Root');
		var exp = {
			family: 'OSa',
			brand: 'THC',
			model: 'Mash',
			name: 'THC Smash',
			type: 'tablet'
		};
		assert.deepEqual(res, exp);
	});

	it('Generic_OSw THC Cash', function(){
		var res = uap.parseDevice('OSw THC Cash');
		var exp = {
			family: 'OSw',
			brand: 'THC',
			model: 'Cash',
			type: 'smartphone',
			name: 'THC Cash $$'
  		};
		assert.deepEqual(res, exp);
	});

	it('Generic_OSw Model_Two', function(){
		var res = uap.parseDevice('OSw Model_Two');
		var exp = {
			family: 'OSw',
			brand: 'SengGin',
			model: 'ModelTwo',
			name: 'SengGin Two',
			type: 'phone'
  		};
		assert.deepEqual(res, exp);
	});

	it('gumsang tststs', function(){
		var res = uap.parseDevice('gumsang tststs');
		var exp = {
			family: 'gumsang tsts',
			brand: 'GumSanG',
			model: 'Tsts',
			name: 'Gumsang Test',
			type: 'phone'
		};
		assert.deepEqual(res, exp);
	});

	it('frozen YBoY', function(){
		var res = uap.parseDevice('frozen YBoY');
		var exp = {
			family: 'YBoY frozen',
			brand: 'YBoY',
			model: 'frozen',
			name: 'YBoY top frozen',
			type: 'smartphone'
		};
		assert.deepEqual(res, exp);
	});

});