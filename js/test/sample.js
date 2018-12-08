'use strict'

if (require.main === module) {
  var
    parse = require('../')().parse,
    input = process.argv[2] || 'Mozilla/5.0 (Linux; Android 6.0.1; SAMSUNG-SM-G930A Build/MMB29M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/49.0.2623.105 Mobile Safari/537.36 BingWeb/6.5.25183290'
  if (!input) { process.exit(1) }
  process.stdout.write(JSON.stringify(parse(input), null, '  ') + '\n\n')
}
