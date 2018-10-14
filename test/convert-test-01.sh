#

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

rm -rf object/test-convert-01/
mkdir -p object/test-convert-01/

SRC_PATH=example/property-print_X.daisydiagram
DST_PATH=object/test-convert-01/$(basename ${SRC_PATH}).svg
node lib-daisy-diagram/daisy-diagram-cli.js ${SRC_PATH} ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=example/property-parent_block_style.daisydiagram
DST_PATH=object/test-convert-01/$(basename ${SRC_PATH}).svg
node lib-daisy-diagram/daisy-diagram-cli.js ${SRC_PATH} ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=example/line-text.daisydiagram
DST_PATH=object/test-convert-01/$(basename ${SRC_PATH}).svg
node lib-daisy-diagram/daisy-diagram-cli.js ${SRC_PATH} ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

