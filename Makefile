VERSION ?= $(shell versionn -i)

all: version 0.12 4. 6. 8.

version: regexes.yaml
	@echo $(VERSION)
	@sed "s/^version:.*$//version: '$(VERSION)'/" $< > tmp.tmp && mv tmp.tmp $<

%:
	n $@ && npm test

.PHONY: all version
