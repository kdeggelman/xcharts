SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
VERSION := $(shell npm ls | grep "xcharts@" |  grep -Eo "[0-9]*\.[0-9]*\.[0-9]*")
NODE_PATH = node_modules/.bin
JS_COMPILER = $(NODE_PATH)/uglifyjs --comments="license"
JS_BEAUTIFIER = $(NODE_PATH)/uglifyjs -b -i 2 -nm -ns
CSS_COMPILER = $(NODE_PATH)/lessc --strict-imports
CSS_MINIFIER = $(CSS_COMPILER) --yui-compress

TMP = 'tmp_build'
REMOTE=origin
DOC_BRANCH=gh-pages

all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

pre-build:
	@mkdir -p build
	@sed -i.bak 's/v[0-9]*\.[0-9]*\.[0-9]*/v${VERSION}/' scripts/wrap-start.js

build: pre-build \
	build/xcharts.js \
	build/xcharts.min.js \
	build/xcharts.css \
	build/xcharts.min.css \
	build/LICENSE \
	build/README.md
	@tar -czf xcharts-build.tar.gz build/
	@find ./ -name "*.bak" -delete

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
	@rm -rf ${TMP}

jsfiles := $(shell find . -name '*.js' ! -name '*lodash.js' ! -path './node_modules/*' ! -path './test/lib/*' ! -path "./build/*" ! -path "./scripts/*" ! -path "./tmp_build/*" ! -path "./docs/*xcharts*js" ! -name "*.min.js")
lint:
	@node_modules/nodelint/nodelint ${jsfiles} --config=scripts/lint-config.js

reporter='dot'
test: build
	@${NODE_PATH}/mocha-phantomjs test/test.html --reporter ${reporter}

pre-docs: clean build
	@sed -i.bak 's/v[0-9]*\.[0-9]*\.[0-9]*/v${VERSION}/' docs.json
	@rm docs.json.bak

docs: pre-docs
	@mkdir -p docs/css
	@node_modules/.bin/lessc --yui-compress --include-path=docs/less docs/less/master.less docs/css/master.css
	@node_modules/.bin/still docs -o ${TMP} -i "layouts" -i "json" -i "less" -i "macro"
	@cp node_modules/d3/d3.v2.min.js ${TMP}/js/d3.v2.min.js
	@cp build/xcharts*js ${TMP}/js/
	@git checkout master
	@cp xcharts-build.tar.gz ${TMP}/xcharts-build.tar.gz
	@git checkout ${DOC_BRANCH}
	@cp -r ${TMP}/* ./
	@rm -rf ${TMP}
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${REMOTE} ${DOC_BRANCH}
	@git checkout ${THIS_BRANCH}

port = 3000
test-docs: pre-docs
	@node_modules/.bin/still-server docs/ -p ${port} -o

.PHONY: lint test clean docs test-docs
