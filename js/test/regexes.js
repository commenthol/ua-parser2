'use strict'

/* global describe, it */

const assert = require('assert')
const safe = require('safe-regex')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const parser = require('../')()

function load (filename) {
  const contents = fs.readFileSync(filename, 'utf8')
  return yaml.load(contents)
}

function getRegexes (type, regexes) {
  const arr = []
  const options = {
    pattern: regexes.pattern
  }

  function _replacePattern (regex) {
    const pattern = options.pattern || {}
    Object.keys(pattern).forEach(function (p) {
      if (regex.indexOf(p) !== -1) {
        regex = regex.replace(p, pattern[p])
      }
    })
    return regex
  }

  function _regexp (obj) {
    const regex = _replacePattern(obj.regex)
    arr.push({
      regex: regex,
      debug: obj.debug
    })
  }

  function _make (obj) {
    _regexp(obj)
    if (obj.group) {
      _makeGroup(obj)
    }
  }
  function _makeGroup (obj) {
    _regexp(obj)
    ;(obj.group || []).forEach(_make)
  }

  regexes[type].forEach(_make)

  return arr
}

describe('regexes', function () {
  const filename = path.resolve(__dirname, '..', '..', 'regexes.yaml')
  const regexes = load(filename)

  ;[
    'user_agent_parsers',
    'engine_parsers',
    'os_parsers',
    'device_parsers'
  ].forEach(describeType)

  function describeType (type) {
    describe(type, function () {
      const arr = getRegexes(type, regexes)
      arr.forEach(testRegex)
    })
  }

  function testRegex (obj) {
    const regex = obj.regex
    it(regex, function () {
      assert.ok(safe(regex), obj.debug)
    })
  }
})

