ua-parser2
==========

<!--[![Build Status](https://secure.travis-ci.org/commenthol/ua-parser2.png?branch=master)](https://travis-ci.org/commenthol/ua-parser2)-->

This is an improved fork from [ua-parser][ua-parser] which contains the following changes documented in the [Changelog][chan].

The crux of the original parser--the data collected by [Steve Souders][stev] over the years--has been extracted into a separate [YAML file][yaml] so as to be reusable _as is_ by implementations in other programming languages.

The main differences to [ua-parser][ua-parser] are:

* Parsing Engines - Detection of MSIE compatibility modes
* Grouping of regexes - Speeds up User-Agent detection by > 200%
* Adding `type` attribute - tag a user-agent category with a specific type such as. 'bot', 'mail', 'feedreader', 'app', ...
* Bundled tools for contribution.
* Running your own `regexes.yaml` file
* Backwards Compatibility using the "old" UAParser result object is broken.


## Contributing Changes to regexes.yaml

Please read the [contributors' guide][guid]

## Specification

A [Specification][spec], e.g. for porting into other computer languages of the parsing rules for the `regexes.yaml` file is available.


## Usage [node.js][node]

[API Documentation][api]

```javascript
var uaParser = require('ua-parser2')(/* [optional] path to your regexes.yaml file */);

var res,
    userAgent = "Mozilla/5.0 (Linux; Android 4.3.1; LG-E980 Build/JLS36I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36";

res = uaParser.parse(userAgent);

console.log(res);
```

There is a sample in `./js/test/sample.js` which can be executed from the commandline.

```bash
node js/test/sample.js "Mozilla/5.0 (Linux; Android 4.3.1; LG-E980 Build/JLS36I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36"
#> {
  "ua": {
    "family": "Chrome Mobile",
    "major": "31",
    "minor": "0",
    "patch": "1650"
  },
  "engine": {
    "family": "Chrome",
    "major": "31",
    "minor": "0",
    "patch": "1650"
  },
  "os": {
    "family": "Android",
    "major": "4",
    "minor": "3",
    "patch": "1",
    "patchMinor": null
  },
  "device": {
    "family": "LG-E980",
    "brand": "LG",
    "model": "E980"
  },
  "string": "Mozilla/5.0 (Linux; Android 4.3.1; LG-E980 Build/JLS36I) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36"
}

node js/test/sample.js "AdsBot-Google-Mobile ( http://www.google.com/mobile/adsbot.html) Mozilla (iPhone; U; CPU iPhone OS 3 0 like Mac OS X) AppleWebKit (KHTML, like Gecko)"
#> {
  "ua": {
    "family": "AdsBot-Google-Mobile",
    ...
    "type": "bot"
  },
  "engine": {
    "family": "AppleWebkit",
    ...
  },
  "os": {
    "family": "Other",
    ...
  },
  "device": {
    "family": "iPhone",
    "brand": "Apple",
    "model": "iPhone"
  },
  "string": "AdsBot-Google-Mobile ( http://www.google.com/mobile/adsbot.html) Mozilla (iPhone; U; CPU iPhone OS 3 0 like Mac OS X) AppleWebKit (KHTML, like Gecko)"
}
```

Note if you're only interested in one of the `ua`, `device` or `os` objects, you will getter better performance by using the more specific methods (`uaParser.parseUA`, `uaParser.parseOS` and `uaParser.parseDevice` respectively), e.g.:

```js
var p = require('ua-parser2')();

var userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) CriOS/27.0.1453.10 Mobile/9B179 Safari/7534.48.3";

console.log(p.parseUA(userAgent).toString());
//> "Chrome Mobile iOS 27.0.1453"
console.log(p.parseEngine(userAgent).toString());
//> "AppleWebkit 534.46"
console.log(p.parseOS(userAgent).toString());
//> "iOS 5.1"
console.log(p.parseDevice(userAgent).toString());
//> "Apple iPhone"
```

## License

The data contained in `regexes.yaml` is Copyright 2014 commenthol, 2009 Google Inc. and available under the [Apache License, Version 2.0][apac].

The JS port is Copyright 2014 commenthol, 2010 Tobie Langel and is available under [your choice of MIT or Apache Version 2.0 license][lice].

[node]: http://nodejs.org
[stev]: http://stevesouders.com/
[apac]: http://www.apache.org/licenses/LICENSE-2.0
[lice]: LICENSE
[spec]: doc/specification.md
[api]:  js/doc/uaparser.md
[guid]: CONTRIBUTING.md
[chan]: CHANGELOG.md
[yaml]: https://raw.github.com/commenthol/ua-parser2/master/regexes.yaml
[ua-parser]: http://github.com/tobie/ua-parser
