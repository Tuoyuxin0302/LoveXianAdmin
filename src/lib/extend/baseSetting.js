
layui.define(function(exports){
    //后端
    var backEnd = {
        "project_host":'http://117.35.182.173:7372/',
        "project_name":''
    };

    //视频处理端
    var videoEnd = {
        "project_host":'http://117.35.182.173:7378/',
        "project_name":''
    };
    var getApi = function (){
        return backEnd.project_host+backEnd.project_name;
    };
    //前端
    var frontEnd = {
        "project_host":'http://39.105.141.222:80/',
        "project_name":'electronicboardlayui'
    };
    var getPath = function (){
        return frontEnd.project_host+frontEnd.project_name;
    };
    //FTP
    var getFtp = function(){
        return "http://39.105.141.222/";
    };

    LoveXianConfig = {
        proApi: backEnd.project_host+backEnd.project_name,
        videoPath: videoEnd.project_host+videoEnd.project_name,
        imgUrl: "http://39.105.141.222/",
    }

    exports('baseSetting', {LoveXianConfig});
});
