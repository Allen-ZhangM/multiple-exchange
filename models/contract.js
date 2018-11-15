
let web3 = require("../utils/myUtils").getweb3()
let {success, fail} = require("../utils/myUtils")

module.exports = {
    //将最小单位的金额转换为最单位的金额
    switchToMaxBalanceUint: async(myContract, balance) => {
        let decimal = await myContract.methods.decimals().call()
        return balance / (Math.pow(10, decimal))
    },

    createContract: async(abi, address) => {
        return new web3.eth.Contract(JSON.parse(abi), address)
    },

    sendTokenTransaction: async (myContract, fromaddress, toaddress, number, privatekey) => {

        var Tx = require('ethereumjs-tx');
        var privateKey = new Buffer(privatekey.slice(2), 'hex')

        let nonce = await web3.eth.getTransactionCount(fromaddress)
        let gasPrice = await web3.eth.getGasPrice()

        let decimals = await myContract.methods.decimals().call()
        let balance = number * Math.pow(10, decimals)

        let myBalance = myContract.methods.balanceOf(fromaddress).call()
        if (myBalance < balance) {
            ctx.body = fail("余额不足")
            return
        }
        let tokenData = await myContract.methods.transfer(toaddress, balance).encodeABI()

        var rawTx = {
            nonce: nonce,
            gasPrice: gasPrice,
            to: myContract.options.address,//如果转的是ｔｏｋｅｎ代币，那么这个ｔｏ就是合约地址
            from: fromaddress,
            data: tokenData//转ｔｏｋｅｎ会用到的一个字段
        }
        //需要讲交易的数据进行预估ｇａｓ计算，然后将ｇａｓ值设置到数据参数中
        let gas = await web3.eth.estimateGas(rawTx)
        rawTx.gas = gas

        var tx = new Tx(rawTx);
        tx.sign(privateKey);

        var serializedTx = tx.serialize();

        // console.log(serializedTx.toString('hex'));
        // 0xf889808609184e72a00082271094000000000000000000000000000000000000000080a47f74657374320000000000000000000000000000000000000000000000000000006000571ca08a8bbf888cfa37bbf0bb965423625641fc956967b81d12e23709cead01446075a01ce999b56a8a88504be365442ea61239198e23d1fce7d00fcfc5cd3b44b7215f

        let responseData;
        await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function(err, data) {
            console.log(err)
            console.log(data)

            if (err) {
                responseData = fail(err)
            }
        })
        .then(function(data) {
            console.log(data)
            if (data) {
                responseData = success({
                    "blockHash":data.blockHash,
                    "transactionHash":data.transactionHash
                })
            } else {
                responseData = fail("交易失败")
            }
        })

        return responseData
    }
}