layui.define(['form','layer','admin','layedit','lovexian','laydate','upload','baseSetting','rate'],function(exports){
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
    laydate.render({
        elem: '#workTime',
        lang:'en',
        position:'fixed',
        zIndex: 99999999
    });


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

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }

    form.verify({
        name : function(val){
            if(val == ''){
                return "律师姓名不能为空";
            }
        },
        locationName:function(val)
        {
            if(val =='')
            {
                return "工作机构不能为空"
            }
        },
        telNumber:function(val){
            if(val == ''){
                return "手机号码不能为空"
            }
        },
        skillField:function(val){
            if(val == ''){
                return "擅长领域不能为空"
            }
        },
        thumbImg: function () {

            if(typeof ($(".thumbImg").attr("src"))=="undefined")
            {
                return "请上传图片";
            }
        },
    });

    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }
    form.on("submit(addNews)",function(data){

        let sum = lovexian.validateLength("input[name='lawerName']",100,"律师姓名长度不能大于100");
        let subSum = lovexian.validateLength("input[name='lawerOrganization']",500,"机构名称长度不能大于500");

        if(sum > 0) {
            return;
        }
        if(subSum > 0){
            return;
        }

        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }
        var id = $("input[name='id']").val();
        var lawerName = $('.lawerName').val();
        var lawerOrganization = $('.lawerOrganization').val();//name用#,class 别名用.
        var telNumber=$('.telNumber').val();
        var workTime=new Date($('.workTime').val());
        var skillField=$('.skillField').val();
        var lawerAbstract=$('.lawerAbstract').val();
        var others=$('.others').val();
        var $headImage=$('.thumbImg').attr("src");
        var checkState= $('.lawerStatus select').val();   //发布状态
        var star = starNum | starEle.config.value;

        if(  star===0 ||star===null)
        {
            layer.alert("没有评分",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }
            var lawerInfo = {
                id:id,
                lawerName:lawerName,
                lawerOrganization:lawerOrganization,
                telNumber:telNumber,
                // workTime:workTime,
                lawerAbstract:lawerAbstract,
                skillField:skillField,
                star:star,
                checkState:checkState,
                lawerHeadPhoto : $headImage,  //缩略图
                languageType :0,    //发布状态
                isTop: data.field.isTop == "on" ? "1" : "0",    //是否置顶
                workTime:workTime,
            };

        if(isEdit){
            if (lovexian.nativeEqual(lawerData, lawerInfo)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
            stars = 0;
            lovexian.post(proPath + '/admin/lawerInfo/saveOrUpdate',lawerInfo,function (res) {//存入数据的路径
                var status =lawerInfo.checkState;
                if(res.status=='200') {
                    if (status == '100') {
                        lovexian.alert.success('保存草稿成功');
                    } else {
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    parent.layui.$("#reset").click();
                    layer.closeAll();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }

                // $('#lovexian-job').find('#query').click();
            });

            return false;

    });

    $('#cancelBtn').click(function(){
        layer.closeAll();
    })

    //对外暴露的接口
    exports('theme/life/lawerAdd3', {});
});