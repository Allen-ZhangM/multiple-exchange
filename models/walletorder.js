
let sqlHelpper = require("../utils/sqlHelpper")
let myUtils = require("../utils/myUtils")

module.exports = {
    createWalletorder: async(userid, tokenid, hash, type, count, toaddress) => {
        let sql = "insert into walletorder values(0,?,?,?,?,?,?,?)"
        let params = [userid, tokenid, hash, type, count, myUtils.timestamp(), toaddress]
        let data = await sqlHelpper.query(sql, params)
        return data;
    },

    findWalletOrder: async(userid, tokenid, type) => {
        let sql = "select *from walletorder where userid=? and tokenid=? and type=?"
        let data = await sqlHelpper.query(sql, [userid, tokenid, type])
        data.data.forEach(element => {
            element.createtime = myUtils.timestampToTime(element.createtime)
        });
        return data;
    }
}