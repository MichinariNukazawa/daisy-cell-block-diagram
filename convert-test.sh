#

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

rm -rf object/test-convert/
mkdir -p object/test-convert/
node lib-daisy-diagram/daisy-diagram-cli.js example/oneblock00.daisydiagram object/test-convert/oneblock00.svg
STR=`file object/test-convert/oneblock00.svg` ; [[ "${STR}" =~ "SVG" ]] # file type

