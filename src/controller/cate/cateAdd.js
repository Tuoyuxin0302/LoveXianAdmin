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
        $ = layui.jquery,
        // 非空校验
    validate = layui.validate;
    form.verify(validate);
    form.render();


// 上传照片
    layui.use(['croppers'], function(){
        var $ = layui.jquery,
            croppers = layui.croppers;
        //创建一个图片裁剪上传组件
        var productImgCropper = croppers.render({
            elem: '#fengmian'
            ,saveW:800     //保存宽度
            ,saveH:600     //保存高度
            ,mark:4/3   //选取比例
            ,area:'900px'//弹窗宽度
            ,method : "post"
            ,url: proPath+'/fileupload/smallfile'
            ,headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            }//图片上传接口返回和（layui 的upload 模块）返回的JOSN一样
            ,done: function(res){ //上传完毕回调
          //   $(".thumbImg").val(res.data.url);
                $('.thumbBox').css("background","#fff")
                $(".thumbImg").attr('src',res.data.url);
            }
        });
    })

    //表单校验
    form.verify();


// 保存图片
    form.on("submit(addNews)",function(data){
        let sum = lovexian.validateLength("input[name='cateTitle']",50,"标题长度不能大于50");
        if(sum > 0) {
            return;
        }
        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }

        var abstract= $(".abstract").val().trim();
        var actInfo = cateContent.getContentTxt();

        if(abstract == ""){
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            abstract = actInfo.substring(0,50);
        }


        if(isEdit){
            var cateInfo=form.val("cateContent");
            delete cateInfo.file;
            cateInfo.isTop=cateInfo.isTop=="on"?1:0;
            if (lovexian.nativeEqual(cateRichText,cateInfo)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }

        //实际使用时的提交信息
        var data = {
            id:$("input[name='id']").val(),
            cateTitle : $(".actionTitle").val(),  //文章标题
            cateSubtitle : $(".subTitle").val(),  //文章子标题
            cateContent : cateContent.getContent(),  //文章内容
            cateAbstract: abstract,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            checkState : $('.actionStatus select').val(),    //发布状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            isShow:$('#isShowId input[name="isShow"]:checked ').val(),

        };

        lovexian.modal.confirm("添加美食信息","确认提交美食信息吗？",function () {
            lovexian.post(proPath + 'admin/cateInfo/saveOrUpdate',data,function (res) {
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

    $('#cancelBtn').click(function(){
        layer.closeAll();

    })
    //对外暴露的接口
    exports('cate/cateAdd', {});
})