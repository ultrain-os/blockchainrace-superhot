#! /use/bin/env bash

function show_red_text() {
    echo -e "\n\033[31m $1 \033[0m"
}

function show_green_text() {
    echo -e "\n\033[32m $1 \033[0m"
}

function case_start() {
    echo -e "\n\033[32m START: ======== $1 ============= \033[0m"
}

function case_finish() {
    echo -e "\033[32m FINISH: ======= $1 ============ \033[0m \n"
}


clutooldir=/Users/liangqin/Public/ultrain-core/build/programs/clultrain
ultraincl $clutooldir/../..

clu=$clutooldir/clultrain

CONTRACT=./MyContract

# if [ -e $CONTRACT ]; then
#     rm -rf $CONTRACT
# fi
# cp -rf ./build $CONTRACT

$clu set contract jack $CONTRACT -p jack
action="$clu push action jack"

function issue {
    $action issue $1 -p jack
}

for i in {1..10}; do
    issue '{"to":"tom","tickets":[{"id":0,"title":"周杰伦演唱会","highestPrice":1000,"rebate":30,"commission":10}]}'
done


# 删除合约文件夹
# rm -rf $CONTRACT
