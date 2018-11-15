
let token = require("../models/token")

module.exports = {
    homeListHtml: async(ctx) => {

        let {error, data} = await token.findAllToken()

        await ctx.render("home.html", {
            list:data
        })
    }
}