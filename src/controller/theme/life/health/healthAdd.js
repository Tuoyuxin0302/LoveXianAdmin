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
    $ = layui.jquery,
        validate = layui.validate;
    //表单校验
    form.verify(validate);
    form.render();

    layui.use(['baseSetting','upload'],function () {
        var proPath = layui.baseSetting.LoveXianConfig.proApi,setter = layui.setter;
        //上传缩略图
        layui.upload.render({
            elem: '.thumbBox',
            url: proPath+'/fileupload/smallfile',
            method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
            headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            done: function(res, index, upload){
                $('.thumbImg').attr('src',res.data.url);
                $('.thumbBox').css("background","#fff");
            }
        });
    })


    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }


    //表单校验
    form.verify({
        title : function(val){
            if(val == ''){
                return "健康信息标题不能为空";
            }
        },
        content : function(val){
            if(val == ''){
                return "健康信息内容不能为空";
            }
        }
    });
    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)",function(data) {

        let sum = lovexian.validateLength("input[name='title']",100,"标题长度不能大于100");
        let subSum=lovexian.validateLength("input[name='subTitle']",400,"子标题长度不能大于400");

        if(sum > 0) {
            return;
        }
        if(subSum > 0){
            return;
        }

        // var abstract= $(".abstract").val().trim();
        var healthInfo = removeTAG(content.getContent());
        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }

        var data = {
            id:$("input[name='id']").val(),
            title : $(".title").val(),  //健康信息标题
            subtitle : $(".subTitle").val(),  //健康信息子标题
            content : content.getContent(),  //健康信息内容
            headImage : $(".thumbImg").attr("src"),  //缩略图
            // typeId : healthData.typeId,    //活动信息分类
            typeId : $('.workType select').val(),  //爱工作信息分类
            checkState : $('.actionStatus select').val(),    //发布状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
        };
        if(isEdit){

            if (lovexian.nativeEqual(healthData, data)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
        lovexian.post(proPath + 'admin/healthInfo/saveOrUpdate',data,function (res) {
            var status = data.checkState;
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
                return false
            }
            return false;
            // $('#lovexian-job').find('#query').click();
        });
    });

/*    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行健康信息内容页面访问");
        return false;
    });*/
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })
    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });

    //对外暴露的接口
    exports('theme/life/health/healthAdd', {});
});