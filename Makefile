
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

CLI_BIN := bin/daisy-cell-block-diagram-cli.js

command-line-test:
	bash command-line-test/invalid-test.sh		$(CLI_BIN)
	bash command-line-test/convert-test-00.sh	$(CLI_BIN)
	bash command-line-test/convert-test-01.sh	$(CLI_BIN)

unittest:
	npm run test

