# Changelog

**2014-12-17
- regexes
  - ua: Opera Coast and Opera Mini
  - ua: escaped ' in bot regex solved
- parser
  - simplification with regex gen

**2014-12-16**
- tests
  - Change to [streamss](http://github.com/commenthol/streamss) for all test cases.
  - Tests now also run on Node v0.8.x

**2014-11-13**
- regexes
  - Better detection of ThL, Cubot, HTC One M*
  - New: Gigaset
  - New: IE Tech-Preview on Windows10

**2014-11-05**
- regexes
  - type bot::healthcheck introduced for Monitors/Loadbalancers

**2014-10-30**
- regexes
  - Puffin Browser added
  - Amazon Silk hidden by Chrome
  - Better detection of bots

**2014-10-08**
- regexes
  - Xenu and other Bots added
  - Fix: Version detection of Bots
  - Motorola now contains brand name in device replacement

**2014-09-25**

- regexes
  - Zopo Devices
  - Asus Transformer, PadFone

**2014-09-24**

- regexes
  - Oppo Find 7a added
  - ZTE OpenC
  - Fix for Archos/ Arnova Tablets

**2014-09-11**

- regexes
  - Riddler bot, Sony Xperia Z3 added

**2014-09-02**

- regexes
  - Sony Playstation, os + device
  - CFNetwork, os
  - Better detection of bots
  - Fix in ua bot detection - major version not recognized as hidden by "google(^tv)"

**2014-08-14**

- regexes
  - Sony Android Rule updated for D6603
  - engine_parsers:
    - Webkit::Nokia renamed for webkit based NokiaBrowser
    - Webkit:LG and Webkit::Samsung for tv sets
  - device_parsers: type=tv added

**2014-08-10**

- regexes
  - Windows OS refactored, Cygwin added
  - New OS's added: YunOS, AmigaOS, Tizen, Sailfish, Haiku, BeOS, Nintendo, OS/2, PalmOS, Various Linux Distros, RISC OS, Solaris, HopenOS, Gogi
  - UA: Better catch of Browsers using Chrome Engine, CocoonJS
  - Device: types for camera, car added
  - Device: Nokia, Palm, Blackberry refactored
  - Device: garmin-asus Nuvifone added
  - Device: Nook, CnM, Versus, Danew, Lenovo, Acer, Micromax, Alcatel, Amoi, Avvio, Bmobile improved

**2014-08-09**

- parser
  - Replacements use either `$10` or `${1}0`
  - Specification update -> Version 1.1 Final
  - Travis Build added
  - Quick tests (quick-tests.json) for npm package added.
    The big test file gets excluded.
  - parserdevice.js simplified in parser.js
