layui.define(['form','layer','admin','layedit','lovexian','laydate','upload','baseSetting'],function(exports){
    var form = layui.form,
        admin = layui.admin,
        layer = layui.layer,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        laypage = layui.laypage,
        lovexian = layui.lovexian,
        setter = layui.setter,
        upload = layui.upload,
        layedit = layui.layedit,
        laydate = layui.laydate,
        $ = layui.jquery;

    form.render();

    form.on("radio(checkState)",function(data){
        if(data.elem.title == "审核拒绝"){
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #checkState").attr("lay-verify","required");
        }else{
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #checkState").removeAttr("lay-verify");
        }
    });

    form.on("submit(checkNews)",function(data){
        var data = {
            refuseReason : $("#refuseReason").val(),  //拒绝理由
            checkState : data.field.checkState,    //审核状态
            newsId: $("input[name='newsId']").val(),
            checkId: $("input[name='checkId']").val()
        };


        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/newsCheck/check',data,function (res) {
            lovexian.alert.success('审核完成');
            $('#resetBtn').click();
            layer.closeAll();
            return false;
            // $('#lovexian-job').find('#query').click();
        });
    })

    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
        return false;
    })

    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });
    //处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外
    function banBackSpace(e){
        var ev = e || window.event;//获取event对象
        var obj = ev.target || ev.srcElement;//获取事件源

        var t = obj.type || obj.getAttribute('type');//获取事件源类型

        //获取作为判断条件的事件类型
        var vReadOnly = obj.getAttribute('readonly');
        var vEnabled = obj.getAttribute('enabled');
        //处理null值情况
        vReadOnly = (vReadOnly == null) ? false : vReadOnly;
        vEnabled = (vEnabled == null) ? true : vEnabled;

        //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
        //并且readonly属性为true或enabled属性为false的，则退格键失效
        var flag1=(ev.keyCode == 8 && (t=="password" || t=="text" || t=="textarea")
            && (vReadOnly==true || vEnabled!=true))?true:false;

        //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
        var flag2=(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea")
            ?true:false;

        //判断
        if(flag2){
            return false;
        }
        if(flag1){
            return false;
        }
    }

    $("#cancelBtn").click(function () {
        layer.closeAll();
    });



    //禁止后退键 作用于Firefox、Opera
    document.onkeypress=banBackSpace;
    //禁止后退键 作用于IE、Chrome
    document.onkeydown=banBackSpace;
    /*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })

    //对外暴露的接口
    exports('news/newsInfoCheck', {});
})