
let usertoken = require("../models/usertoken")
let {success, fail} = require("../utils/myUtils")
let token = require("../models/token")
let Contract = require("../models/contract")
let config = require("../config/config")
let walletorder = require("../models/walletorder")
let myUtils = require("../utils/myUtils")

module.exports = {
    cashHtml: async(ctx) => {

        let tokenid = ctx.request.query.id
        let userid = ctx.request.query.userid

        let {error, data} = await usertoken.findUsertokenWithId(userid, tokenid)
        console.log(JSON.stringify(data))
        data = data[0]

        //根据userid, tokenid,type查询用户在链上的交易记录
        let resData = await walletorder.findWalletOrder(userid, tokenid, 0)

        await ctx.render("cash.html", {
            availbalance: data.balance-data.lockbalance,
            symbol: data.symbol,
            tokenid: data.tokenid,
            list:resData.data,
        })
    },

    //提现表单被触发的方法
    cash: async(ctx) => {
        let body = ctx.request.body
        console.log(JSON.stringify(body))
        let {to, num, password, tokenid, userid} = body
        //通过tokenid获取代币相关数据
        let {error, data} = await token.findTokenWithId(tokenid)
        console.log(error)
        if (error || data==null || data.length <= 0) {
            ctx.body = fail("提现失败")
            return
        }
        data = data[0]
        //通过abi和address实例化智能合约对象
        let contract = await Contract.createContract(data.abi, data.address)
        //通过智能合约对象从中心账户发起转账
        let resData = await Contract.sendTokenTransaction(contract, config.centerAddress, to, parseFloat(num), config.privatekey)
        console.log(JSON.stringify(resData))
        if (resData.error) {
            ctx.body = fail("提现失败")
            return
        }
        //提现成功
        if(resData.code == 0) {
            //1.减少账户余额
            await usertoken.subBalance(userid, tokenid, num)

            //２．新增ｔｏｋｅｎ交易记录
            await walletorder.createWalletorder(userid, tokenid, resData.data.transactionHash, 0, num, to)
        }

        ctx.body = resData
    }
}