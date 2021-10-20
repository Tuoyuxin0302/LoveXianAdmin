/*!
 * Cropper v3.0.0
 */
function generateUUID() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
layui.define(['jquery','layer','cropper','lovexian'],function (exports) {
    var $ = layui.jquery
        ,lovexian = layui.lovexian
        ,setter = layui.setter
        ,layer = layui.layer;
    var html = "<link rel=\"stylesheet\" href=\"/LoveXianAdmin/src/style/cropper.css\">\n" +
        "<div class=\"layui-fluid showImgEdit\" style=\"display: none;\padding:15px;\">\n" +"</div>";

    var html2=
        "    <div class=\"layui-form-item\">\n" +
        "        <div class=\"layui-input-inline layui-btn-container\" style=\"width: auto;\">\n" +
        "            <label for=\"cropper_avatarImgUpload\" class=\"layui-btn layui-btn-primary\">\n" +
        "                <i class=\"layui-icon\">&#xe67c;</i>选择图片\n" +
        "            </label>\n" +
        "            <input class=\"layui-upload-file\" id=\"cropper_avatarImgUpload\" type=\"file\" value=\"选择图片\" name=\"file\">\n" +
        "        </div>\n" +
        "        <div class=\"layui-form-mid layui-word-aux\">请上传图片进行封面截取，完成后保存修改即可</div>\n" +
        "    </div>\n" +
        "    <div class=\"layui-row layui-col-space15\">\n" +
        "        <div class=\"layui-col-xs9\">\n" +
        "            <div class=\"readyimg\" style=\"height:450px;background-color: rgb(247, 247, 247);\">\n" +
        "                <img id='canvasImg' src=\"\" >\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class=\"layui-col-xs3\">\n" +
        "           <div class=\"layui-row layui-col-space15\" style=\"text-align: center;margin: auto auto;\">\n" +
        "               <div id=\"preview\" class=\"layui-col-md12 img-preview\" style=\"width:200px;height:200px;overflow:hidden\">\n" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div class=\"layui-col-space15\" style=\"text-align: center;\">\n" +
        "<div><font color='#1e90ff'>播放水印 </font><input style='display: inline-block' type=\"checkbox\" lay-skin=\"switch\" id=\"isAddPlayMask\" checked='false'></div>"+
        "                    <button type=\"button\" class=\"layui-btn layui-icon layui-icon-left\" cropper-event=\"rotate\" data-option=\"-15\" title=\"Rotate -90 degrees\" style=\"margin-top:10px;margin-bottom: 10px;width:120px;\"> 向左旋转</button>\n" +
        "<br>"+
        "                    <button type=\"button\" class=\"layui-btn layui-icon layui-icon-right\" cropper-event=\"rotate\" data-option=\"15\" title=\"Rotate 90 degrees\" style=\"margin-bottom: 10px;width:120px;\"> 向右旋转</button>\n" +
        "<br>"+
        "                    <button type=\"button\" class=\"layui-btn layui-icon layui-icon-refresh\" cropper-event=\"reset\" title=\"重置图片\" style=\"margin-bottom: 10px;width:120px;\">&nbsp;复&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;位</button>\n" +
        "<br>"+
        "<button class=\"layui-btn layui-icon layui-icon-upload\" cropper-event=\"confirmSave\" type=\"button\" style=\"width: 120px;\"> 确&nbsp;&nbsp;&nbsp;&nbsp;认</button>\n" +
        "           </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>";
    var obj = {
        render: function(e){
            if($('.showImgEdit').length==0){
                $('body').append(html);
            }
            $('.showImgEdit').html(html2);
            var self = this,
                elem = e.elem,
                saveW = e.saveW,
                saveH = e.saveH,
                mark = e.mark,
                area = e.area,
                url = e.url,
                done = e.done;
            var content = $('.showImgEdit')
                ,image = $(".showImgEdit .readyimg img")
                ,preview = '.showImgEdit .img-preview'
                ,file = $(".showImgEdit input[name='file']")
                , options = {aspectRatio: mark,preview: preview,viewMode:1};

            $(elem).on('click',function () {
                var index= layer.open({
                    type: 1
                    , content: content
                    , area: area
                    , success: function () {
                        console.log("open");
                        $('#preview').empty();
                        image.cropper('destroy').attr('src', "").cropper(options);
                        image.cropper(options);
                    }
                    , cancel: function (index) {
                        $('#preview').empty();
                        image.cropper('destroy').attr('src', "").cropper(options);
                        image.cropper('destroy');
                        layer.close(index);
                    }
                });
            });
            $(".layui-btn").on('click',function () {
                var event = $(this).attr("cropper-event");
                //监听确认保存图像
                if(event === 'confirmSave'){
                    var uploadImg = image.cropper("getCroppedCanvas",{
                        width: saveW,
                        height: saveH
                    })
                    if(uploadImg == null){
                        lovexian.alert.info("请先选择图片");
                        return;
                    }
                    uploadImg.toBlob(function(blob){
                        var formData=new FormData();
                        formData.append('file',blob,generateUUID()+'.jpg');
                        console.log($("#isAddPlayMask")[0].checked)
                        formData.append("isAddPlayMask",$("#isAddPlayMask")[0].checked);
                        formData.append('isSecond',false);
                        $.ajax({
                            method:"post",
                            headers: {
                                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
                            },
                            url: url, //用于文件上传的服务器端请求地址
                            data: formData,
                            processData: false,
                            contentType: false,
                            success:function(result){
                                if(result.status == '200'){//此处修改：确定之后弹窗自动关闭，修改默认值关闭全部界面！
                                    lovexian.alert.success("上传成功！");

                                    layer.close(layer.index-1);
                                    return done(result);
                                }else if(result.status == '400'){
                                    layer.alert(result.msg,{icon: 2});
                                }

                            }
                        });
                    });
                    //监听旋转
                }else if(event === 'rotate'){
                    var option = $(this).attr('data-option');
                    image.cropper('rotate', option);
                    //重设图片
                }else if(event === 'reset'){
                    image.cropper('reset');
                }
                //文件选择
                file.change(function () {
                    var r= new FileReader();
                    var f=this.files[0];
                    r.readAsDataURL(f);
                    r.onload=function (e) {
                        image.cropper('destroy').attr('src', this.result).cropper(options);
                    };
                });
            });
        }

    };
    exports('croppersnews', obj);
});