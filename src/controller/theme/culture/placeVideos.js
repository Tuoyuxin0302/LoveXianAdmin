
function retryDecode(videoId){
    layui.use(['lovexian','baseSetting'],function () {
        var lovexian = layui.lovexian,
            proPath = layui.baseSetting.LoveXianConfig.proApi,
            $ = layui.jquery;
        //视频转码的进度条
        lovexian.get(proPath+"/fileupload/placeVideoProcess",{"id":videoId},function (res) {
            if(res.status == '100'){
                lovexian.alert.success("转码消息发送成功，等待转码中");
            }else{
                lovexian.alert.success("转码消息发送失败，稍后重试");
            }
        })
    });
}


layui.define(['flow','form','layer','upload','lovexian','element','baseSetting','admin','view'],function(exports){
    var flow = layui.flow,
        admin = layui.admin,
        view = layui.view,
        element = layui.element,
        lovexian = layui.lovexian,
        setter = layui.setter,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        $ = layui.jquery;
    $("#progress").addClass("layui-hide");
    element.init();
    //流加载视频
    var videoNums = 5;  //单页显示图片数量



    flow.load({
        elem: '#Videos', //流加载容器
        done: function(page, next){ //加载下一页
            //获取某个景点的所有视频
            lovexian.get(proPath+'/admin/placeVideo/videos',{'placeId':$('#placeId').val(),'pageSize':videoNums,'pageNum':page},function (res) {
                var imgList = [],data = res.data.rows;
                setTimeout(function(){
                    for(var i=0; i<res.data.rows.length; i++){
                        var processStateHtml = "";
                        var manmadeprocess = "";
                        if(data[i].processState == '200'){
                            //转码成功
                            processStateHtml = '<img id="state'+data[i].id+'" src="../../../../LoveXianAdmin/src/images/finish.png" style="position: absolute;left: 0; top:0;width: 50px;height: 50px;">';
                        }else{
                            if(data[i].processState == '100'){
                                //转码中
                                processStateHtml = '<img id="state'+data[i].id+'" src="../../../LoveXianAdmin/src/images/ing.png" style="position: absolute;left: 0; top:0;width: 50px;height: 50px;">';
                            }else{
                                if(data[i].processState == '400'){
                                    //转码失败
                                    processStateHtml = '<img id="state'+data[i].id+'" src="../../../LoveXianAdmin/src/images/fail.png" style="position: absolute;left: 0; top:0;width: 50px;height: 50px;">';
                                    //手工激发转码
                                    manmadeprocess = '<button type="button" style="margin-top: 5px;margin-left: 10px;" onclick="retryDecode('+(data[i].id).toString()+')" class="layui-btn layui-btn-sm layui-btn-radius layui-btn-danger">转码重试</button>';
                                }
                            }
                        }
                        imgList.push('<li style="position: relative">'+processStateHtml+'<img id="'+data[i].id+'" layer-src="'+ data[i].sceneVideoImage +'" src="'+ data[i].sceneVideoImage +'" alt="'+data[i].name+'"><div class="ico_play" value="'+data[i].id+'"></div><div class="mask" value="'+data[i].id+'"></div><div class="operate"><input type="text" style="display: none;" value="'+data[i].id+'"/><button id="image'+data[i].id+'" value="'+data[i].id+'" type="button" style="margin-top: 5px;margin-left: 5px;" class="layui-btn layui-btn-sm layui-btn-radius layui-btn-normal uploadSceneImage" lay-data="{data: {\'id\':'+data[i].id+'}}">设置封面</button>'+manmadeprocess+'<i class="layui-icon img_del">&#xe640;<input type="text" style="display: none;" value="'+data[i].id+'"></i></div></li>');
                    }
                    next(imgList.join(''), page < (res.data.total/videoNums));
                    form.render();
                    //播放视频
                    $('.mask,.ico_play').click(function () {
                        let id;
                        if($(this).hasClass('mask')){
                            id = $(this).next().find("input:first").val();
                        }
                        if($(this).hasClass('ico_play')){
                            id = $(this).next().next().find("input:first").val()
                        }
                        //在某个景点里根据id播放视频
                        lovexian.get(proPath+"/admin/placeVideo/getById",{"id":id},function (res) {
                            if(res.status == '400'){
                                lovexian.alert.error(res.message);
                                return;
                            }
                            let data = res.data;
                            let processState = data.processState;
                            if(processState ==  '100'){
                                lovexian.alert.info("视频正在转码中，请稍后播放");
                                return;
                            }
                            if(processState ==  '400'){
                                lovexian.alert.info("视频转码失败，请转码后播放");
                                return;
                            }
                            //取得m3u8的路径
                            let m3u8Path = data.path;
                            var width = $(window).width() - $("#my-side").width()+'px';
                            var height = $(window).height() - $("#my-header").height()+'px';
                            admin.popup({
                                id: 'LAY-theme-culture-play-sceneVideos',
                                area:[width,height],
                                shadeClose:false,
                                shade:0,
                                move: false,
                                title: '播放视频',
                                success: function(){
                                    view(this.id).render('theme/culture/playVideo', {
                                        m3u8Path: m3u8Path,
                                        poster:data.sceneVideoImage
                                    }).then(function(){
                                        //视图文件请求完毕，视图内容渲染前的回调
                                        console.log("视图文件请求完毕，视图内容渲染前的回调");
                                    }).done(function(){
                                        //视图文件请求完毕和内容渲染完毕的回调
                                        console.log("视图文件请求完毕和内容渲染完毕的回调");
                                        var player = videojs('example-video',{
                                            muted: false,
                                            controls : true,
                                            width:$(window).width() - $("#my-side").width()-40,
                                            height:$(window).height() - $("#my-header").height()-100,
                                            loop : true,
                                        });
                                        player.play();
                                    });
                                }
                            });
                        });
                    });
                    //在这upload.render();
                    layui.use(['form', 'upload'], function() {
                        var upload = layui.upload;
                        //视频封面上传
                        upload.render({
                            elem: '.uploadSceneImage',
                            url: proPath+'/fileupload/placeUploadSceneImage',
                            headers:{
                                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
                            },
                            done: function(res, index, upload){
                                //获取当前触发上传的元素，一般用于 elem 绑定 class 的情况，注意：此乃 layui 2.1.0 新增
                                var item = this.item;
                                if(res.status == '200'){
                                    $('#'+item.val()).attr('src',res.url);
                                    $('#'+item.val()).attr('layer-src',res.url);
                                    $('#'+item.val()).attr('alt',res.url);
                                    lovexian.alert.success("设置封面成功");
                                }else{
                                    lovexian.alert.error("设置封面失败");
                                }
                                form.render();
                            }
                        });
                    })
                }, 500);
            });
        }
    });


    //点击视频上传事件
    upload.render({
        elem: '.uploadNewVideo',
        url: proPath+'/fileupload/placeVideo',
        data:{"cid":layui.data(setter.cid)[setter.cid],"placeId":$('#placeId').val()},
        headers:{
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        exts: 'mp4',
        accept:'video',
        before: function(obj){
            element.progress("progressBar", "0%");
            $("#progress").removeClass("layui-hide");
            $(".uploadNewVideo").addClass("layui-btn-danger");
            $(".uploadNewVideo").addClass(" layui-btn-disabled");
            $(".uploadNewVideo").attr("disabled","disabled");
            $(".uploadNewVideo").html("上传文件中，稍等");
            element.init();
        },
        progress: function(n){
            var percent = n/10 + '%';//获取进度百分比
            element.progress('progressBar', percent);
        },
        done: function(res, index, upload){
            //上传完毕
            let data = res.data;
            if(res.status == '200'){
                $('#Videos').prepend('<li style="position: relative"><img id="state'+data.id+'" src="../../../LoveXianAdmin/src/images/ing.png" style="position: absolute;left: 0; top:0;width: 50px;height: 50px;"><img id="'+data.id+'" layer-src="'+ data.sceneVideoImage +'" src="'+ data.sceneVideoImage +'" alt="'+data.sceneVideoImage+'"><div class="ico_play" value="'+data.id+'"></div><div class="mask" value="'+data.id+'"></div><div class="operate"><input type="text" style="display: none;" value="'+data.id+'"/><button id="image'+data.id+'" value="'+data.id+'" type="button" style="margin-top: 5px;margin-left: 5px;" class="layui-btn layui-btn-sm layui-btn-radius layui-btn-normal uploadSceneImage" lay-data="{data: {\'id\':'+data.id+'}}">设置封面</button><i class="layui-icon img_del">&#xe640;<input type="text" style="display: none;" value="'+data.id+'"/></div></li>');
            }else{
                lovexian.alert.error("视频上传失败了，请重新上传")
            }
            $("#progress").addClass("layui-hide");
            $(".uploadNewVideo").removeClass("layui-btn-danger");
            $(".uploadNewVideo").addClass("layui-btn-normal");
            $(".uploadNewVideo").removeClass("layui-btn-disabled");
            $(".uploadNewVideo").removeAttr("disabled");
            $(".uploadNewVideo").html("上传新文件");
            form.render();
            //播放视频
            $('.mask,.ico_play').click(function () {
                let id;
                if($(this).hasClass('mask')){
                    id = $(this).next().find("input:first").val();
                }
                if($(this).hasClass('ico_play')){
                    id = $(this).next().next().find("input:first").val()
                }
                lovexian.get(proPath+"/admin/placeVideo/getById",{"id":id},function (res) {
                    if(res.status == '4000'){
                        lovexian.alert.error(res.message);
                        return;
                    }
                    let data = res.data;
                    let processState = data.processState;
                    if(processState ==  '100'){
                        lovexian.alert.info("视频正在转码中，请稍后播放");
                        return;
                    }
                    if(processState ==  '400'){
                        lovexian.alert.info("视频转码失败，请转码后播放");
                        return;
                    }
                    //取得m3u8的路径
                    let m3u8Path = data.path;
                    var width = $(window).width() - $("#my-side").width()+'px';
                    var height = $(window).height() - $("#my-header").height()+'px';
                    admin.popup({
                        id: 'LAY-theme-culture-play-sceneVideos',
                        area:[width,height],
                        shadeClose:false,
                        shade:0,
                        move: false,
                        title: '播放视频',
                        success: function(){
                            view(this.id).render('theme/culture/playVideo', {
                                m3u8Path: m3u8Path,
                                poster:data.sceneVideoImage
                            }).then(function(){
                                //视图文件请求完毕，视图内容渲染前的回调
                                console.log("视图文件请求完毕，视图内容渲染前的回调");

                            }).done(function(){
                                //视图文件请求完毕和内容渲染完毕的回调
                                console.log("视图文件请求完毕和内容渲染完毕的回调");
                                var player = videojs('example-video',{
                                    muted: false,
                                    controls : true,
                                    width:$(window).width() - $("#my-side").width()-40,
                                    height:$(window).height() - $("#my-header").height()-100,
                                    loop : true,
                                });
                                player.play();
                            });
                        }
                    });
                });
            });
            //在这upload.render();
            layui.use(['form', 'upload'], function() {
                var upload = layui.upload;
                //封面上传
                upload.render({
                    elem: '.uploadSceneImage',
                    url: proPath+'/fileupload/placeUploadSceneImage',
                    headers:{
                        Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
                    },
                    done: function(res, index, upload){
                        //获取当前触发上传的元素，一般用于 elem 绑定 class 的情况，注意：此乃 layui 2.1.0 新增
                        var item = this.item;
                        if(res.status == '200'){
                            $('#'+item.val()).attr('src',res.url);
                            $('#'+item.val()).attr('layer-src',res.url);
                            $('#'+item.val()).attr('alt',res.url);
                            lovexian.alert.success("设置封面成功");
                        }else{
                            lovexian.alert.error("设置封面失败");
                        }
                        form.render();
                    }
                });
            })
        }
    });

    //删除视频
    $("body").on("click",".img_del",function(){
        var _this = $(this);
        var id = $(this).children(":first").val();
        lovexian.modal.confirm('删除视频','确定删除视频吗？',function(){
            lovexian.del(proPath+'/admin/placeVideo/deleteVideo',{"id":id},function (res) {
                if(res.status == '200'){
                    lovexian.alert.success(res.message);
                    _this.parents("li").hide(1000);
                    setTimeout(function(){_this.parents("li").remove();},950);
                }else{
                    lovexian.alert.error(res.message);
                }
            });
        });
    });

    //对外暴露的接口
    exports('theme/culture/placeVideos', {});

})