describe('redos', function () {
  const maxProcMs = 300
  const tests = [
    '"a"+"a"*3500+"a"',
    '"SmartWatch"+" "*3500+"z"',
    '";A Build HuaweiA"+"4"*3500+"z"',
    '"HbbTV/0.0.0 (;LGE;"+" "*3500+"z"',
    '"HbbTV/0.0.0 (;CUS:;"+" "*3500+"z"',
    '"HbbTV/0.0.0 (;"+" "*3500+"z"',
    '"HbbTV/0.0.0 (;z;"+" "*3500+"z"',
    '"AppleWebKit/1."+"0"*10000+"!"',
    '"AppleWebKit/1.1"+" Safari"*10000+"!"',
    '"/0"+"0"*10000+"◎"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"Opera/"+"Opera Mobi"*10000+"!"',
    '"Opera/1."+"0"*10000+"!"',
    '"Mozilla"+"Android"*10000+"!"',
    '"Chrome/1.1."+"0"*10000+"!"',
    '"Chrome/1.1."+"0"*10000+"!"',
    '"MSIE 1."+"0"*10000+"!"',
    '"iPod"+"Version/1.1"*10000+"!"',
    '"iPod;ACPUAOS 0_0"+"0"*10000+"◎"',
    '"iPod;"+"CPU"*10000+"!"',
    '"iPod;"+"CPUOS 1_1"*10000+"!"',
    '"iPod;CPU"+"OS 1_1"*10000+"!"',
    '"Version/0.0"+"0"*10000+"◎\n"',
    '"HbbTV/0.0.0"+"0"*10000+"◎"',
    '"HbbTV/1.1.1 ("+";a;"*10000+"!"',
    '"HbbTV/1.1.1 ("+";a;2011"*10000+"!"',
    '"HbbTV/1.1.1 (;a;"+"2011"*10000+"!"',
    '"CPU OS 0.0"+"0"*10000+"◎"',
    '"ArcGIS.iOS-0.0"+"0"*10000+"◎"',
    '"x86_64 1.1."+"0"*10000+"!"',
    '"x86_64 1.1.1"+"Chrome"*10000+"!"',
    '" Darwin/91"+"0"*10000+"!"',
    '" Darwin/101"+"0"*10000+"!"',
    '" Darwin/111"+"0"*10000+"!"',
    '" Darwin/121"+"0"*10000+"!"',
    '" Darwin/131"+"0"*10000+"!"',
    '"iPhone"+"Mac OS X"*10000+"!"',
    '"CFNetwork/C Darwin/17.0"+"0"*10000+"◎"',
    '"CFNetwork/"+" Darwin/17.1"*10000+"!"',
    '"CFNetwork/"+" Darwin/16.1"*10000+"!"',
    '"CFNetwork/ Darwin/16."+"0"*10000+"!"',
    '"CFNetwork/8"+" Darwin/15.1"*10000+"!"',
    '"CFNetwork/8 Darwin/15."+"0"*10000+"!"',
    '"Linux 0.0"+"0"*10000+"◎"',
    '" PTST/0"+"0"*10000+"◎\n"',
    '"Mozilla"+"Mobile"*10000+"!"',
    '"; AIRIS "+" "*10000+"◎"',
    '";ASUS"+"_"*10000+"!"',
    '";Excite "+"0"*10000+"!"',
    '"; "+" "*10000+"◎"',
    '";"+"Coolpad_"*10000+"!"',
    '";TAC-"+"0"*10000+"!"',
    '"; "+" "*10000+"◎"',
    '"; Fly F30"+"0"*10000+"◎"',
    '"; FONE 0"+"0"*10000+"◎"',
    '"; "+" "*10000+"◎"',
    '"; "+" "*10000+"◎"',
    '"; "+" "*10000+"◎"',
    '";   Build HuaweiA0"+"0"*10000+"◎"',
    '"; "+" "*10000+"◎\n"',
    '"; Ideos  "+" "*10000+"◎"',
    '"; NT-0"+"0"*10000+"◎"',
    '";ImPAD"+"0"*10000+"!"',
    '"; Intex AQUA  "+" "*10000+"◎"',
    '"; IBuddy Connect "+" "*10000+"◎"',
    '"; I-Buddy  "+" "*10000+"◎"',
    '"; Karbonn "+" "*10000+"◎"',
    '"; "+" "*10000+"◎\n"',
    '"; LAVA IRIS "+" "*10000+"◎"',
    '"; VS60"+"0"*10000+"◎"',
    '"; VS60 "+" "*10000+"◎"',
    '"; PhonePad 000"+"0"*10000+"◎"',
    '"; SmartPad 000"+"0"*10000+"◎"',
    '"; meizu_ "+" "*10000+"◎"',
    '"; Cynus F5 "+" "*10000+"◎"',
    '"; NXM0"+"0"*10000+"◎"',
    '";Nokia"+"_"*10000+"!"',
    '";IM-A111"+"0"*10000+"!"',
    '";Pantech"+"0"*10000+"!"',
    '"; Polaroid MIDC0000"+"0"*10000+"◎"',
    '"; POMP  "+" "*10000+"◎"',
    '"; SAMSUNG Galaxy Note II "+" "*10000+"◎"',
    '"; SAMSUNG-"+"0"*10000+"!"',
    '"; SCH-0"+"0"*10000+"◎\n"',
    '"; SC-0"+"0"*10000+"◎"',
    '" SCH-0"+"0"*10000+"◎"',
    '"; Xperia X0"+"0"*10000+"◎"',
    '"; Sprint  "+" "*10000+"◎"',
    '"; TM-MID0"+"0"*10000+"◎"',
    '";TM-SM"+"0"*10000+"!"',
    '"; Videocon   "+" "*10000+"◎"',
    '";XOLO "+"tab"*10000+"!"',
    '"; PAD 70"+"0"*10000+"◎"',
    '";SmartTab"+"0"*10000+"!"',
    '"; v89_"+"0"*10000+"◎"',
    '"; e0000a_v0"+"0"*10000+"◎"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ;  IEMobile/ ; ARM; Touch; HTC_blocked "+" "*10000+"◎"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"Windows Phone  ; "+"IEMobile/"*10000+"!"',
    '"SAMSUNG-"+"0"*10000+"!"',
    '"(Mobile; LYF/0/ ;"+";"*10000+"◎"',
    '"(Mobile; LYF/A/"+";0rv:"*10000+"!"',
    '"(Mobile; LYF/A/1;"+"rv:"*10000+"!"',
    '"(Mobile; Nokia_A_"+"; rv:"*10000+"!"',
    '"CFNetwork/"+" Darwin/1"*10000+"!"',
    '"CFNetwork/ Darwin/1"+"(Mac"*10000+"!"',
    '"Android 0.0-update1; AA-A ;  "+" "*10000+"◎\n"',
    '"Android 0.0.0; AA-A- ;  "+" "*10000+"◎"',
    '"Android 0.0.0; A- ;  "+" "*10000+"◎"',
    '"Android 0.0.0; -AA;  "+" "*10000+"◎\n"',
    '"Android 1; "+" Build"*10000+"!"',
    '"Android 1; "+" Build"*10000+"!"',
    '"foobar!/!./"+"/"*40000+"◎"',
    '"  #- regex: \'(iPad;(Version/0.0.08"+"8"*40000+"◎"',
    '"  #- regex: \'(iPad;"*8000',
    '"  #- regex: \'HbbTV/0.0.0 (; Sony;H;"+";"*40000+"◎1\n_\n"',
    '"  #- regex: \'HbbTV/1.1.1 (; Sony;"*600',
    '"Windows Phone  ; IEMobile/ ; ARM; Touch; HTC_blockedd"+"d"*40000+"◎1\n_\n)"',
    '"Windows Phone "*8000',
    '"HTC/HTC "+" "*20000+"\n"',
    '"HTC/HTC "+" "*10000+"\n"',
    '""+"Google"*10000+"! _1SLQ_2"',
    '""+"MSIE 1.1;"*10000+"! _1SLQ_2"',
    '""+"[FB"*10000+"! _1SLQ_2"',
    '""+"[FB"*10000+"! _1SLQ_2"',
    '""+"[Pinterest/"*5000+"@1 _SLQ_2"',
    '""+"Mobile;"*10000+"! _1SLQ_2"',
    '""+"FirefoxTablet browser 1."*3000+"! _1SLQ_2"',
    '""+"Opera TabletVersion/1."*3000+"! _1SLQ_2"',
    '""+"Opera/9180Version/"*5000+"! _1SLQ_2"',
    '""+"Chrome/1 MMS/11"*5000+"! _1SLQ_2"',
    '""+"PLAYSTATION 3"*5000+"! _1SLQ_2"',
    '""+"AppleWebKit1 NX/1."*5000+"! _1SLQ_2"',
    '""+"Windows Phone Edge/1."*3000+"! _1SLQ_2"',
    '""+"amarok/"*10000+"@1 _SLQ_2"',
    '""+"iPod1GSA/1."*5000+"! _1SLQ_2"',
    '""+"iPod"*10000+"! _1SLQ_2"',
    '""+"PlayBook"*10000+"! _1SLQ_2"',
    '""+"Blackberry1Version/"*5000+"! _1SLQ_2"',
    '""+"AppleWebKit/1+ "*5000+"! _1SLQ_2"',
    '""+"HbbTV/1.1.1 (;Samsung;SmartTV0000;"*2000+"! _1SLQ_2"',
    '""+"HbbTV/1.1.1 (;Samsung;SmartTV0000;"*2000+"! _1SLQ_2"',
    '""+"HbbTV/1.1.1 (; Philips;"*3000+"! _1SLQ_2"',
    '""+"HbbTV/1.1.1 (; Philips;"*3000+"! _1SLQ_2"',
    '""+"HbbTV/1.1.1 (; Philips;"*3000+"! _1SLQ_2"',
    '""+"Symbian/3"*10000+"! _1SLQ_2"',
    '""+"Symbian/3"*10000+"! _1SLQ_2"',
    '""+"BB10;1Version/"*5000+"! _1SLQ_2"',
    '""+"BlackBerry"*5000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/1810 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/1811 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/2610 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/2810 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/3010 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/3210 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Gecko/3410 Firefox/"*3000+"! _1SLQ_2"',
    '""+"(Mobile;1Firefox/1."*5000+"! _1SLQ_2"',
    '""+"DoCoMo"*10000+"! _1SLQ_2"',
    '""+"Mozilla"*10000+"! _1SLQ_2"',
    '""+"SmartWatch("*10000+"@1 _SLQ_2"',
    '""+"Android Application  - Sony 1 "*3000+"! _1SLQ_2"',
    '""+"Android Application  - HTC HTC 1 "*3000+"! _1SLQ_2"',
    '""+"Android Application  - - 1 "*3000+"! _1SLQ_2"',
    '""+"Android 3"*10000+"! _1SLQ_2"',
    '""+";Vega"*10000+"! _1SLQ_2"',
    '""+";ALLVIEWSpeed"*5000+"! _1SLQ_2"',
    '""+";ARCHOSGAMEPAD"*5000+"! _1SLQ_2"',
    '""+";BlackBird I8"*5000+"! _1SLQ_2"',
    '""+";BlackBird "*5000+"! _1SLQ_2"',
    '""+";CatNova"*10000+"! _1SLQ_2"',
    '""+";P-1"*1000+"@1 _SLQ_2"',
    '""+";Explay_"*10000+"! _1SLQ_2"',
    '""+";IQ"*10000+"! _1SLQ_2"',
    '""+";Pixel"*10000+"! _1SLQ_2"',
    '""+";GSmart "*10000+"! _1SLQ_2"',
    '""+";imx51_"*10000+"! _1SLQ_2"',
    '""+";Haier "*10000+"! _1SLQ_2"',
    '""+"Build/HCL ME Tablet "*3000+"@1 _SLQ_2"',
    '""+";HP "*10000+"! _1SLQ_2"',
    '""+"HTC Streaming Player "*3000+"@1 _SLQ_2"',
    '""+";HYUNDAI T1"*5000+"! _1SLQ_2"',
    '""+";imobile "*10000+"! _1SLQ_2"',
    '""+";i-style"*10000+"! _1SLQ_2"',
    '""+";iOCEAN "*10000+"! _1SLQ_2"',
    '""+";NEC-"*10000+"! _1SLQ_2"',
    '""+";Pantech "*10000+"! _1SLQ_2"',
    '""+"Android 4."*5000+"! _1SLQ_2"',
    '""+";PLT0000"*10000+"! _1SLQ_2"',
    '""+";SAMSUNG "*10000+"@1 _SLQ_2"',
    '""+";GT-B1111"*10000+"@1 _SLQ_2"',
    '""+"; SAMSUNG-"*5000+"! _1SLQ_2"',
    '""+";SK-"*10000+"! _1SLQ_2"',
    '""+";ST1111"*10000+"! _1SLQ_2"',
    '""+";ST1111"*10000+"! _1SLQ_2"',
    '""+";Build/"*10000+"! _1SLQ_2"',
    '""+"TOOKY "*10000+"! _1SLQ_2"',
    '""+"TOUCHTAB"*10000+"! _1SLQ_2"',
    '""+"VERTU "*10000+"! _1SLQ_2"',
    '""+";GTablet"*10000+"! _1SLQ_2"',
    '""+"Vodafone "*10000+"! _1SLQ_2"',
    '""+"sprd-"*10000+"@1 _SLQ_2"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"Windows Phone "*5000+"@1 _SLQ_2)"',
    '""+"(Mobile; ALCATELOneTouch ; rv:"*3000+"@1 _SLQ_2"',
    '""+"(Mobile; ZTE ; rv:"*5000+"@1 _SLQ_2"',
    '""+"(Mobile; ALCATELA; rv:"*3000+"@1 _SLQ_2"',
    '""+"PlayBook"*10000+"! _1SLQ_2"',
    '""+"webOS"*10000+"! _1SLQ_2"',
    '""+"HPiPAQ"*10000+"!1 _SLQ_2"',
    '""+"HbbTV;CE-HTML;"*5000+"@1 _SLQ_2"',
    '""+"InettvBrowser/0.0 (;Sony"*3000+"@1 _SLQ_2"',
    '""+"InettvBrowser/0.0 ("*5000+"@1 _SLQ_2"',
    '""+"MSIE"*10000+"! _1SLQ_2"',
    '""+"SMART-TV; "*10000+"! _1SLQ_2"',
    '""+"SymbianOS/9.1"*5000+"! _1SLQ_2"',
    '""+"Android "*10000+"@1 _SLQ_2"',
    '""+"Android-1.1; AA-; WOWMobile "*3000+"! _1SLQ_2"',
    '""+"Android-1.1-update1; AA-;"*3000+"! _1SLQ_2"',
    '""+"Android-1.1;AA_;"*5000+"! _1SLQ_2"',
    '""+"Android-1.1;-;"*5000+"! _1SLQ_2"',
    '""+"Android 1;   Build"*3000+"! _1SLQ_2"',
    '""+"Android 1;   Build"*3000+"! _1SLQ_2"'
  ]

  function timer () {
    const start = Date.now()
    return function () {
      return Date.now() - start
    }
  }

  function buildAttackString (attackString) {
    const uas = attackString
      .replace(/^"|"$/g, '')
      .replace(/"?\+"([^"]+)"\*(\d+)/, (m, str, i) => {
        // console.error({m, str, i})
        const size = parseInt(i, 10)
        if (!isNaN(size)) { return (new Array(size).fill(str).join('')) } else {
          return m
        }
      })
      .replace(/\+"/, '')
    return uas
  }

  tests.forEach(attackString => {
    it(attackString, function () {
      const ua = buildAttackString(attackString)
      // console.log(ua)
      const t = timer()
      parser.parse(ua)
      // console.log(t(), ua.length)
      assert.ok(t() < maxProcMs)
    })
  })
})

// console.log(regexes)
// console.log(getRegexes(regexes))
