var actContent;
function gaodeMap(){
    layui.use('lovexian',function () {
        var lovexian = layui.lovexian;

        lovexian.popup("/common/gaodeMap","高德地图",{},function(){},function(){});
    });
    return;
}

layui.define(['form','layer','admin','layedit','lovexian','laydate','upload','baseSetting','validate'],function(exports){
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
    validate = layui.validate;
    //表单校验
    form.verify(validate);
    form.render();
    //上传缩略图
    layui.use(['croppers'], function(){
        var $ = layui.jquery,
            croppers = layui.croppers;
        //创建一个图片裁剪上传组件
        var productImgCropper = croppers.render({
            elem: '#fengmian'
            ,saveW:800     //保存宽度
            ,saveH:600     //保存高度
            ,mark:4/3   //选取比例
            ,area:'900px'//弹窗宽度
            ,method : "post"
            ,url: proPath+'/fileupload/smallfile'  //图片上传接口返回和（layui 的upload 模块）返回的JOSN一样
            ,headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            }
            ,done: function(res){ //上传完毕回调
                //   $(".thumbImg").val(res.data.url);
                $('.thumbBox').css("background","#fff")
                $('.thumbnails').attr('src',res.data.url);
            }
        });
    });

    form.on("submit(addNews)",function(data){
        var star = starNum | starEle.config.value;
        /*if( $('#longitude').val()==''|| $('.latitude').val()==''){
            alert("请点击高德查询按钮");
            return;
        }*/
        /*if($('.thumbnails').attr('src')==null)
        {
            layer.alert("图片不能为空",{time:2000,icon:5,shift:6},function(index){
                layer.close(index);
            });return;
        }*/
        if($('.thumbnails').attr('src')==="undefined"){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
                layer.close(index);
            });
            return ;
        }
        if(  star==0 ||star==null|| $('.actionStatus select').val()==100)
        {
            alert("这么好看的景点，不评个分再走吗，语言还没有选择哦！");
        }
        else{
            var $headImage=$('.thumbnails').attr('src');
            var data = {
                id: data.field.id,
                name:data.field.name,
                longitude:data.field.longitude,
                latitude:data.field.latitude,
                locationName:data.field.locationName,
                hotTime:data.field.hotTime,
                coldTime:data.field.coldTime,
                tickets:data.field.tickets,
                introduction:data.field.introduction,
                traffic:data.field.traffic,
                webSite:data.field.webSite,
                star:star,
                others:data.field.others,
                checkState:0,
                keywords:data.field.keywords,
                thumbnails : $headImage,  //缩略图ddata
                languageType : $('#languageTypeId').val(),    //发布状态
                isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
                isShow:  data.field.opennessCheck,
            };
            lovexian.post(proPath + 'admin/scene/saveOrUpdate',data,function () {//存入数据的路径
                // var status = $('.newsStatus select').val();
                if( data.checkState == '0'){
                    lovexian.alert.success('发布成功，等待审核');
                    layer.closeAll();
                    $reset.click();
                }else{
                    lovexian.alert.success('发布失败，请重试');
                };

                return false;
            });
        }
    });
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })

    //对外暴露的接口
    exports('theme/culture/touristAdd', {});
})