'use strict';

/**
 * Benchmark dependencies.
 */
var benchmark = require('benchmark'),
    fs = require('fs');

/**
 * Useragent parsers.
 */
var useragent = require('useragent'),
    uaparser = require('node-uap'),
    uaparser2 = require('ua-parser2')();

/**
 * Setup the test-files.
 */
var useragentlist = __dirname + '/fixtures/testcases.txt',
    testcases = fs.readFileSync(useragentlist).toString().split('\n'),
    length = testcases.length;

/**
 * Setup the benchmark
 */
var froomfroom = new benchmark.Suite();

// always fully parse the user-agent into ua, os, device
froomfroom
.add('useragent', function () {
    for (var i = 0; i < length; i++ ) {
        var res = useragent.parse(testcases[i]);
        res.os.toJSON(); // useragent uses on-demand parsing for os/ device
        res.device.toJSON();
    }
})
.add('node-uap', function () {
    for (var i = 0; i < length; i++ ) {
        uaparser.parse(testcases[i]);
    }
})
.add('ua-parser2', function () {
    for (var i = 0; i < length; i++ ) {
        uaparser2.parse(testcases[i]);
    }
})
.on('cycle', function (event) {
    var details = event.target;

    console.log('Executed benchmark against node module: "%s"', details.name);
    console.log('Count (%d), Cycles (%d), Elapsed (%d), Hz (%d)\n'
     , details.count
     , details.cycles
     , details.times.elapsed
     , details.hz
    );
})
.on('complete', function () {
    console.log('Module: "'+ this.filter('fastest').map('name') +'" is the user agent fastest parser.');
});

/**
 * Start the benchmark, froom frooom!!
 */
console.log('Starting the benchmark, parsing ' + length + ' useragent strings per run');
console.log();

froomfroom.run({ minSamples: 100 });
