
let token = require("../models/token")
let config = require("../config/config")
let usertoken = require("../models/usertoken")
let { success, fail } = require("../utils/myUtils")
let transaction = require("../models/transaction")
let order = require("../models/order")

function handleSelectObjects(tokenData, param) {
    if (tokenData && tokenData.data && tokenData.data.length > 0) {
        return tokenData.data[0][param]
    }
    return null
}

module.exports = {
    transactionHtml: async (ctx) => {
        let { userid, tokenid, replacetokentype } = ctx.request.query
        console.log(JSON.stringify(ctx.request.query))

        //查询交易的token的数据
        let tokenData = await token.findTokenWithId(tokenid)
        //查询被交易的token的数据
        let replacetokenid = config.tokenType[replacetokentype]
        let replaceTokenData = await token.findTokenWithId(replacetokenid)

        //查询交易的token的余额
        let usertokenData = await usertoken.findUserToken(userid, tokenid)

        //查询被交易的token的余额
        let usertokenData2 = await usertoken.findUserToken(userid, replacetokenid)

        await ctx.render("transaction.html", {
            name: handleSelectObjects(tokenData, "name"),
            symbol: handleSelectObjects(tokenData, "symbol"),
            replacename: handleSelectObjects(replaceTokenData, "name"),
            replacesymbol: handleSelectObjects(replaceTokenData, "symbol"),
            availBalance: handleSelectObjects(usertokenData, "balance") - handleSelectObjects(usertokenData, "lockbalance"),
            replaceAvailBalacne: handleSelectObjects(usertokenData2, "balance") - handleSelectObjects(usertokenData2, "lockbalance"),
            replacetokentype: replacetokentype,
            tokenid: tokenid,
        })
    },

    transactionList: async(ctx) => {
        let { userid, tokenid, replacetokentype } = ctx.request.query
        console.log(JSON.stringify(ctx.request.query))
        let replacetokenid = config.tokenType[replacetokentype]
        let sell = await transaction.findTransaction(2, tokenid, replacetokenid)
        let buy = await transaction.findTransaction(1, tokenid, replacetokenid)
        let delegate = await transaction.findDelegateTransaction(userid, 0, tokenid, replacetokenid)
        // let myOrder = await order.findOrderWithUserid(userid, tokenid, replacetokenid)

        ctx.body = success({
            sell:sell.data,
            buy:buy.data,
            delegate:delegate.data,
            order: []
        })
    },

    addOrder: async (ctx) => {
        let body = ctx.request.body
        let { userid, price, count, tokenid, replacetokentype, type } = body
        console.log(JSON.stringify(body))
        let replacetokenid = config.tokenType[replacetokentype]

        //如果是用USDT买EOS，tokenid是EOS的id，replacetokenid是USDT的id
        //１．计算交易的金额（数量）,和交易的tokenid
        let checkId
        let transactionBalance
        if (type == "1") {
            //买，需要查USDT
            checkId = replacetokenid
            transactionBalance = price * count
        } else {
            //卖,需要查EOS
            checkId = tokenid
            transactionBalance = count
        }
        let usertokenData = await usertoken.findUserToken(userid, checkId)
        let balance = handleSelectObjects(usertokenData, "balance")
        if (balance == null) {
            ctx.body = fail("余额不足")
            return
        }
        let lockbalance = handleSelectObjects(usertokenData, "lockbalance")
        let availBalacne = balance - lockbalance
        //2.判断可用余额是否足够去挂单(可用余额与交易金额进行比较)
        if (availBalacne < transactionBalance) {
            ctx.body = fail("余额不足")
            return
        }
        //３．锁定余额
        await usertoken.addLockBalance(userid, checkId, transactionBalance)
        //4. 添加到挂单表
        let transactionModel = {
            userid: userid,
            tokenid: tokenid,
            replacetokenid: replacetokenid,
            count: count,
            price: price,
            status: 0,
            type: type,
            totalcount: count,
        }
        let { data } = await transaction.createTransaction(transactionModel)

        ctx.body = success("ok")

        //5.匹配交易
        let params = body
        params.id = data.insertId
        params.replacetokenid = replacetokenid
        //用新添加的挂单去匹配之前的的所有挂单
        await matchTransaction(params)
    }

}

async function matchTransaction(transactionData) {
    let { error, data } = await transaction.matchTransaction(transactionData)

    if (error || data == null || data.length == 0) {
        console.log("未能匹配对应的挂单")
        return
    }


    let index = 0
    //surplusCount记录新增的挂单还有多少量可以交易
    let surplusCount = transactionData.count
    while (surplusCount > 0 && index < data.length) {
        let rowData = data[index]
        let transactionCount

        if (rowData.count > surplusCount) {
            transactionCount = surplusCount
            surplusCount = 0
        } else {
            transactionCount = rowData.count
            surplusCount -= rowData.count
        }

        //处理被交易方的数据
        handleTransaction(rowData, transactionCount)
        //新增交易所收入数据
        //transactionCount*(rowData.price-transactionData.price)

        index++
    }

    //处理交易方的数据
    handleTransaction(transactionData, transactionData.count - surplusCount)

}

//匹配出来了一个叫交易进行处理
function handleTransaction(rowData, transactionCount) {
    //1. 更新挂单列表数据

    //2. 新增订单

    //3. 增加买的token数量
    //usdt : rowData.price*transactionCount


    //4. 减少卖的token数量
//usdt : rowData.price*transactionCount

}