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
        $ = layui.jquery,
    // 非空校验
    validate = layui.validate;
    form.verify(validate);

    var editId=layui.data('FolkData').editId;
    var folkInfoTitle = $('.folkloreTitle');
    var $subTitle = $('.folkloreSubtitle');
    var $actAbstract = $('.folkloreAbstract');
    var $actContent = $('#folkloreContent');
    var $headImage=$('.thumbImg');
  /*  if(editId==='1'){
        var articleData = layui.data("FolkData")["data"];
        var id=articleData.id;
        folkInfoTitle.val(articleData.folkloreTitle);
        $subTitle.val(articleData.folkloreSubtitle);
        $actAbstract.val(articleData.folkloreAbstract);
        folkContent.setContent(articleData.folkloreContent);
       // $actContent.val(articleData.folkloreContent);
        $headImage.attr('src',articleData.headImage);
    }else{
        folkInfoTitle.val("");
        $subTitle.val("");
        $actAbstract.val("");
        $headImage.attr('src',"");
    }*/

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
        folkInfoTitle : function(val){
            if(val == ''){
                return "文章标题不能为空";
            }
        },
        content : function(val){
            var actInfo = removeTAG(folkloreContent.getContent());
            console.log("这是内容"+actInfo);
            if(actInfo == ''){
                return "文章内容不能为空";
            }
        }
    });

    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)",function(data){

        let sum = lovexian.validateLength("input[id='folkloreTitles']",50,"标题长度不能大于50");

        if(sum > 0) {
            return;
        }

        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",{time:2000,icon:5,shift:6},function (index) {
                layer.close(index);
            });
            return;
        }

        var abstract= $(".folkloreAbstract").val().trim();
        var actInfo = folkloreContent.getContentTxt();
        if(actInfo.trim() == ""){
            lovexian.alert.error("文章内容不能为空");
            return false;
        }
        if(abstract == ""){
            //如果没写摘要截取文章内容中的一部分文字放入文章摘要
            if(actInfo.length >= 50){
                abstract = actInfo.substring(0,50);
            }else{
                abstract = actInfo.substring(0,actInfo.length);
            }
        }
        if(isEdit){
            var folkInfo=form.val("folkloreInfo");
            folkInfo.isTop= folkInfo.isTop=="on" ? 1:0;
            delete folkInfo.file;
            delete folkInfo.id;
            console.log(folkInfo);
            console.log(folkData);
            if (lovexian.nativeEqual(folkData, folkInfo)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }
        var data = {
            id:$("input[name='id']").val(),
            folkloreTitle : $(".folkloreTitle").val(),  //文章标题
            folkloreSubtitle : $(".folkloreSubtitle").val(),  //文章子标题
            folkloreContent : folkloreContent.getContent(),  //文章内容
            folkloreAbstract: abstract,
            delState: 0,
            readCount: 100,
            learnOrderNum: 1,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            checkState : $('.folkInfoStatus select').val(),    //发布状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            isShow: $('#isShowId input[name="isShow"]:checked ').val(),   //是否置顶
            languageType: $('.languageStatus select').val(),
        };
        lovexian.modal.confirm("添加民俗信息","确定提交民俗信息吗？",function () {
            lovexian.post(proPath + 'admin/folkloreInfo/saveOrUpdate',data,function (res) {
                var status = $('.newsStatus select').val();
                if(res.status == '200'){
                layer.closeAll();
                $query.click();
                if( status == '100'){
                    lovexian.alert.success('保存草稿成功');
                }else{
                    lovexian.alert.success('发布成功，等待审核');
                }

            }else{
                lovexian.alert.error('保存失败:'+res.message);
            }
            return false;
        });
        })

    });



    /*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();
        $query.click();
    })


    //对外暴露的接口
    exports('theme/culture/folk/folkInfoAdd', {});
})