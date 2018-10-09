
.PHONY: all run clean

all:
	# NOP
	exit 1

run:
	#cd lib-daisy-diagram && npm run build
	#node lib-daisy-diagram/daisy-diagram-cli.js

clean:
	rm -rf object/ release/

.PHONY: test unittest

test: unittest command-line-test

command-line-test:
	bash command-line-test.sh

unittest:
	cd lib-daisy-diagram && npm run test

