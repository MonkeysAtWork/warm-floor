install:
	npm ci

develop:
	nodemon --watch server ./server/server_dev.js

start:
	node ./server/server_prod.js

dev:
	rm -rf dist
	npx webpack --config webpack.dev.config.js

build:
	rm -rf dist
	npx webpack --config webpack.prod.config.js

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
