#

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

[ 1 -eq $# ]
BIN=$1

OBJECT_DIR=obj/$(basename $0)
rm -rf ${OBJECT_DIR}/*
mkdir -p ${OBJECT_DIR}


# svg
FILES=`find ./fileformat-example -name "*.daisydiagram" -type f`
for F in $FILES; do
	# svg
	SOURCE_FILEPATH=$F
	DST_FILEPATH=${OBJECT_DIR}/$(basename ${SOURCE_FILEPATH}).svg

	${BIN} ${SOURCE_FILEPATH} -o ${DST_FILEPATH}
	[ -s ${DST_FILEPATH} ] # file is not zero size
	rsvg-convert -o ${DST_FILEPATH}.png ${DST_FILEPATH} # check file type is svg.
	[ -s ${DST_FILEPATH}.png ]
done

## svg size
SOURCE_FILEPATH=./fileformat-example/empty-document.daisydiagram
DST_FILEPATH=${OBJECT_DIR}/sample.svg
${BIN} ${SOURCE_FILEPATH} -o ${DST_FILEPATH}
[ -s ${DST_FILEPATH} ] # file is not zero size
# STR=`file ${DST_FILEPATH}` ; [[ "${STR}" =~ "SVG" ]] # file type # `file` is now work(SGML).
rsvg-convert -o ${DST_FILEPATH}.png ${DST_FILEPATH} # check file type is svg.
grep 'width="32"' ${DST_FILEPATH} > /dev/null
grep 'height="32"' ${DST_FILEPATH} > /dev/null

# png
FILES=`find ./fileformat-example -name "*.daisydiagram" -type f`
for F in $FILES; do
	# PlantUML(.puml)
	SOURCE_FILEPATH=$F
	DST_FILEPATH=${OBJECT_DIR}/$(basename ${SOURCE_FILEPATH}).png

	${BIN} ${SOURCE_FILEPATH} -o ${DST_FILEPATH}
	[ -s ${DST_FILEPATH} ] # file is not zero size
	STR=`file ${DST_FILEPATH}` ; [[ "${STR}" =~ "PNG" ]] # file type
done

