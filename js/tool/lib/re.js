'use strict';

var
	fs = require('fs'),
	JsonStream = require('../../test/lib/jsonstream'),
	MapStream = require('../../test/lib/mapstream'),
	helper = require('../../test/lib/helper'),
	parser = require('../../')();	

var
	config = {
		params: [ 'ua', 'engine', 'os', 'device' ],
		//~ inFile: __dirname + '/../../../test_resources/tests.json',
		inFile: __dirname + '/../../../test_resources/x.json',
		outFile: __dirname + '/../../../test_resources/new.json',
		badAgentsFile: __dirname + '/../../../test_resources/bad.json'
	};

var
	badAgents = [];

function parseDone() {
	fs.writeFileSync(config.badAgentsFile, badAgents.join('\n'), 'utf8');
}

function parse(obj, encoding, done) {
	var
		i,
		out = [],
		dbg = {},
    exp, act,
		res, resS;
		
	res = parser.parse(obj.string);
	res = helper.compact.strip(res);

	for (i in res) {
		if (res[i].debug) {
			dbg[i] = res[i].debug;
			delete(res[i].debug);
		}
	}

	exp = JSON.stringify(obj);
	resS = JSON.stringify(res);

	if (exp !== resS) {
		badAgents.push(exp);
		config.params.forEach(function(p){
			exp = JSON.stringify(obj[p]);
			act = JSON.stringify(res[p]);
			if (exp !== act) {
				out.push('-- ' + p + ': ' + ( dbg[p] || '' ) );
				out.push('< ' + exp);
				out.push('> ' + act);
			}
		});
		out.push('== ' + obj.string);
		console.log(out.join('\n') + '\n');
	}
	
	this.push(resS + '\n');

	done();
};

var out = fs.createWriteStream(config.outFile, { encoding: 'utf8'});

fs.createReadStream(config.inFile)
	.pipe(new JsonStream())
	.pipe(new MapStream({ map: parse, onend: parseDone }))
	.pipe(out);
