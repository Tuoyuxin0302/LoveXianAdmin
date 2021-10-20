var placeContent;
var delState;
//拓展一个模块别名
layui.extend({
    tinymce: '../../../src/lib/extend/tinymce/tinymce'
}).use(['tinymce', 'util', 'layer','lovexian','baseSetting'], function () {
    var tinymce = layui.tinymce;//编辑器
    var setter = layui.setter;
    var proPath = layui.baseSetting.LoveXianConfig.proApi;
    var lovexian = layui.lovexian;
    var util = layui.util;
    var index = 0;
    placeContent = tinymce.render({
        elem: "#content"
        , height: 580
        , width:'100%'
        , plugins: ['advlist', 'anchor', 'autolink', 'autosave', 'charmap', 'directionality', 'emoticons', 'fullpage', 'fullscreen', 'help', 'hr', 'image', 'imagetools', 'importcss', 'indent2em', 'insertdatetime', 'legacyoutput', 'link', 'lists', 'media', 'nonbreaking', 'noneditable', 'pagebreak', 'paste', 'preview', 'print', 'quickbars', 'save', 'searchreplace', 'spellchecker', 'tabfocus', 'table', 'template', 'textpattern', 'toc', 'visualblocks', 'visualchars', 'wordcount']
        , images_upload_url: 'http://127.0.0.1:9090/fileupload/images'
        , setup: function(editor) {
            index = layer.load(0, {shade: false}); //0代表加载的风格，支持0-2
        }
        ,init_instance_callback : function(editor) {
            layer.close(index);
            lovexian.alert.success("编辑器初始化成功");
        }
    });
});

//定义一个Layui模块
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
    //var placeTypeId=layui.data('id').placeTypeId;//设置不同选项卡ID
    var editId = layui.data("editArticle")["editId"];
    var $placeName = $('.placeName');
    var $placeAddress = $('.placeAddress');
    var $placeLongitude = $('.placeLongitude');//经度
    var $placeLatitude = $('.placeLatitude');//纬度
    var $openTime = $('.openTime');
    var $chineseIntroduce = $('.chineseIntroduce');
    var $englishIntroduce = $('.englishIntroduce');
    var $placeContent = $('#content');//详细内容
    var $headImage = $('.thumbImg');
    var $placeType = $('.placeType');
    var $languageType = $('.languageType');
    if(editId===1){//点编辑进来的
        // var placeData = layui.data("placeData")["data"];
        // $placeName.val(placeData.placeName);
        // $placeAddress.val(placeData.placeAddress);
        // $placeLongitude.val(placeData.placeLongitude);
        // $placeLatitude.val(placeData.placeLatitude);
        // $openTime.val(placeData.openTime);
        // $chineseIntroduce.val(placeData.chineseIntroduce);
        // $englishIntroduce.val(placeData.englishIntroduce);
        // $placeContent.val(placeData.placeContent);
        // $headImage.attr('src',placeData.headImage);
         $placeType.val();
         $languageType.val();
        // delState = placeData.delState;
    }else{//点添加进来的
        form.val("placeForm",{
            "placeType":""
        });
        $placeName.val("");
        $placeAddress.val("");
        $placeLongitude.val("");
        $placeLatitude.val("");
        $openTime.val("");
        $chineseIntroduce.val("");
        $englishIntroduce.val("");
        $placeContent.val("");
        $headImage.attr('src',"");
        $placeType.val("");
        $languageType.val("");
        delState = 0;
    }

    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath+'/fileupload/images',
        //method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function(res, index, upload){
            $('.thumbImg').attr('src',res.data.imgUrl);
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

    //表单校验
    form.verify({
        newsName : function(val){
            if(val == ''){
                return "文章标题不能为空";
            }
        },
        placeContent : function(val){
            if(val == ''){
                return "文章内容不能为空";
            }
        }
    });

    function removeTAG(str){
        return str.replace(/<[^>]+>/g, "").trim();
    }

    form.on("submit(addNews)",function(data){
        var chineseIntroduce= $(".chineseIntroduce").val().trim();
        var englishIntroduce= $(".englishIntroduce").val().trim();
        var placeInfo = removeTAG(placeContent.getContent());
        //弹出loading
        // var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        //实际使用时的提交信息
        var data = {
            //id : id,
            placeName : $(".placeName").val(),
            placeAddress : $(".placeAddress").val(),
            placeLongitude : $('.placeLongitude').val(),
            placeLatitude : $('.placeLatitude').val(),
            openTime : $('.openTime').val(),
            chineseIntroduce : $('.chineseIntroduce').val(),
            englishIntroduce : $('.englishIntroduce').val(),
            placeContent : placeInfo,
            webSite:$('.website').val(),
            headImage : $(".thumbImg").attr("src"),  //缩略图
            placeType : $('.placeType').val(),    //分类
            languageType : $('.languageType').val(),
            delState : delState,
            isShow : data.field.isShow == "on" ? "1" : "0",    //展示状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
        };
        lovexian.post(proPath + 'admin/placeInfo/saveOrUpdate',data,function () {
            lovexian.alert.success('发布成功，等待审核');
            var index = parent.layer.getFrameIndex(window.name);
            parent.layer.close(index);
            return false;
            // $('#lovexian-job').find('#query').click();
        });
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
    exports('theme/culture/placeAdd', {});
});