# Changelog

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
