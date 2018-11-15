$(document).ready(function () {

    let tokenid = $("input[name=tokenid]").val()
    let replacetokentype = $("input[name=replacetokentype]").val()
    console.log("tokenid:" + tokenid)
    console.log("replacetokentype:" + replacetokentype)
    $.get("/transactionlist", `tokenid=${tokenid}&replacetokentype=${replacetokentype}`, function (data, status) {
        console.log(status + JSON.stringify(data))
        if (data.code == 0) {
            
            //挂单中卖的列表
            let sellUl = $(".sell")
            let index = 0
            let sellLength = data.data.sell.length
            data.data.sell.forEach(element => {
                let liStr = `<li>
                    <span>卖${sellLength-index}</span>
                    <span>${element.price}</span>
                    <span>${element.count}</span>
                    </li>`
                sellUl.append(liStr)
                index++
            });
            

            //挂单中买的列表
            let buyUl = $(".buy")
            index = 0
            data.data.buy.forEach(element => {
                let liStr = `<li>
                    <span>买${index+1}</span>
                    <span>${element.price}</span>
                    <span>${element.count}</span>
                    </li>`
                buyUl.append(liStr)
                index++
            });

            //委托列表
            let entrustUl = $("#current-entrust-list")
            data.data.delegate.forEach(element => {
                let liStr = `<li>
                    <span>${new Date(element.updatetime).toLocaleString()}</span>
                    <span>${element.type==1? "买": "卖"}</span>
                    <span>${element.price}</span>
                    <span>${element.count}</span>
                    </li>`
                entrustUl.append(liStr)
            })

            //成交记录
            let orderUl = $("#order-list")
            data.data.order.forEach(element => {
                let liStr = `<li>
                    <span>${new Date(element.updatetime).toLocaleString()}</span>
                    <span>${element.type==1? "买": "卖"}</span>
                    <span>${element.price}</span>
                    <span>${element.count}</span>
                    </li>`
                entrustUl.append(liStr)
            })
            
        }
    })

    //买ｔｏｋｅｎ
    $(".transaction-buy-form").validate({
        submitHandler: function (form) {
            formRequest(form)
        }
    })
    $(".transaction-sell-form").validate({
        submitHandler: function (form) {
            formRequest(form)
        }
    })

    function formRequest(form) {
        var urlStr = "/addorder"
        alert("urlStr:" + urlStr)
        $(form).ajaxSubmit({
            url: urlStr,
            type: "post",
            dataType: "json",
            success: function (data, status) {
                console.log(status + JSON.stringify(data))
                if (data.code == 0) {
                    alert("挂单成功")
                } else {
                    alert(data.msg)
                }
            },
            error: function (data, status) {
                console.log(status + JSON.stringify(data))
            }
        });
    }
})
