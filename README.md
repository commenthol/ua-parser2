ua-parser2
==========

[![Build Status](https://secure.travis-ci.org/commenthol/ua-parser2.png?branch=master)](https://travis-ci.org/commenthol/ua-parser2)

This is an improved fork from [ua-parser](http://github.com/tobie/ua-parser) which contains the following changes documented in the [Changelog][chan].

The crux of the original parser--the data collected by [Steve Souders][stev] over the years--has been extracted into a separate [YAML file][yaml] so as to be reusable _as is_ by implementations in other programming languages.

## Contributing Changes to regexes.yaml

Please read the [contributors' guide][guid]

## Specification

A [Specification][spec], e.g. for porting into other computer languages of the parsing rules for the `regexes.yaml` file is available.


## Usage [node.js][node]

[API Documentation][api]

```js
var res,
    uaParser = require('ua-parser')();

res = uaParser.parse('');

```

Note if you're only interested in one of the `ua`, `device` or `os` objects, you will getter better performance by using the more specific methods (`uaParser.parseUA`, `uaParser.parseOS` and `uaParser.parseDevice` respectively), e.g.:

```js
var p = require('ua-parser')();

console.log(p.parseUA(navigator.ua).toString());
// -> "Safari 5.0.1"
console.log(p.parseOS(navigator.ua).toString());
// -> "iOS 5.1"
console.log(p.parseDevice(navigator.ua).toString());
// -> "iPhone"
```

## License

The data contained in `regexes.yaml` is Copyright 2009 Google Inc. and available under the [Apache License, Version 2.0][apac].

The JS port is Copyright 2010-2014 commenthol and Tobie Langel and is available under [your choice of MIT or Apache Version 2.0 license][lice].

[node]: http://nodejs.org
[stev]: http://stevesouders.com/
[apac]: http://www.apache.org/licenses/LICENSE-2.0
[lice]: LICENSE
[spec]: doc/specification.md
[api]:  js/doc/uaparser.md
[guid]: CONTRIBUTING.md
[chan]: CHANGELOG.md
[yaml]: https://raw.github.com/commenthol/ua-parser2/master/regexes.yaml
