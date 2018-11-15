
$(document).ready(function () {

    //提现
    $("#cash-form").validate({
        submitHandler: function (form) {
            var urlStr = "/cash"
            $(form).ajaxSubmit({
                url: urlStr,
                type: "post",
                dataType: "json",
                success: function (data, status) {
                    console.log(status + JSON.stringify(data))
                    if (data.code == 0) {
                        alert("提现成功")
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
})



