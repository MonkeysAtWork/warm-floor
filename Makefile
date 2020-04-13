install:
	npm ci

develop:
	npx webpack-dev-server --open

dev:
	rm -rf dist
	npx webpack
	cp -r src/icons dist
	cp src/manifest.json dist
	cp src/sw.js dist

build:
	rm -rf dist
	npm run build
	cp -r src/icons dist
	cp src/manifest.json dist
	cp src/sw.js dist

test:
	npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage

lint:
	npx eslint .

publish:
	npm publish

.PHONY: test
