'use strict';

/* global describe, it */

var
	assert = require('assert'),
	UA = require('../lib/ua'),
	makeParser = require('../lib/parser');

describe('UA object', function() {
	it('UA constructor with no arguments', function() {
		var ua = new UA();
		assert.strictEqual(ua.family, 'Other');
		assert.strictEqual(ua.major, null);
		assert.strictEqual(ua.minor, null);
		assert.strictEqual(ua.patch, null);
	});

	it('UA constructor with valid arguments', function() {
		var ua = new UA('Firefox', '16', '3', 'beta');
		assert.strictEqual(ua.family, 'Firefox');
		assert.strictEqual(ua.major, '16');
		assert.strictEqual(ua.minor, '3');
		assert.strictEqual(ua.patch, 'beta');    
		assert.ok(!('patchMinor' in ua));
		assert.ok(!('type' in ua));
	});

	it('UA constructor with valid arguments and type', function() {
		var ua = new UA('Firefox', '16', '3', 'beta', '', 'browser');
		assert.strictEqual(ua.family, 'Firefox');
		assert.strictEqual(ua.major, '16');
		assert.strictEqual(ua.minor, '3');
		assert.strictEqual(ua.patch, 'beta');
		assert.strictEqual(ua.type, 'browser');
	});

	it('UA#toVersionString with only numerical args', function() {
		assert.strictEqual(new UA('Firefox', '16', '3', '2').toVersionString(), '16.3.2');
	});

	it('UA#toVersionString with non numerical patch version', function() {
		assert.strictEqual(new UA('Firefox', '16', '3', 'beta').toVersionString(), '16.3beta');
	});

	it('UA#toString for known UA', function() {
		assert.strictEqual(new UA('Firefox', '16', '3', '2').toString(), 'Firefox 16.3.2');
	});

	it('UA#toString for unknown UA', function() {
		assert.strictEqual(new UA().toString(), 'Other');
	});
});

describe('UA parser', function() {
	it('makeParser returns a function', function() {
		assert.equal(typeof makeParser([]).parse, 'function');
	});

	it('Unexpected args don\'t throw', function() {
		var parse = makeParser([]).parse;
		assert.doesNotThrow(function() { parse('Foo'); });
		assert.doesNotThrow(function() { parse(''); });
		assert.doesNotThrow(function() { parse(); });
		assert.doesNotThrow(function() { parse(null); });
		assert.doesNotThrow(function() { parse({}); });
		assert.doesNotThrow(function() { parse(123); });
	});

	it('Parser returns an instance of UA when unsuccessful at parsing', function() {
		assert.ok(makeParser([]).parse('bar') instanceof UA);
	});

	it('Parser returns an instance of UA when sucessful', function() {
		var parse = makeParser([{regex: 'foo'}]).parse;
		assert.ok(parse('foo') instanceof UA);
	});

	it('Parser correctly identifies UA name', function() {
		var parse = makeParser([{regex: '(foo)'}]).parse;
		assert.strictEqual(parse('foo').family, 'foo');
	});

	it('Parser correctly identifies version numbers', function() {
		var parse = makeParser([{regex: '(foo) (\\d)\\.(\\d)\\.(\\d)'}]).parse,
				ua = parse('foo 1.2.3');
		assert.strictEqual(ua.family, 'foo');
		assert.strictEqual(ua.major, '1');
		assert.strictEqual(ua.minor, '2');
		assert.strictEqual(ua.patch, '3');
	});

	it('Parser correctly processes replacements', function() {
		var parse = makeParser([{
			regex: '(foo) (\\d)\\.(\\d).(\\d)',
			family: '$1bar',
			v1: 'a',
			v2: 'b',
			v3: 'c'
		}]).parse;
	
		var ua = parse('foo 1.2.3');
		assert.strictEqual(ua.family, 'foobar');
		assert.strictEqual(ua.major, 'a');
		assert.strictEqual(ua.minor, 'b');
		assert.strictEqual(ua.patch, 'c');
	});
});

