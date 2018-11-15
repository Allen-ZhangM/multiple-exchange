let sqlHelpper = require("../utils/sqlHelpper")

module.exports = {
    findAllTokenWitherUserid: async(userid) => {
        //通过ｔｏｋｅｎ左外连接usertoken表进行查询，查到用户拥有的所有ｔｏｋｅｎ，及对应的余额
        let sql = `select token.id,token.name,token.symbol,usertoken.balance,usertoken.lockbalance 
        from token left join usertoken on 
        userid=? and token.id=usertoken.tokenid order by balance desc`
        params = [userid]
        let data = sqlHelpper.query(sql, params)
        return data
    },

    findTokenWithId: async(userid) => {
        let sql = "select *from token where id=?"
        let data = await sqlHelpper.query(sql, [userid])
        return data
    },

    findAllToken: async() => {
        let sql = "select *from token"
        let data = await sqlHelpper.query(sql, [])
        return data
    }
}