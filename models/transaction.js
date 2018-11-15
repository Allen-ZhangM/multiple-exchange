
let sqlHelpper = require("../utils/sqlHelpper")
let myUtile = require("../utils/myUtils")

module.exports = {
    transactionModel: {
        id:0,
        userid:0,
        tokenid:0,
        replacetokenid:0,
        count:0,
        price:0,
        status:0,
        type:0,
        totalcount:0,
        createtime:0,
        updatetime:0
    },


    createTransaction: async (transaction) => {

        let sql = "insert into transaction values (?,?,?,?,?,?,?,?,?,?,?)"
        let params = [0, transaction.userid, transaction.tokenid, transaction.replacetokenid, transaction.count, transaction.price, 
            transaction.type, transaction.status, myUtile.timestamp(), myUtile.timestamp(), transaction.totalcount]
        return await sqlHelpper.query(sql, params)
    },

    matchTransaction: async(transaction) => {
        let sql = `select *from transaction where 
        status=0 and type!=? and userid!=? and tokenid=? and replacetokenid=? and count>0 
        and price ${transaction.type==1? "<" : ">"} ?
        order by price ${transaction.type==1? "asc" : "desc"}`

        let params = [transaction.type, transaction.userid, transaction.tokenid, transaction.replacetokenid, transaction.price]
        return await sqlHelpper.query(sql, params)
    },

    findTransaction: async(type, tokenid, replacetokenid) => {
        let sql = `select *from transaction where 
        type=? and status=0 and count>0 and tokenid=? and replacetokenid=?
        order by price desc`
        let params = [type, tokenid, replacetokenid]
        return await sqlHelpper.query(sql, params)
    },

    findDelegateTransaction: async(userid, status, tokenid, replacetokenid) => {
        let sql = "select *from transaction where userid=? and status=? and tokenid=? and replacetokenid=?"
        return await sqlHelpper.query(sql, [userid, status, tokenid, replacetokenid])
    }
}