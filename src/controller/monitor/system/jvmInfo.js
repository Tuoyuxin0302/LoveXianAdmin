layui.define(['jquery', 'lovexian','admin','baseSetting'], function (exports) {
    var jvmInfos = ["jvm.memory.max","jvm.memory.committed","jvm.memory.used","jvm.buffer.memory.used","jvm.buffer.count","jvm.threads.daemon","jvm.threads.live","jvm.threads.peak","jvm.classes.loaded","jvm.classes.unloaded","jvm.gc.memory.allocated","jvm.gc.memory.promoted","jvm.gc.max.data.size","jvm.gc.live.data.size"];
    var $ = layui.jquery,
        admin = layui.admin,
        setter = layui.setter,
        response = setter.response,
        statusCode = response.statusCode,
        lovexian = layui.lovexian,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        util = layui.util,
        $view = $('#lovexian-jvminfo');
    $view.find('#time').text(util.toDateString(new Date().getTime(), 'yyyy年MM月dd日 HH时mm分ss秒'));

    for(var i=0;i<jvmInfos['length'];i++){
        var id = jvmInfos[i]+"";
        id = id.replace(/\./g,"");
        var targetValue = $('#'+id);
        $.ajax({
            url:proPath+"/actuator/metrics/"+jvmInfos[i],
            headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            type :'get',
            async : false,
            dataType :'json',
            success : function(res){
                if(res.code == statusCode.logout){
                    var title = [
                        '<i class="layui-icon layui-icon-exclaimination" style="font-size:12px;background:#ffc107;display:inline-block;font-weight:600;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-radius:50%;margin-right:12px;"></i>登录状态已失效，跳转登录页面中',
                        'background:#fff;border:none;font-weight:500;font-size:14px;color:#08132b;margin-bottom:-50px;padding:16px;height:60px;line-height:14px;padding-bottom:0;'
                    ]
                    layer.msg('', {
                        btn: null,
                        closeBtn: 0,
                        title:title,
                        time: 3000 //2秒关闭（如果不配置，默认是3秒）
                    }, function(){
                        admin.exit();
                    });
                }
                var value = res.measurements[0].value;
                if(id == 'jvmbuffercount' || id == 'jvmthreadsdaemon' || id == 'jvmthreadslive' || id == 'jvmclassesloaded' || id == 'jvmclassesunloaded' || id=='jvmthreadspeak'){
                    value += "个";
                    targetValue.html(value);
                }else{
                    if(id == 'jvmgcpausecount' ){
                        value += "次";
                        targetValue.html(value);
                    }else if(id == 'jvmgcpausetotalTime'){
                        value = value +"秒";
                        targetValue.html(value);
                    }else{
                        value = value / 1048576;
                        targetValue.html(value.toFixed(2)+"MB");
                    }
                }
            },
            error : function(xhr, status, error) {
                if(xhr.status == statusCode.logout){

                    var title = [
                        '<i class="layui-icon layui-icon-exclaimination" style="font-size:12px;background:#ffc107;display:inline-block;font-weight:600;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-radius:50%;margin-right:12px;"></i>登录状态已失效，跳转登录页面中',
                        'background:#fff;border:none;font-weight:500;font-size:14px;color:#08132b;margin-bottom:-50px;padding:16px;height:60px;line-height:14px;padding-bottom:0;'
                    ]
                    layer.msg('', {
                        btn: null,
                        closeBtn: 0,
                        title:title,
                        time: 2000 //2秒关闭（如果不配置，默认是3秒）
                    });
                    setTimeout(function(){
                        admin.exit();
                    },2000);
                }
            }
        })
    }
    $view.find('a#refresh').on('click', function () {
        layui.index.render();
    });

    //对外暴露的接口
    exports('monitor/system/jvmInfo', {});
});