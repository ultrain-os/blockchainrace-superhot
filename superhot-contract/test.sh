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

CONTRACT=MyContract

if [ -e $CONTRACT ]; then
    rm -rf $CONTRACT
fi
cp -rf ./build $CONTRACT

$clu set contract jack $CONTRACT -p jack
action="$clu push action jack"

function issue {
    $action issueTickets $1 -p jack
}

issue '{"issueInfo":{"showName":"2020西太湖国际音乐节","showPlace":"常州西太湖中国花卉博览景区北门","showTime":"09-19周六9:00","issueTime":"2020年8月25日8:05:00","issueAmount":400,"highestPrice":499,"lowestPrice":189,"maxTransferCount":2,"transRebates":[2,3]}}'

$action issuedIds '[]' -p jack

# 删除合约文件夹
rm -rf $CONTRACT
