layui.define(['form','layer','admin','layedit','lovexian','laydate','upload','baseSetting','validate'],function(exports){
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
        $ = layui.jquery,
        validate = layui.validate;
    //表单校验
    form.verify(validate);
    form.render();
    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath+'/fileupload/smallfile',
        method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function(res, index, upload){
            $('.thumbImg').attr('src',res.data.url);
            $('.thumbBox').css("background","#fff");
        }
    });

    $("#cancelBtn").click(function () {
        layer.closeAll();
    });


    form.on("submit(addNews)",function(data){
        var actiondata=data;
        let sum=lovexian.validateLength("input[name='actTitle']",200,'标题长度不能大于200')+
            lovexian.validateLength("input[name='actSubtitle']",500,'子标题长度不能大于500')+
            lovexian.validateLength("textarea[name='actAbstract']",1000,'摘要长度不能大于1000');
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
            if(actInfo.length >= 100){
                abstract = actInfo.substring(0,100);
            }else{
                abstract = actInfo.substring(0,actInfo.length);
            }
        }
        var data = {
            id:$("input[name='id']").val(),
            actTitle : data.field.actTitle,  //文章标题
            actSubtitle : data.field.actSubtitle,  //文章子标题
            actContent : actContent.getContent(),  //文章内容
            actAbstract: data.field.actAbstract,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            actTypeId : parent.layui.$(".layui-tab-title .layui-this").attr("lay-id"),    //活动信息分类
            checkState : data.field.checkState,    //发布状态
            isShow: data.field.openness,
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
        };
        lovexian.modal.confirm('添加爱活动信息', '确定提交爱活动信息吗？', function () {
            lovexian.post(proPath + 'admin/actionInfo/saveOrUpdate',data,function (res) {
                var status = $('.actionStatus select').val();
                if(res.status == '200'){
                    if( status == '0'){
                        lovexian.alert.success('保存草稿成功');
                    }else{
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    layer.closeAll();
                    $('#resetBtn').click();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }
                return false;
            });
        });
    });
    //对外暴露的接口
    exports('theme/life/actionAdd', {});
})