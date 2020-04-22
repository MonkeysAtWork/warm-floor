install:
	npm ci

develop:
	npx webpack-dev-server --open

dev:
	rm -rf dist
	npx webpack

build:
	rm -rf dist
	NODE_ENV=production npx webpack

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
