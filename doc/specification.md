Version 1.1 Final

# ua-parser2 Specification

This document describes the specification on how a parser should implement the `regexes.yaml` file for correctly parsing User-Agent strings on basis of that file. 

This specification shall help maintainers and contributors to correctly use the provided information within the `regexes.yaml` file for obtaining information from the different User-Agent strings. Furthermore this specification shall be the basis for discussions on evolving the projects and the needed parsing algorithms.

This document will not provide any information on how to implement the ua-parser2 project on your server and how to retrieve the User-Agent string for further processing. 

## Table of Contents

* [regexes.yaml](#regexes-yaml)
  * [Grouping regex'es](#grouping-regex-es)
  * [user_agent_parsers](#user_agent_parsers)
  * [engine_parsers](#engine_parsers)
  * [os_parsers](#os_parsers)
  * [device_parsers](#device_parsers)
  * [Output format](#output-format)

# regexes.yaml

Any information which can be obtained from a User-Agent string may contain information on:

* User-Agent aka "the browser"
* Engine the Rendering Engine used by the User-Agent
* OS (Operating System) the User-Agent currently uses (or runs on)
* Device information by means of the physical device the User-Agent is using

This information is provided within the `regexes.yaml` file. Each kind of information requires a different parser which extracts the related type. These are:

* user_agent_parsers
* engine_parsers
* os_parsers
* device_parsers

Each parser contains a list of regular-expressions which are named `regex`. For each `regex` replacements specific to the parser can be named to attribute or change information. A replacement may require a match from the regular-expression which is extracted by an expression enclosed in normal brackets `(.*)`. Each match can be addressed with `$1` to `$999` and used in a parser specific replacement.

**General Rules for writing/changing Regular Expressions**

Escape the following characters

* `.` => `\.`
* `(` => `\(` ; `)` => `\)` ; otherwise a regex group will be opened
* `/` does not need to be escaped but can be escaped using `\/`
* `-` used within Bracketed Character classes needs to be escaped. E.g. `[ _\-]+`

For further details on Regular Expressions check [perldoc](http://perldoc.perl.org/perlre.html#Regular-Expressions).

**Rules for Replacements**

To use matches within replacements use either the form of `$\d+`, e.g. `$1` ... `$999`.<br>
In special cases where you want to use match `$1` followed by a `0` and not `$10`, use the form `${1}0` 

**Example**

```yaml
- regex: '(Minefield)/(\d+)\.(\d+)\.(\d+(?:pre)?)'
  family: 'Firefox ($1)'
  v1: '$3'
  v2: '$4'
  patch:
  type: 'browser::Firefox::$1'
```

A User-Agent String `Minefield/2.1.0pre` using the `regex` above would be evaluated to:

```
family: 'Firefox (Minefield)'
major: '1'
minor: '0pre'
patch: 
type: 'browser::Firefox::Minefield'
```

## Grouping regex'es

To speed up parsing as well as to build isolated groups of regular expressions, the `group` parameter is used.
It shall contain a `regex` any may use `regex_flag: 'i'` for case-insensitive matching.
The group is only entered, if the associated `regex` matches. Otherwise evaluation continues with the next following `regex` or `group`.

**Example**

```yaml
#>> group matching '/gecko/i' starts
- group:
  regex: 'gecko'
  regex_flag: 'i'
  # can only be reached if '/gecko/i' did initially match
  - regex: '(Firefox)/(\d+)\.(\d+)\.(\d+(?:pre)?)'
  #<< group matching '/gecko/i' ends

- regex: '(Chrome)/(\d+)\.(\d+)'
```    

In this case the group `gecko` is only entered if the User-Agent-String contains `/gecko/i`.
`regex: Firefox` matches only if the User-Agent-String contains `/gecko/i` as well.


<a name="user_agent_parsers"/>
## user_agent_parsers

The `user_agent_parsers` shall return information of the `family` type of the User-Agent.
If available the version infomation specifying the `family` may be extracted as well.
Here major, minor and patch version information can be addressed or overwritten.
A match is a regex-group enclosed in normal brackets.

| match in regex | default replacement | note              |
| ---- | --------| --------------------------------------- |
| 1    | family  | specifies the User-Agents family        |
| 2    | v1      | major version number/info of the family | 
| 3    | v2      | minor version number/info of the family | 
| 4    | v3      | patch version number/info of the family |
| -    | type    | may further describe the type of User-Agent, e.g. 'bot', 'app' |

In case that no replacement is specified, the association is given by order of the match. If in the `regex` no first match (within normal brackets) is given, the `family` shall be specified!

To overwrite the respective value the replacement value needs to be named for a `regex`-item.

The `type` is only set in the output if a value is present for the respective `regex`. If you want to define "subgroups" use `::` as seperator characters. `<type>::<subtype>::<subsubtype>`.

An infinite number of regex-groups shall be possible for each `regex`.

If `regex_flag: 'i'` is present then `regex` shall be evaluated as case-insensitive.

**Parser Implementation:**

The list of regular-expressions `regex` shall be evaluated for a given User-Agent string beginning with the first `regex`-item in the list to the last item. The first matching `regex` stops processing the list. Regex-matching shall be case sensitive.

In case that no replacement for a match is specified for a `regex`-item, the first match defines the `family`, the second `major`, the third `minor`and the forth `patch` information. 

As placeholder for inserting matched characters `$1` to `$999` can be used to insert the matched characters from the regex into the replacement string.

If no matching `regex` is found the value for `family` shall be "Other". The version information `major`, `minor` and `patch` shall not be defined.

**Example:**

For the User-Agent: `Mozilla/5.0 (Windows; Windows NT 5.1; rv:2.0b3pre) Gecko/20100727 Minefield/4.0.1pre`
the matching `regex`:

```yaml
- regex: '(Namoroka|Shiretoko|Minefield)/(\d+)\.(\d+)\.(\d+(?:pre)?)'
  family: 'Firefox ($1)'
```

shall be resolved to:

```
family: Firefox (Minefield)
major : 4
minor : 0
patch : 1pre
```

## engine_parsers

The `engine_parsers` shall return information of the `family` type of the Engine the User-Agent uses.
If available the version infomation specifying the `family` may be extracted as well.
Here major, minor and patch version information can be addressed or overwritten.

| match in regex | default replacement | note              |
| ---- | ------- | --------------------------------------- |
| 1    | family  | specifies the User-Agents Engine family |
| 2    | v1      | major version number/info of the family | 
| 3    | v2      | minor version number/info of the family | 
| 4    | v3      | patch version number/info of the family |
| -    | type    | may further describe the type of Engine e.g. 'mode::MSIE 9' |

The parser implemention shall be identical to the one described in [user_agent_parsers](#user_agent_parsers).

## os_parsers

The `os_parsers` shall return information of the `os` type of the Operating System (OS) the User-Agent runs.
If available the version information specifying the `os` may be extracted as well if available.
Here major, minor, patch and patchMinor version information can be addressed or overwritten.

| match in regex | default replacement | note              |
| ---- | -------| ---------------------------------------- |
| 1    | family | specifies the OS                         |
| 2    | v1     | major version number/info of OS          | 
| 3    | v2     | minor version number/info of the OS      | 
| 4    | v3     | patch version number/info of the OS      |
| 5    | v4     | patchMinor version number/info of the OS |
| -    | type   | may further describe the type of OS      |

The parser implemention shall be identical to the one described in [user_agent_parsers](#user_agent_parsers).
Aditionally the `patchMinor` value shall always be added to the resulting object.

## device_parsers 

The `device_parsers` shall return information of the device `family` the User-Agent runs.
Furthermore `brand` and `model` of the device can be specified.
`brand` shall name the manufacturer or brand of the device, where model shall specify the model of the device.

| match in regex | default replacement | note              |
| ---- | -------| ---------------------------------------- |
| 1    | family | specifies the device family              |
| -    | brand  | major version number/info of OS          | 
| 1    | model  | minor version number/info of the OS      | 
| -    | type   | may further describe the type of Device  |

In case that no replacement is specified the association is given by order of the match. 
If in the `regex` no first match (within normal brackets) is given the `family` together with the `model` shall be specified!
To overwrite the respective value the replacement value needs to be named for a given `regex`.

The `type` is only set in the output if a value is present for the respective `regex`. If you want to define "subgroups" use `::` as seperator characters. `<type>::<subtype>::<subsubtype>`.

An infinite number of regex-groups shall be possible for each `regex`.

If `regex_flag: 'i'` is present then `regex` shall be evaluated as case-insensitive.

**Parser Implementation:**
 
The list of regular-expressions `regex` shall be evaluated for a given User-Agent string beginning with the first `regex`-item in the list to the last item. The first matching `regex` stops processing the list. Regex-matching shall be case sensitive.

In case that no replacement for a match is given, the first match defines the `family` and the `model`. 

As placeholder for inserting matched characters `$1` to `$999` can be used to insert the matched characters from the regex into the replacement string.

In case that no matching `regex` is found the value for `family` shall be "Other". `brand` and `model` shall not be defined.

**Example:**

For the User-Agent: `Mozilla/5.0 (Linux; U; Android 4.2.2; de-de; PEDI_PLUS_W Build/JDQ39) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30`
the matching `regex`:

```yaml
- regex: '; (PEDI)_(PLUS)_(W) Build/'
  device: '$1_$2_$3'
  brand: 'Odys'
  model: '$1 $2 $3'
```

shall be resolved to:

```
family: 'PEDI_PLUS_W' 
brand: 'Odys'
model: 'PEDI PLUS W'
```

## Output format

The current output format returns an object with the following structure:

```javascript
{
  ua: { // result of the user_agent_parsers
    family: 
    major:
    minor:
    patch:
    type: // optional
  },
  engine: { // result of the engine_parsers
    family: 
    major:
    minor:
    patch:
    type: // optional
  }
  os: { // result of the os_parsers
    family: 
    major:
    minor:
    patch:
    patchMinor:
    type: // optional
  }
  device: { // result of the device_parsers
    family: 
    brand:
    model:
    type: // optional
  }
}
```


---
End of Document
