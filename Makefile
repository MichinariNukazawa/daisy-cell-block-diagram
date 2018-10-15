
.PHONY: all run clean

all:
	# NOP
	exit 1

run:
	#npm run build
	#node lib/daisy-diagram-cli.js

clean:
	rm -rf object/

.PHONY: test unittest command-line-test ci-test

ci-test: test
test: unittest command-line-test

command-line-test:
	bash command-line-test/command-line-test.sh
	bash command-line-test/convert-test-00.sh
	bash command-line-test/convert-test-01.sh

unittest:
	npm run test

