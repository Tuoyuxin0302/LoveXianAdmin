layui.define(['form', 'layer', 'admin', 'layedit', 'lovexian', 'laydate', 'upload', 'baseSetting'], function (exports) {
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


    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath + '/fileupload/smallfile',
        method: "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function (res, index, upload) {
            $('.thumbImg').attr('src', res.data.url);
            $('.thumbBox').css("background", "#fff");
        }
    });



    //表单校验
    form.verify({
        houseTitle: function (val) {
            if (val == '') {
                return "文章标题不能为空";
            }
        },
        subTitle: function (val) {
            if (val == '') {
                return "子标题不能为空";
            }
        }
    });

    function removeTAG(str) {
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)", function (data) {

        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }

        var abstract = $(".abstract").val().trim();
        var actInfo = houseContent.getContentTxt();
        if (abstract == "") {
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            abstract = actInfo.substring(0, 50);
        }


        //实际使用时的提交信息
        var data = {
            id:$("input[name='id']").val(),
            houseTitle: $(".actionTitle").val(),  //文章标题
            houseSubtitle: $(".subTitle").val(),  //文章子标题
            houseContent: houseContent.getContent(),  //文章内容
            houseAbstract: abstract,
            headImage: $(".thumbImg").attr("src"),  //缩略图
            houseTypeId:  parent.layui.$(".layui-tab-title .layui-this").attr("lay-id"),    //活动信息分类
            checkState: $('.actionStatus select').val(),    //发布状态
            isTop: data.field.isTop == "on" ? "1" : "0",    //是否置顶
            isShow: $('#isShowId input[name="openness"]:checked ').val()
        };
        lovexian.modal.confirm("添加爱有家信息","确认添加爱有家信息吗",function () {
            lovexian.post(proPath + 'admin/houseInfo/saveOrUpdate', data, function (res) {


                var status = $('.actionStatus select').val();
                layer.closeAll();

                if(res.status == '200'){
                    if( status == '100'){
                        lovexian.alert.success('保存草稿成功');
                    }else{
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    parent.layui.$("input[name='query']").click();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }
            });

        })
    });



/*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })
    //对外暴露的接口
    exports('theme/life/house/houseAdd', {});
})