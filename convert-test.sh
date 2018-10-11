#

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

rm -rf object/test-convert/
mkdir -p object/test-convert/
DST_PATH=object/test-convert/oneblock00.svg
node lib-daisy-diagram/daisy-diagram-cli.js example/oneblock00.daisydiagram ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

