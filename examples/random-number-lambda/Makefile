SHELL := /bin/bash

build: install
	npx nx run build-module --verbose --output-style=stream

# Build only this module (without dependencies)
build-module:
	yarn install --frozen-lockfile --ignore-optional

lint:
	npx prettier --loglevel warn --check .
	npx eslint . --ext .ts
	npx tsc -noEmit --skipLibCheck
	yarn audit; [[ $? -ge 8 ]] && exit 1 || exit 0

lint-fix:
	npx prettier --loglevel warn --write .
	npx eslint . --ext .ts --fix

test: unit-tests

unit-tests:
	npx jest

package: stagereq
	npx sls package --stage ${STAGE} --verbose

deploy: stagereq build
	npx sls deploy --stage ${STAGE} --verbose

integration-tests:
	curl ${ENVIRONMENT_URL} -v

undeploy: stagereq build
	npx sls remove --stage ${STAGE} --verbose

stagereq:
	@if [ "${STAGE}" == "" ]; then \
  	  	echo "ENV STAGE is required";\
    	exit 1;\
	fi

start: build
	APPCONFIG_APPLICATION_ID=upp1jmh APPCONFIG_ENVIRONMENT_ID=l5yc7pm APPCONFIG_CONFIGURATION_PROFILE_ID=9rlgfs6 sls offline --stage local

all: build lint unit-tests deploy

clean:
	rm -rf node_modules

install: node_modules
	yarn install --frozen-lockfile --ignore-optional