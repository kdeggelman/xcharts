NODE_PATH = node_modules/.bin
JS_COMPILER = $(NODE_PATH)/uglifyjs
JS_BEAUTIFIER = $(NODE_PATH)/uglifyjs -b -i 2 -nm -ns
CSS_COMPILER = $(NODE_PATH)/lessc --strict-imports
CSS_MINIFIER = $(CSS_COMPILER) --yui-compress

all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

pre-build:
	@mkdir -p build

build: pre-build \
	build/xcharts.js \
	build/xcharts.min.js \
	build/xcharts.css \
	build/xcharts.min.css \
	build/LICENSE \
	build/README.md
	@tar -czf build.tar.gz build/

.INTERMEDIATE build/xcharts.js: \
	scripts/wrap-start.js \
	node_modules/underscore/underscore-min.js \
	lib/visutils.js \
	lib/scales.js \
	lib/vis/bar.js \
	lib/vis/line.js \
	lib/vis/line-dotted.js \
	lib/vis/cumulative.js \
	lib/chart.js \
	scripts/wrap-end.js

.INTERMEDIATE build/xcharts.css: \
	lib/xcharts.less

.INTERMEDIATE build/xcharts.min.css: \
	lib/xcharts.less

.INTERMEDIATE build/LICENSE: \
	LICENSE

.INTERMEDIATE build/README.md: \
	README.md

build/%.min.js: build/%.js
	@echo "Building $^..."
	@rm -f $@
	@$(JS_COMPILER) < $< > $@

build/xcharts.js:
	@echo "Building $^..."
	@rm -rf $@
	@cat $(filter %.js,$^) > $@

build/xcharts.css:
	@echo "Building $^..."
	@$(CSS_COMPILER) $(filter %.less,$^) $@

build/%.min.css:
	@echo "Building $^..."
	@$(CSS_MINIFIER) $(filter %.less,$^) $@

build/%: %
	@echo "Building $^..."
	@cat $^ > $@

clean:
	@echo "Cleaning..."
	@rm -rf build

jsfiles := $(shell find . -name '*.js' ! -name '*lodash.js' ! -path './node_modules/*' ! -path './test/lib/*' ! -path "./build/*" ! -path "./scripts/*" ! -path "./tmp_build/*")
lint:
	@node_modules/nodelint/nodelint ${jsfiles} --config=scripts/lint-config.js

reporter='dot'
test: build
	@node_modules/.bin/mocha-phantomjs test/test.html --reporter ${reporter}

.PHONY: lint test
