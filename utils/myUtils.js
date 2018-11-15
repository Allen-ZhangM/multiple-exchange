
let crypto = require("crypto")
let config = require("../config/config")

module.exports = {
    timestamp: () => {
        return Date.now()
    },

    timestampToTime: (tm) => {
        return new Date(tm).toLocaleString();
    },

    md5: (text) => {
        return crypto.createHash("md5").update(String(text)).digest("hex");
    },

    // 生成 随机字符串
    salt: () => {
        var time = Date.now() % 100,
            str = '';
        time = time === 0 ? '00' : String(time);

        for (var i = 0; i < 8; i++) {
            // 65 A 97 a base > 65  base < 97
            const base = Math.random() < 0.5 ? 65 : 97;
            str += String.fromCharCode(
                base + Math.floor(Math.random() * 26)
            );
        }
        return time + str;
    },

    getweb3: () => {
        let Web3 = require("web3")
        var web3 = new Web3(Web3.givenProvider || config.web3URL);
        // var web3 = new Web3(Web3.givenProvider || 'https://kovan.infura.io/v3/bc76cd31e8bf48f9a28b73770ffca805');

        return web3
    },

    success: (data) => {
        responseData = {
            code: 0,
            status: "success",
            data: data
        }
        return responseData
    },

    fail: (msg) => {
        responseData = {
            code: 1,
            status: "fail",
            msg: msg
        }
        return responseData
    }
}