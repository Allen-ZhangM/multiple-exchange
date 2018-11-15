
let token = require("../models/token")
let wallet = require("../models/wallet")
let walletorder = require("../models/walletorder")
let usertoken = require("../models/usertoken")
let contract = require("../models/contract")
let {success} = require("../utils/myUtils")

module.exports = {
    rechargeHtml: async(ctx) => {
        let {userid, id} = ctx.request.query
        console.log(userid+":"+id)

        let {data} = await token.findTokenWithId(id)
        data = data[0]

        let resData = await wallet.findWalletWithUseridAndType(userid, data.type)

        //根据userid, tokenid,type查询用户在链上的交易记录
        let walletorderResData = await walletorder.findWalletOrder(userid, id, 1)

        await ctx.render("recharge.html",{
            name:data.name,
            symbol:data.symbol,
            address:resData.data[0].address,
            list:walletorderResData.data,
        })
    },

    //查询用户有没有充值
    queryUserNewRecharge: async(ctx) => {
        let body = ctx.request.body
        let {userid} = body

        //遍历所有的token
        let {error, data} = await token.findAllToken()

        //记录是否有充值的代币
        let haveRecharge = false
        data.forEach(async token => {
            //1.查询tokenbalance
            let usertokenData = await usertoken.findUserToken(userid, token.id)
            let tokenbalance
            let haveRecode
            //需要判断是否有这条记录在usertoken表里面
            if (usertokenData.error || usertokenData.data == null || usertokenData.data.length == 0) {
                tokenbalance = 0;
                haveRecode = false
            } else {
                tokenbalance = usertokenData.data[0].tokenbalance
                haveRecode = true
            }
            //2.获取钱包地址
            let walletData = await wallet.findWalletWithUseridAndType(userid, token.type)
            let walletAddress = walletData.data[0].address
            //3.或者token合约相关数据，实例化只能合约对象
            //通过遍历已经可以获得
            let myContract = await contract.createContract(token.abi, token.address)
            //４．查询钱包地址余额
            let walletBalance = await myContract.methods.balanceOf(walletAddress).call()
            //将最小单位的金额转换为最单位的金额
            walletBalance = await contract.switchToMaxBalanceUint(myContract, walletBalance)
            //5.比较数据库中记录的钱包地址余额　与　链上查询的钱包地址余额是否相等
            if (walletBalance > tokenbalance) {
                haveRecharge = true;

                let rechargeBalance = walletBalance - tokenbalance
                //说明该token.id代币有充值
                //６．新增一条token交易记录
                await walletorder.createWalletorder(userid, token.id, "", 1, rechargeBalance, "")
                //7.修改或者新增usertoken的一条数据
                //7.1　判断有没有token.id这个币在usertoken表里面
                if (haveRecode) {
                    await usertoken.addBalanceToUsertoken(userid, token.id, rechargeBalance)
                } else {
                    await usertoken.createUsertoken(userid, token.id, rechargeBalance)
                }
            }

        });

        ctx.body = success(haveRecharge)
    }
}