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
    validate = layui.validate;
    form.verify(validate);
    //上传缩略图

    layui.use(['croppersnews'], function(){
        var $ = layui.jquery,
            croppers = layui.croppersnews;
        //创建一个图片裁剪上传组件
        var productImgCropper = croppers.render({
            elem: '#fengmian'
            ,saveW:480     //保存宽度
            ,saveH:297     //保存高度
            ,mark:4/3   //选取比例
            ,area:'900px'//弹窗宽度
            ,method : "post"
            ,url: proPath+'/fileupload/smallfile'
            ,headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME],
            }//图片上传接口返回和（layui 的upload 模块）返回的JOSN一样
            ,done: function(res){ //上传完毕回调
                //   $(".thumbImg").val(res.data.url);
                $('.thumbBox').css("background","#fff")
                $(".thumbImg").attr('src',res.data.url);
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


    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)",function(data) {

        let sum = lovexian.validateLength("input[id='newsTitleId']", 100, "新闻标题长度不能大于100");

        if (sum > 0) {
            return;
        }

        if ($('.thumbImg')[0].src == "") {
            layer.alert("图片不能为空", {time: 2000, icon: 5, shift: 6}, function (index) {
                layer.close(index);
            });
            return;
        }

        var abstract = $(".abstract").val().trim();
        var newsInfo = newsContent.getContent();
        if (newsInfo.trim() == "") {
            lovexian.alert.error("文章内容不能为空");
            return false;
        }

        if (abstract == "") {
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            abstract = newsInfo.substring(0, 50);
        }
        //弹出loading
        // var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        //实际使用时的提交信息
        var data = {
            id: $("input[name='id']").val(),
            newsTitle: $(".newsTitle").val(),  //文章标题
            content: newsContent.getContent(),  //文章内容
            newsAbstract: abstract,
            newsHeadPhoto: $(".thumbImg").attr("src"),  //缩略图
            TypeId: $(".newsTypeId select").val(),    //活动信息分类
            publishStatus: '1', //此字段不用，设置默认值
            checkState: $('.newsStatus select').val(),    //发布状态
            isTop: data.field.isTop == "on" ? "1" : "0",    //是否置顶
            languageType: $("#languageTypeId").val()
        };

        lovexian.modal.confirm("添加新闻信息", "确认添加新闻信息吗", function () {

            lovexian.post(proPath + 'admin/newsInfo/saveOrUpdate', data, function (res) {
                var status = $('.newsStatus select').val();
                layer.closeAll();

                if (res.status == '200') {
                    if (status == '100') {
                        lovexian.alert.success('保存草稿成功');
                    } else {
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    $("#resetBtn").click();
                } else {
                    lovexian.alert.error('保存失败:' + res.message);
                }
            });

        });
    });

    $("#cancelBtn").click(function () {
        layer.closeAll();
    });


    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
        return false;
    });

    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });

    //对外暴露的接口
    exports('news/newsAdd', {});
});