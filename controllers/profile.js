let token = require("../models/token")

module.exports = {
    profileHtml: async (ctx) => {
        let body = ctx.request.query
        let userid = body.userid
        //通过userid获取它的ｔｏｋｅｎ余额
        let {error, data} = await token.findAllTokenWitherUserid(userid)
        console.log(data)
        await ctx.render("profile.html", {
            list:data
        })
    },
}