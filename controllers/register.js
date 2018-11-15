
let user = require("../models/user")
let {success, fail} = require("../utils/myUtils")
let wallet = require("../models/wallet")
let web3 = require("../utils/myUtils").getweb3()
let myUtils = require("../utils/myUtils")

module.exports = {
    //注册页面
    registerHtml: async(ctx) => {
        await ctx.render("register.html")
    },

    //注册表单提交的处理方法
    register: async (ctx) => {
        let body = ctx.request.body
        let {username, password, repassword} = body
        console.log(JSON.stringify(body))

        //１．先判断该用户是否存在
        let {error, data} = await user.findUserWithUsername(username)
        if (error || data.length > 0) {
            if (error) {
                ctx.body = fail("注册失败")
            } else {
                ctx.body = fail("用户已经存在")
            }
            return
        }

        //2.将注册的用户数据存入表中
        data = await user.createUser(username, myUtils.md5(password))
        if (data.error) {
            ctx.body = fail("注册失败")
            return
        }

        //３．创建用户所需钱包（主要用于交易所判断，该用户是否有充值），先只支持基于一台坊的钱包
        let walletModel = await createWalletAccount(data.data.insertId)
        await wallet.createWallet(walletModel)

        console.log(JSON.stringify(data))

        ctx.body = success("ok")
    }
}

async function createWalletAccount(insertId) {
    //3.1.创建钱包账号
    let walletPassword = myUtils.salt()
    let account = web3.eth.accounts.create(walletPassword)
    console.log(account)
    //3.2.根据账号和密码生成keystore配置文件
    let keystore = account.encrypt(walletPassword)
    console.log(keystore)
    //3.3.将keysotr转换为ｓｔｒｉｎｇ
    let keystoreString = JSON.stringify(keystore)
    //3.4生成wallet对象
    let walletModel = {}
    walletModel.userid = insertId
    walletModel.address = account.address
    walletModel.privatekey = account.privateKey
    walletModel.password = walletPassword
    walletModel.keystore = keystoreString
    return walletModel
}