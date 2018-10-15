#
# depend: sudo apt install librsvg2-bin -y

set -ue
set -x

trap 'echo "$0(${LINENO}) ${BASH_COMMAND}"' ERR

# 引数不足の場合、失敗する
set +e
node lib-daisy-diagram/daisy-diagram-cli.js
RET=$?
set -e
[ 0 -ne $RET ]

# 以下の条件の引数を指定した場合、成功する
# 入力パス 有効なフォーマットのファイルへのパスである
# 出力パス 対応するファイルフォーマット(svg,png)かつ、ディレクトリを含むならばそれが存在する
rm -rf object/test-export/
mkdir -p object/test-export/
DST_PATH=object/test-export/empty-document.svg
node lib-daisy-diagram/daisy-diagram-cli.js fileformat-example/empty-document.daisydiagram ${DST_PATH}
rsvg-convert -o ${DST_PATH}.png ${DST_PATH} # check file type is svg.

# 引数が多すぎる場合、失敗する
set +e
node lib-daisy-diagram/daisy-diagram-cli.js fileformat-example/empty-document.daisydiagram object/test-export/empty-document.svg -h
RET=$?
set -e
[ 0 -ne $RET ]

