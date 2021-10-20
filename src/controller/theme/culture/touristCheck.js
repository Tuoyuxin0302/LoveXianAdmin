/*
var actContent;
layui.extend({
    tinymce: '../../../src/lib/extend/tinymce/tinymce'
}).use(['tinymce', 'util', 'layer','lovexian','baseSetting'], function () {
    var tinymce = layui.tinymce;
    var setter = layui.setter;
    var proPath = layui.baseSetting.LoveXianConfig.proApi;
    var lovexian = layui.lovexian;
    var util = layui.util;
    var index = 0;
    actContent = tinymce.render({
        elem: "#content"
        , height: 580
        , width:'100%'
        , plugins: true
        , toolbar: true
        , menubar: 'my1'
        , readonly : 1
        , menu: {
            my1: {title: '无意义', items: 'nothing' }
        },
    });
});
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
    admin.sideFlexible(null);
    // alert(layui.data('id').actionTypeId);
    var actionTypeId=layui.data('id').activityTypeId;//设置爱生活不同选项卡ID
    //var editId=layui.data('editScene').editId;
    var sceneData = layui.data("parentScene")["data"];
    var checkId=sceneData.checkId;
   // var id=sceneData.id;
    var name = $('.name');
    var longitude = $('.longitude');
    var latitude = $('.latitude');
    var locationName = $('.locationName');//name用#,class 别名用.
    var hotTime=$('.hotTime');
    var coldTime=$('.coldTime');
    var tickets=$('.tickets');
    var introduction=$('.introduction');
    var traffic=$('.traffic');
    var others=$('.others');
    var $headImage=$('.thumbnails');
        name.val(sceneData.name);
        longitude.val(sceneData.locationLongitude);
        latitude.val(sceneData.locationLatitude);
        locationName.val(sceneData.locationName);
        hotTime.val(sceneData.hotTime);
        coldTime.val(sceneData.coldTime);
        tickets.val(sceneData.tickets);
        introduction.val(sceneData.introduction);
        traffic.val(sceneData.traffic);
        others.val(sceneData.others);
        $headImage.attr('src',sceneData.thumbnails);
    sceneData.isTop==1? $("input[type='checkbox'][name='isTopCheck']").attr("checked",true):
        $("input[type='checkbox'][name='isTopCheck']").attr("checked",false);
    sceneData.isShow==0 ? $("input[type='radio'][name='opennessCheck'][value='0']").attr("checked",true):
        $("input[type='radio'][name='opennessCheck'][value='1']").attr("checked",true);
    form.render();
    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath+'/fileupload/images',
        method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function(res, index, upload){
            $('.thumbnails').attr('src',res.data.imgUrl);
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
    form.on("radio(checkState)",function(data){
        if(data.elem.title == "审核拒绝"){
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #checkState").attr("lay-verify","required");
        }else{
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #checkState").removeAttr("lay-verify");
        }
    });
    form.on("submit(checkAct)",function(data){
        var data = {
            refuseReason : $("#refuseReason").val(),  //拒绝理由
            checkState : data.field.checkState,    //审核状态
            sceneId: sceneData.sceneId,
            checkId: sceneData.checkId
        };
        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/sceneCheck/check',data,function (res) {

            if(res.status == '200'){
                lovexian.modal.confirm('审核', '审核完成，您可以通过手机扫码查看', function () {
                    layer.open({
                        type: 1,
                        title :"手机扫码查看",
                        skin: 'layui-layer-rim', //加上边框
                        area: ['190px', '230px'], //宽高
                        content: '<div id="qrcode-img"></div>',
                        success : function(layero,index) {
                            $('#qrcode-img').empty();
                            new QRCode(document.getElementById("qrcode-img"), {
                                text: encodeURI(res.static_page),
                                width: 180,
                                height: 180,
                                colorDark : "#000000",
                                colorLight : "#ffffff",
                                correctLevel : QRCode.CorrectLevel.L
                            });
                            $('#qrcode-img').fadeIn(500);
                        },
                        end:function() {
                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        }
                    });
                },function () {
                    var index = parent.layer.getFrameIndex(window.name);
                    parent.layer.close(index);
                });
            }else{
                lovexian.alert.success('审核完成');
                var index = parent.layer.getFrameIndex(window.name);
                parent.layer.close(index);
            }
            return false;
            // $('#lovexian-job').find('#query').click();
        });
    })
    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
        return false;
    })
    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });
    //处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外
    function banBackSpace(e){
        var ev = e || window.event;//获取event对象
        var obj = ev.target || ev.srcElement;//获取事件源

        var t = obj.type || obj.getAttribute('type');//获取事件源类型

        //获取作为判断条件的事件类型
        var vReadOnly = obj.getAttribute('readonly');
        var vEnabled = obj.getAttribute('enabled');
        //处理null值情况
        vReadOnly = (vReadOnly == null) ? false : vReadOnly;
        vEnabled = (vEnabled == null) ? true : vEnabled;

        //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
        //并且readonly属性为true或enabled属性为false的，则退格键失效
        var flag1=(ev.keyCode == 8 && (t=="password" || t=="text" || t=="textarea")
            && (vReadOnly==true || vEnabled!=true))?true:false;

        //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
        var flag2=(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea")
            ?true:false;

        //判断
        if(flag2){
            return false;
        }
        if(flag1){
            return false;
        }
    }


    //禁止后退键 作用于Firefox、Opera
    document.onkeypress=banBackSpace;
    //禁止后退键 作用于IE、Chrome
    document.onkeydown=banBackSpace;
    //对外暴露的接口
    exports('theme/culture/touristCheck', {});
})*/
