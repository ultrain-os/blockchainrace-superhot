const { createU3, U3Utils } = require("u3.js");
const config = require("../config");
const account = "jack";
const u3 = createU3(config);

async function issueTickets() {
    const contract = await u3.contract(account);
    const isueParams1 = { // issueId 6
        showName: '2020西太湖国际音乐节',
        showPlace: '常州西太湖中国花卉博览景区北门',
        showTime: '09-19 周六  9:00',
        issueTime: '2020年8月25日 8:05:00',
        issueAmount: 400,
        highestPrice: 499,
        lowestPrice: 189,
        maxTransferCount: 2,
        transRebates: [2, 3]
    };

    const isueParams2 = {// issueId 7
        showName: '2020西太湖国际音乐节',
        showPlace: '常州西太湖中国花卉博览景区北门',
        showTime: '09-20 周日  9:00',
        issueTime: '2020年8月25日 9:01:21',
        issueAmount: 400,
        highestPrice: 499,
        lowestPrice: 189,
        maxTransferCount: 2,
        transRebates: [2, 3]
    };

    const isueParams3 = { // issueId 8
        showName: '英国音乐剧《三只小熊》中文版',
        showPlace: '浦东大戏院',
        showTime: '10-6 周五 13:30',
        issueTime: '2020年8月25日 9:01:21',
        issueAmount: 360,
        highestPrice: 180,
        lowestPrice: 144,
        maxTransferCount: 2,
        transRebates: [2, 3]
    };

    const tickets = [isueParams3];

    for (let t of tickets) {
        await contract.issueTickets({issueInfo: t}, { authorization: [`${account}@active`] });
    }
}

async function issuedIds() {
    const contract = await u3.contract(account);
    const tx = await contract.issuedIds({ authorization: [`${account}@active`] });
    console.log('issuedIds: ', tx.processed.action_traces[0].return_value);
}

async function issueInfo(issueId) {
    const contract = await u3.contract(account);
    const tx = await contract.issueInfo(issueId, { authorization: [`${account}@active`] });
    console.log('issueInfo: ', tx.processed.action_traces[0].return_value);
}

async function SellTicket1(nft) {
    const contract = await u3.contract(account);
    // const nft = '11958334904367841280';
    const sellinfo = {
        price: 19900, // 交易金额
        platformFee: 995, // 平台手续费
        sellerIncoming: 18905, // 卖方收入
        seller: '周末哪里玩',
        buyer: '158****0639',
        time: '2020-08-25 12:43:19', // 时间
        status: '已完成', // 状态
        txId: ''
    }
    let tx = await contract.firstSellTicket({nft, sellinfo}, { authorization: [`${account}@active`] });
    console.log('first sell of : ', nft, tx.processed.action_traces[0].return_value);

    const transfer1 = {
        ticketPrice: 39900, // 票价
        buyerFee: 399, // 买方手续费
        buyerPaied: 40299, // 买方实付金额
        sellerFee: 399, // 卖方手续费
        sellerIncoming: 39501, // 卖方实际收入
        sellerAccount: '158****0639', // 卖方账号
        buyerAccount: '180****7121', // 买方账号
        time: '2020-08-26 10:03:00', // 交易时间
        status: '已完成', // 交易状态
        txId: '' // 交易id
    }
    tx = await contract.transferTicket({nft, transferInfo: transfer1}, { authorization: [`${account}@active`] });
    console.log('first transfer of : ', nft, tx.processed.action_traces[0].return_value);

    const transfer2 = {
        ticketPrice: 49900, // 票价
        buyerFee: 749, // 买方手续费
        buyerPaied: 50649, // 买方实付金额
        sellerFee: 749, // 卖方手续费
        sellerIncoming: 49151, // 卖方实际收入
        sellerAccount: '180****7121', // 卖方账号
        buyerAccount: '177****7509', // 买方账号
        time: '2020-08-28 15:22:05', // 交易时间
        status: '已完成', // 交易状态
        txId: '' // 交易id
    }
    tx = await contract.transferTicket({nft, transferInfo: transfer2}, { authorization: [`${account}@active`] });
    console.log('second transfer of : ', nft, tx.processed.action_traces[0].return_value);

}

async function SellTicket2(nft) {
    const contract = await u3.contract(account);
    // const nft = '11958334992951541760';
    const sellinfo = {
        price: 14400, // 交易金额
        platformFee: 720, // 平台手续费
        sellerIncoming: 13680, // 卖方收入
        seller: '周末哪里玩',
        buyer: '158****0639',
        time: '2020-08-25 17:28:06', // 时间
        status: '已完成', // 状态
        txId: ''
    }
    let tx = await contract.firstSellTicket({nft, sellinfo}, { authorization: [`${account}@active`] });
    console.log('first sell of :', nft, tx.processed.action_traces[0].return_value);

    const transfer1 = {
        ticketPrice: 15800, // 票价
        buyerFee: 158, // 买方手续费
        buyerPaied: 15958, // 买方实付金额
        sellerFee: 158, // 卖方手续费
        sellerIncoming: 15642, // 卖方实际收入
        sellerAccount: '158****0639', // 卖方账号
        buyerAccount: '180****7121', // 买方账号
        time: '2020-08-27 19:03:40', // 交易时间
        status: '已完成', // 交易状态
        txId: '' // 交易id
    }
    tx = await contract.transferTicket({nft, transferInfo: transfer1}, { authorization: [`${account}@active`] });
    console.log('first transfer of :', nft, tx.processed.action_traces[0].return_value);

    const transfer2 = {
        ticketPrice: 18000, // 票价
        buyerFee: 270, // 买方手续费
        buyerPaied: 18270, // 买方实付金额
        sellerFee: 270, // 卖方手续费
        sellerIncoming: 17740, // 卖方实际收入
        sellerAccount: '180****7121', // 卖方账号
        buyerAccount: '151****8699', // 买方账号
        time: '2020-08-27 20:55:04', // 交易时间
        status: '已完成', // 交易状态
        txId: '' // 交易id
    }
    tx = await contract.transferTicket({nft, transferInfo: transfer2}, { authorization: [`${account}@active`] });
    console.log('second transfer of : ', nft, tx.processed.action_traces[0].return_value);

}

issueTickets().then((value) => console.log('success: ', value)).catch(e => console.log('exception: ', e));
issuedIds();

// issueInfo(1);  //  [11958338677228175360,11958338677228175361]
// SellTicket1('11958338677228175360');

// issueInfo(3);  // [11958338720177848320,11958338720177848321]
// SellTicket2('11958338720177848320');