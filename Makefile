SHA := $(shell git rev-parse HEAD)
THIS_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)

all:
	@npm install

tmp = 'tmp_build'
clean:
	@rm -rf ${tmp}

get-xcharts: clean
	@git checkout master
	@make all build
	@mkdir -p ${tmp}
	@cp -r build* ${tmp}/
	@git checkout ${THIS_BRANCH}
	@rm views/js/xcharts.min.js views/js/xcharts.js
	@(cd views/js && ln -s ../../build/xcharts.min.js ./xcharts.min.js)
	@(cd views/js && ln -s ../../build/xcharts.js ./xcharts.js)
	@git commit -n -am "Automated updating xcharts" &>/dev/null

remote=origin
branch=gh-pages
build: clean
	@make get-xcharts -i
	@node_modules/.bin/lessc --yui-compress --include-path=views/less views/less/master.less views/css/master.css
	@node_modules/.bin/still views -o ${tmp} -i "layouts" -i "json" -i "less" -i "macro"
	@cp node_modules/d3/d3.v2.min.js ${tmp}/js/d3.v2.min.js
	@cp build/xcharts*js ${tmp}/js/
	@git checkout master
	@cp xcharts-build.tar.gz ${tmp}/xcharts-build.tar.gz
	@git checkout ${branch}
	@cp -r ${tmp}/* ./
	@rm -rf ${tmp}
	@git add .
	@git commit -n -am "Automated build from ${SHA}"
	@git push ${remote} ${branch}
	@git checkout ${THIS_BRANCH}

port = 3000
run:
	@node_modules/.bin/still-server views/ -p ${port} -o

lint:
	@echo '0 errors'

test:
	@echo ''

.PHONY: all, clean, get-xcharts, build, lint, test
