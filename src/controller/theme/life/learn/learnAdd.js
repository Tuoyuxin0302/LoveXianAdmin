layui.define(['form','layer','admin','layedit','validate','lovexian','laydate','upload','baseSetting'],function(exports){
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
    // 非空校验
    validate = layui.validate;
    form.verify(validate);

    // alert(layui.data('id').learnTypeId);




    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }


  /*  //表单校验
    form.verify({
        learnTitle : function(val){
            if(val == ''){
                return "文章标题不能为空";
            }
        },
        subTitle : function(val){
            if(val == ''){
                return "文章内容不能为空";
            }
        },
    });*/

    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)",function(data){
        let sum = lovexian.validateLength("input[id='learnTitles']",250,"标题长度不能大于250");

        if(sum > 0) {
            return;
        }
        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",{time:2000,icon:5,shift:6},function (index) {
                layer.close(index);
            });
            return;
        }
        var abstract= $(".learnAbstract").val().trim();
        var actInfo = removeTAG(studyContent.getContentTxt());
        if(actInfo.trim()==""){
            lovexian.alert.error("内容不能为空");
            return false;
        }
      //  console.log("这是内容"+actInfo);
        if(abstract == ""){
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            if(actInfo.length>=50){
                abstract = actInfo.substring(0,50);
            }else{
                abstract = actInfo.substring(0,actInfo.length);
            }

        }
        if(isEdit){
            var learnInfo=form.val("learnInfo");
            console.log(learnInfo);
            console.log(studyInfo);
            delete learnInfo.file;
            learnInfo.isTop=learnInfo.isTop=="on"?1:0;

            if (lovexian.nativeEqual(studyInfo, learnInfo)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
        var data = {
            id:$("input[name='id']").val(),
            learnTitle : $(".learnTitle").val(),  //文章标题
            learnSubtitle : $(".learnSubtitle").val(),  //文章子标题
            learnContent : studyContent.getContent(),  //文章内容
            learnAbstract: abstract,
            delState: 0,
            readCount: 100,
            learnOrderNum: 1,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            learnTypeId : parent.layui.$(".layui-tab-title .layui-this").attr("lay-id"),    //活动信息分类
            checkState : $('.learnStatus select').val(),    //发布状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            isShow :$('#isShowId input[name="isShow"]:checked ').val(),   //是否置顶
            languageType: $('.languageStatus select').val(),
        };
        //console.log(JSON.stringify(data));


        lovexian.modal.confirm("添加学习信息","确定提交学习信息吗？",function () {
            lovexian.post(proPath + 'admin/learnInfo/saveOrUpdate', data, function (res) {
                var status = $('.newsStatus select').val();
                if (res.status == '200') {
                    layer.closeAll();
                    $query.click();
                    if (status == '100') {
                        lovexian.alert.success('保存草稿成功');
                    } else {
                        lovexian.alert.success('发布成功，等待审核');
                    }

                } else {
                    lovexian.alert.error('保存失败:' + res.message);
                }
                return false;
            });
        })

    });

    //预览
    form.on("submit(cancel)",function(){
        layer.alert("取消编辑");
        return false;
    })

    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });

    /*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();
       // $query.click();
    })

    //对外暴露的接口
    exports('theme/life/learn/learnAdd', {});
})