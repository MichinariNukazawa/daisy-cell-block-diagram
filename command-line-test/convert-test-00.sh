#

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

rm -rf object/test-convert-00/
mkdir -p object/test-convert-00/

DST_PATH=object/test-convert-00/oneblock00.svg
node bin/daisy-cell-block-diagram-cli.js fileformat-example/oneblock00.daisydiagram -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/block-2.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/block-text-attr.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/property-cell_block-size.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/property-cell_block-parent_margin.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/block-child_elements.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/line.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

SRC_PATH=fileformat-example/line-arrow.daisydiagram
DST_PATH=object/test-convert-00/$(basename ${SRC_PATH}).svg
node bin/daisy-cell-block-diagram-cli.js ${SRC_PATH} -o ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

