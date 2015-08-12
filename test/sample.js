#!/usr/bin/env node

'use strict';

if (require.main === module) {
	var
		parse = require('../')().parse,
		input = process.argv[2];
	if (!input) {
		input = 'Mozilla/5.0 (Linux; Android 4.3.1; LG-E980 Build/JLS36I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36';
	}
	process.stdout.write(JSON.stringify(parse(input), null, '  ') + "\n\n");
}
