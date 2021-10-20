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
// 上传照片
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

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }

    form.verify({


        newsName : function(val){
            if(val == ''){
                return "工作标题不能为空";
            }
        },
        content : function(val){
            if(val == ''){
                return "工作内容不能为空";
            }
        }
    });

    function getData(data1,data2){
        var abstract= $(".abstract").val().trim();
        var workInfo = removeTAG(workContent.getContent());
        if(abstract == ""){
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            abstract = workInfo.substring(0,50);
        }
        var data= {
            id: $("input[name='id']").val(),
            workTitle: $(".workTitle").val(),  //文章标题
            workSubtitle: $(".subTitle").val(),  //文章子标题
            workContent: workContent.getContent(),  //文章内容
            workAbstract: abstract,
            workHeadPhoto: $(".thumbImg").attr("src"),  //缩略图
            workTypeId: $('.workType select').val(),  //爱工作信息分类
            checkState: $('.workStatus select').val(),    //发布状态
            isTop: data1.field.isTop == "on" ? "1" : "0",    //是否置顶
            languageType: 1,

        };
        if(data2==true){
             return data;
        }else {
             data.checkState=100;
            return data;
        }

    }


    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }
    form.on("submit(addNews)",function(data){

        let sum = lovexian.validateLength("input[id='workTitle']",100,"标题长度不能大于100");
        if(sum > 0) {
            return;
        }
        let subSum = lovexian.validateLength("input[name='subTitle']",100,"子标题长度不能大于100");
        if(subSum > 0){
            return;
        }
        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }
      var workMessage = getData(data,true);
        if(isEdit){
            if (lovexian.nativeEqual(workData, workMessage)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
        lovexian.post(proPath + 'admin/workInfoAdmin/saveOrUpdate',workMessage,function (res) {
            var status = $('.workStatus select').val();
            if(res.status=='200') {
                if (status == '100') {
                    lovexian.alert.success('保存草稿成功');
                    layer.closeAll();
                } else {
                    lovexian.alert.success('发布成功，等待审核');
                    layer.closeAll();
                }
            }else{

                lovexian.alert.error('保存失败:'+res.message);
            }
            parent.$("#reset").click();
        });
        $reset.click();
    });
    form.on("submit(cancelBtn)",function(data){
        var lable = 0;
        if ($(".workTitle").val()=='') {lable++;}
        if($(".subTitle").val()==''){lable++;}
        if($(".abstract").val()==''){lable++;}
        if(lable ===3){
            alert("输入值为空")
            layer.closeAll();
        }
        else{
        layer.open({
            type: 1
            ,title: false //不显示标题栏
            ,closeBtn: false
            ,area: '300px;'
            ,shade: 0.8
            ,id: 'LAY_layuipro' //设定一个id，防止重复弹出
            ,btn: ['保存草稿', '取消']
            ,btnAlign: 'c'
            ,moveType: 1 //拖拽模式，0或者1
            ,content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">是够保存草稿</div>'
            ,success: function(layero){

                var btn = layero.find('.layui-layer-btn');
                btn.find('.layui-layer-btn0').click(function(){
                    var workInfo = getData(data,false);
                    console.log(workInfo);
                    lovexian.post(proPath + 'admin/workInfoAdmin/saveOrUpdate',workInfo,function (res) {
                        var status = workInfo.checkState;
                        if(res.status=='200') {
                            if (status == '100') {
                                lovexian.alert.success('保存草稿成功');
                                parent.$("#reset").click();
                                layer.closeAll();
                            }
                        }
                        else{
                            lovexian.alert.success('保存草稿异常'+res.message());
                            return false;
                        }
                    });
                });
                btn.find('.layui-layer-btn1').click(function(){
                    layer.closeAll();
                });
            }
        });}
    });

    //对外暴露的接口
    exports('theme/work/workAdd', {});
});