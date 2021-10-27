.PHONY: all
all: lint dist

.PHONY: clean
clean:
	rm -rf dist/*

.PHONY: dist
dist: tsc
	cp -a package.json dist/

.PHONY: tsc
tsc:
	npm run tsc

.PHONY: lint
lint:
	npm run lint

.PHONY: fix
fix:
	npm run fix
