'use strict'

if (require.main === module) {
  var
    parse = require('../')().parse,
    input = process.argv[2]
  if (!input) { process.exit(1) }
  process.stdout.write(JSON.stringify(parse(input), null, '  ') + '\n\n')
}
