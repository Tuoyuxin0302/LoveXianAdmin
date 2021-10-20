layui.define(['form','layer','admin','layedit','lovexian','validate','laydate','upload','baseSetting'],function(exports){
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
        $ = layui.jquery ,
        // 非空校验
    validate = layui.validate;
    form.verify(validate);

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }


    form.on("submit(addNews)",function(data){
        if($(".thumbImg").attr("src")==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                // 回调方法
                layer.close(index);
            });
            return ;
        }
        let sum=lovexian.validateLength("input[name='actionTitle']",200,'标题长度不能大于200')+
            lovexian.validateLength("input[name='subTitle']",500,'子标题长度不能大于500')+
            lovexian.validateLength("textarea[name='abstract']",1000,'摘要长度不能大于1000');
        if(sum>0){
            return;
        }
        var abstract= $(".abstract").val().trim();
        var actInfo = actContent.getContentTxt();
        if(actInfo.trim() == ""){
            lovexian.alert.error("文章内容不能为空");
            return false;
        }
        if(abstract == ""){
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            if(actInfo.length >= 1000){
                abstract = actInfo.substring(0,1000);
            }else{
                abstract = actInfo.substring(0,actInfo.length);
            }
        }
        //弹出loading
        // var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        //实际使用时的提交信息
        var data = {
            id:$("input[name='id']").val(),
            investTitle : data.field.actionTitle,  //文章标题
            investSubtitle : data.field.subTitle,  //文章子标题
            investContent : actContent.getContent(),  //文章内容
            investAbstrinvest: abstract,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            investTypeId : parent.layui.$(".layui-tab-title .layui-this").attr("lay-id"),    //信息分类
            checkState : data.field.checkState,    //发布状态
            languageType:$("#languageTypeId").val(),
            isShow: data.field.openness,
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
        };
        lovexian.modal.confirm('添加爱投资信息', '确定提交资投资信息吗？', function () {
            lovexian.post(proPath + 'admin/investInfo/saveOrUpdate',data,function (res) {
                var status = $('.newsStatus select').val();
                if(res.status == '200'){
                    if( status == '0'){
                        lovexian.alert.success('保存草稿成功');
                    }else{
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    layer.closeAll();
                    parent.$("#resetBtn").click();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }
                return false;
            });
        });

    });

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

    $("#cancelBtn").click(function () {
        layer.closeAll();
    });


    //对外暴露的接口
    exports('theme/life/investAdd', {});
})