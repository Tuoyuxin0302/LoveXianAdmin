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
        $ = layui.jquery;
    validate = layui.validate;
    //表单校验
    form.verify(validate);
    form.render();

    var del_State = 0;


    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath+'/fileupload/images',
        method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function(res, index, upload){
            $('.thumbImg').attr('src',res.data.imgUrl);
            $('.thumbBox').css("background","#fff");
        }
    });

    form.on("submit(addNews)",function(data){

        let sum = lovexian.validateLength("input[name='lawTitle']",200,"法律条文标题长度不能大于200");
        let subSum = lovexian.validateLength("input[name='lawSubtitle']",1000,"子标题长度不能大于1000");

        if(sum > 0) {
            return;
        }
        if(subSum > 0){
            return;
        }

        var lawAbstract= $(".lawAbstract").val().trim();
        var lawInfo = lawContent.getContentTxt();
        if(lawInfo.trim() == ""){
            lovexian.alert.error("法律条文内容不能为空");
            return false;
        }
        if(lawAbstract == ""){
            //如果没写摘要截取条文内容中的一部分文字放入文章摘要
            if(lawInfo.length >= 50){
                lawAbstract = lawInfo.substring(0,50);
            }else{
                lawAbstract = lawInfo.substring(0,lawInfo.length);
            }
        }

        var lawInfo = {
            id:$("input[name='id']").val(),
            lawTitle : $(".lawTitle").val(),  //文章标题
            lawSubtitle : $(".lawSubtitle").val(),  //文章子标题
            lawContent : lawContent.getContent(),  //文章内容
            lawAbstract: data.field.lawAbstract,

            checkState : $('.lawState select').val(),    //发布状态
            isShow : data.field.openness,
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            delState: del_State
        };
        if(isEdit){
            if (lovexian.nativeEqual(lawData, lawInfo)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
        lovexian.post(proPath + '/admin/lawInfo/saveOrUpdate',lawInfo,function (res) {//存入数据的路径
            var status = lawInfo.checkState;
            if(res.status=='200') {
                if (status == '0') {
                    lovexian.alert.success('保存草稿成功');
                } else {
                    lovexian.alert.success('发布成功，等待审核');
                }
                parent.$("#reset").click();
                layer.closeAll();
            }else{
                lovexian.alert.error('保存失败:'+res.message);
            }
            return false;
            // $('#lovexian-job').find('#query').click();
        });
    });
    $('#cancelBtn').click(function(){
        layer.closeAll();
    })

    //对外暴露的接口
    exports('theme/life/lawAdd', {});
})





