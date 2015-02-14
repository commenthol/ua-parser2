# Changelog

**2015-02-14**
- parser
  - fix problem with node v0.12
- regexes
  - device_parsers
    - Huawei: Honor, H60-L*, OrangeLuno, OrangeYumo
    - Samsung: GT-Xperia S
    - Acer: A1-000FHD, A3-A00FHD, B1-000FHD, b1-000, E39, E320, E380, E400, S55, S56, S500, S510, S520, Z140, Z150, Z160, Z200, Z410, Z500
    - Alcatel: 4032X, 5038D, 5050X, 5050Y, 6016D, 6016X, 6036Y, 6037Y, 6043D, 6050Y,     Vodafone_Smart_II, Orange Infinity 8008X, Orange Hiro, Orange Yomi, Telenor Smart, Telenor Smart, Telenor_One_Touch_S, move 2, BS471, I213, Mobile Sosh, MTC975, smart_a17
    - Asus: K007, K010, K011, K013, K014, K015, K016, K017, K018, K019, TX201LA
    - Avus: New brand
    - Blackview: New brand
    - bq: Aquaris
    - CAT: B15, B15Q
    - Coolpad: Improvement
    - Cubot: GT89, GT90, GT91, P6, P7, P9, P10, S108, S168, S200, S208, S222, S308, s350, T9, X6, X9
    - Doogee: New brand
    - Doro: New brand
    - Elephone: New brand
    - Enot: Fix regexes
    - Fairphone: New brand
    - Gionee: E7
    - GoClever: ARIES
    - Haier: HW-W718, HW-W910, W867
    - Hannspree: HSG1279, HSG1281, HSG1291, HSG1297
    - HTC: A320a, Z520m, HTL22, 801a, Nexus 9, PJ83100, ADR6410
    - InFocus: New brand
    - Jaytech: TPC-PA10.1M, TPC-PA1070, TPC-PA762, TPC-PA777, TPC-PA7815, TPC-PA9702, TPC-PX753, TPC-81203G
    - Kazam: New brand
    - Kiano: New brand
    - Landvo: New brand
    - Lenovo: YOGA pad
    - Mobiwire: New brand
    - Motorola: Refactor Xoom, RAZR HD, Nexus 6
    - Neken: New brand
    - Newman: New brand
    - Nook: BNTV250A
    - Oneplus: New Brand
    - Odys: ARIA, AVIATOR, CONNECT7PRO, CONNECT8PLUS, GATE, INTELLITAB7, JUNIORTAB, MIRON, Motion, PRO_Q8, SKYPLUS3G, UNO_X10, VISIO, XelioPT2Pro
    - Phicomm: i600, i813w
    - Prestigio: PSP, PMT
    - Trekstor: VT10416, Surftab, breeze, xiron
    - Smartbook: New brand
    - SonyEricsson: R800a
    - Sony: S39h
    - Switel: New brand
    - Thl: W200S, T100S
    - Umi: New brand
    - Wiko: BIRDY, GETAWAY, GOA, HIGHWAY SIGNS, IGGY, JIMMY, KITE, LENNY, RIDGE, RIDGE FAB, SLIDE, SUNSET
    - Xiaomi: HM devices
    - Xoro: New devices
    - Amazon: 4th Gen Devices

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
