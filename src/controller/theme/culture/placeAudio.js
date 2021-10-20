layui.define(['upload','lovexian','baseSetting','element','form'],function(exports){
    var element = layui.element,
        form = layui.form,
        lovexian = layui.lovexian,
        setter = layui.setter,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        upload = layui.upload,
        $ = layui.jquery;
    $("#progress").addClass("layui-hide");
    element.init();

    //音频上传
    upload.render({
        elem: '.uploadAudio',
        url: proPath+'/admin/placeInfo/uploadAudio',
        data:{"id":$('#placeId').val()},
        headers:{
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        accept: 'audio', //音频
        before: function(obj){
            element.progress("progressBar", "0%");
            $("#progress").removeClass("layui-hide");
            $(".uploadAudio").addClass("layui-btn-danger");
            $(".uploadAudio").addClass(" layui-btn-disabled");
            $(".uploadAudio").attr("disabled","disabled");
            $(".uploadAudio").html("上传音频中，稍等");
            element.init();
        },
        progress: function(n){
            var percent = n + '%';//获取进度百分比
            element.progress('progressBar', percent);
        },
        done: function(res, index, upload){
            //上传完毕
            let data = res.data;
            if(res.status == '200'){
                $("#audioSource").attr("src",res.url);
                $("#audio").load();
                lovexian.alert.success("音频上传成功");
                $("#audio").removeClass("layui-hide");
                $("#nodata").addClass("layui-hide");
            }else{
                lovexian.alert.error("音频上传失败了，请重新上传")
            }
            $("#progress").addClass("layui-hide");
            $(".uploadAudio").removeClass("layui-btn-danger");
            $(".uploadAudio").addClass("layui-btn-normal");
            $(".uploadAudio").removeClass("layui-btn-disabled");
            $(".uploadAudio").removeAttr("disabled");
            $(".uploadAudio").html("上传音频");
            form.render();


        }
    });


    //对外暴露的接口
    exports('theme/culture/placeAudio', {});
});