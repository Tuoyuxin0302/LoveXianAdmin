layui.define(['flow','form','layer','upload','lovexian','element'],function(exports){
    var flow = layui.flow,
        element = layui.element,
        lovexian = layui.lovexian,
        setter = layui.setter,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        $ = layui.jquery;

    //流加载图片
    var imgNums = 5;  //单页显示图片数量
    flow.load({
        elem: '#Images', //流加载容器
        done: function(page, next){ //加载下一页
            lovexian.get(proPath+'/admin/placeImage/images',{'placeId':$('#placeId').val(),'pageSize':imgNums,'pageNum':page},function (res) {
                var imgList = [],data = res.data.rows;
                setTimeout(function(){
                    for(var i=0; i<res.data.rows.length; i++){
                        imgList.push('<li><img layer-src="'+ data[i].imageUrl +'" src="'+ data[i].imageUrl +'" alt="'+data[i].imageName+'"><div class="operate" ><div class="check"><input type="text" style="display: none;" value="'+data[i].id+'"/><input type="checkbox" name="belle" lay-filter="choose" lay-skin="primary" title="'+data[i].imageName+'"></div><i class="layui-icon img_del">&#xe640;<input type="text" style="display: none;" value="'+data[i].id+'"></i></div></li>');
                    }
                    next(imgList.join(''), page < (res.data.total/imgNums));
                    form.render();
                }, 500);
            });
        }
    });

    //图片上传
    upload.render({
        elem: '.uploadNewImg',
        url: proPath+'/admin/placeImage/uploadImages',
        multiple: true,
        data:{"placeId":$('#placeId').val()},
        headers:{
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        allDone: function(obj){ //当文件全部被提交后，才触发
            // console.log(obj.total); //得到总文件数
            // console.log(obj.successful); //请求成功的文件数
            // console.log(obj.aborted); //请求失败的文件数
        },
        done: function(res, index, upload){
            //上传完毕
            let data = res.data;
            $('#Images').prepend('<li><img layer-src="'+ data.url +'" src="'+ data.url +'" alt="'+data.url+'"><div class="operate"><div class="check"><input type="text" style="display: none;" value="'+res.id+'"/><input type="checkbox" name="belle" lay-filter="choose" lay-skin="primary" title="'+res.imageName+'"/></div><i class="layui-icon img_del">&#xe640;<input type="text" style="display: none;" value="'+res.id+'"/></div></li>');
            form.render();
        }
    });

    //删除单张图片
    $("body").on("click",".img_del",function(){
        var _this = $(this);
        var id = $(this).children(":first").val();
        lovexian.modal.confirm('删除图片','确定删除图片吗？',function(){
            lovexian.del(proPath+'/admin/placeImage/deleteImage',{"id":id},function (res) {
                if(res.status == '200'){
                    _this.parents("li").hide(1000);
                    setTimeout(function(){_this.parents("li").remove();},950);
                }else{
                    lovexian.alert.error("删除图片失败！");
                }
            });
        });
    })

    //全选
    form.on('checkbox(selectAll)', function(data){
        var child = $("#Images li input[type='checkbox']");
        child.each(function(index, item){
            item.checked = data.elem.checked;
        });
        form.render('checkbox');
    });

    //通过判断是否全部选中来确定全选按钮是否选中
    form.on("checkbox(choose)",function(data){
        var child = $(data.elem).parents('#Images').find('li input[type="checkbox"]');
        var childChecked = $(data.elem).parents('#Images').find('li input[type="checkbox"]:checked');
        if(childChecked.length == child.length){
            $(data.elem).parents('#Images').siblings("blockquote").find('input#selectAll').get(0).checked = true;
        }else{
            $(data.elem).parents('#Images').siblings("blockquote").find('input#selectAll').get(0).checked = false;
        }
        form.render('checkbox');
    })

    //批量删除
    $(".batchDel").click(function(){
        var $checkbox = $('#Images li input[type="checkbox"]');
        var $checked = $('#Images li input[type="checkbox"]:checked');
        if($checkbox.is(":checked")){
            lovexian.modal.confirm('批量删除图片','确定删除选中的图片？',function(){
                lovexian.alert.info('删除中，请稍候');
                //删除数据
                var ids = [];
                $checked.each(function(){
                    ids.push($(this).prev().val());
                });
                lovexian.del(proPath+"/admin/placeImage/deleteImages",{"ids":ids.join(",")},function(res){
                    console.log(res);

                    if(res.status == '200') {
                        $checked.each(function(){
                            $(this).parents("li").hide(1000);
                            setTimeout(function(){$(this).parents("li").remove();},950);
                        });
                        $('#Images li input[type="checkbox"],#selectAll').prop("checked",false);
                        form.render();
                        lovexian.alert.success("删除成功！");
                    } else {
                        lovexian.alert.error("删除失败！");
                    }
                });
            })
        }else{
            lovexian.alert.info("请选择需要删除的图片");
        }
    });


    //对外暴露的接口
    exports('theme/culture/placeImages', {});

})