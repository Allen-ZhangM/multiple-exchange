
let sqlHelpper = require("../utils/sqlHelpper")

module.exports = {
    findOrderWithUserid: async(userid, tokenid, replacetokenid) => {
        let sql =　`select transaction.price from order inner join transaction on order.transactionid=transaction.id and order.userid=? and tokenid=? and replacetokenid=?`
        return await sqlHelpper.query(sql, [userid, tokenid, replacetokenid])
    }
}
