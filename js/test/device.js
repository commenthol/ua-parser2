var assert = require('assert'),
    Device = require('../lib/device'),
    makeParser = require('../lib/parserdevice');

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
    var parse = makeParser([]).parse;
    assert.doesNotThrow(function() { parse('Foo'); });
    assert.doesNotThrow(function() { parse(''); });
    assert.doesNotThrow(function() { parse(); });
    assert.doesNotThrow(function() { parse(null); });
    assert.doesNotThrow(function() { parse({}); });
    assert.doesNotThrow(function() { parse(123); });
  });

  it('Parser returns an instance of Device when unsuccessful at parsing', function() {
    var parse = makeParser([{regex: 'foo'}]).parse;
    assert.ok(parse('bar') instanceof Device);
  });

  it('Parser returns an instance of Device when sucessful', function() {
    var parse = makeParser([{regex: 'foo'}]).parse;
    assert.ok(parse('foo') instanceof Device);
  });

  it('Parser correctly identifies Device name', function() {
    var parse = makeParser([{regex: '(foo)'}]).parse;
    assert.strictEqual(parse('foo').family, 'foo');
  });

  it('Parser correctly processes replacements', function() {
    var parse = makeParser([{
      regex: '(foo)',
      device: '$1bar'
    }]).parse;
  
    var device = parse('foo');
    assert.strictEqual(device.family, 'foobar');
  });
});

