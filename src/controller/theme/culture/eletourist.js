function gaodeMap(){
    layui.use('lovexian',function () {
        var lovexian = layui.lovexian;

        lovexian.popup("/common/gaodeMap2","高德地图",{},function(){},function(){});
    });
    return;
}

layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl','upload'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        adminView = layui.view,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-culture'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        dropdown = layui.dropdown,
        form = layui.form,
        table = layui.table,
        router = layui.router(),
        search = router.search,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        element = layui.element,
        pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        upload = layui.upload,
        validate = layui.validate;
        //表单校验
        form.verify(validate);
        form.render();
        pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query=$searchForm.find("div[name='query']");
    $reset=$searchForm.find("div[name='reset']");

    form.render();
    var placeTypeId;
    element.on('tab(placeTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('id',{key:'placeTypeId',value:idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        placeTypeId=layui.data('id').placeTypeId;
        //alert(placeTypeId);
        if(placeTypeId==1 || placeTypeId==2 || placeTypeId==4 || placeTypeId == 7){
            initTable2();
        }else {
            initTable();
        }
    });


    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.tabChange('placeTab',1);

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('actionInfoTable'+layui.data('id').placeTypeId);
            if (name === 'add') {
                addPlaceInfo("",0);
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的信息');
                } else {
                    lovexian.modal.confirm('删除信息', '确定删除这些信息？', function () {
                        var actionIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            actionIds.push(item.id)
                        });
                        deleteActions(actionIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加',
            perms: 'placeInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'placeInfo:delete'
        }]
    });

    var delState;
    var checkState;
    var dataId;
    function addPlaceInfo(data,isEdit){
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        var edit = isEdit;
        var show = data.isShow;
        var top = data.isTop;
        if(isEdit == 1){//是编辑
            console.log(data);
            form.val("placeForm",{
                "placeName":data.placeName,
                "website":data.webSite,
                "placeAddress":data.placeAddress,
                "placeLongitude":data.placeLongitude,
                "placeLatitude":data.placeLatitude,
                "openTime":data.openTime,
                "englishIntroduce":data.englishIntroduce,
                "static":data.staticPage,
            });
            $("#content").val(data.placeContent);
            $(".thumbnails").attr('src',data.headImage);
            $('.placeType').val(data.placeType);
            //$('.languageType').val(data.languageType);
            show == 1 ? $('.isShow').attr('checked',true):$('.isShow').attr('checked',false);
            top == 1 ? $('.isTop').attr('checked',true):$('.isTop').attr('checked',false);
            delState = data.delState;
            checkState = 0;
            dataId = data.id;
            form.render();
            var index = layui.layer.open({
                title : "编辑",
                type : 1,
                skin:"layui-layer-admin-page",
                offset: 'rb',
                area :[width,height],
                content : $('#placeForm'),
                shade : false,
                resize:false,
                anim: 2,
                move:false,
                success : function(layero, index){
                    layui.data('editArticle',{key:'editId',value:edit});
                },
                end:function (layero, index) {
                    layui.data('editArticle',{key:'editId',remove:edit});
                    $("#placeForm").css("display","none");

                    //parent.location.reload();
                },
            });
        }else {
            form.val("placeForm",{
                "placeName":"",
                "placeAddress":"",
                "placeLongitude":"",
                "placeLatitude":"",
                "openTime":"",
                "englishIntroduce":"",
                "staticPage":"",
                "website":""
            });
            $("#content").val("");
            $(".thumbImg").attr('src',"");
            $('.placeType').val("请选择地点类型");
            //$('.languageType').val("请选择语言类型");
            delState = 0;
            checkState = 0;
            form.render();
            var index = layui.layer.open({
                title : "添加",
                type : 1,
                skin:"layui-layer-admin-page",
                offset: 'rb',
                area :[width,height],
                content : $('#placeForm'),
                shade : false,
                resize:false,
                anim: 2,
                success : function(layero, index){
                    layui.data('editArticle',{key:'editId',value:edit});
                },
                end:function (layero, index) {
                    layui.data('editArticle',{key:'editId',remove:edit});
                    $("#placeForm").css("display","none");
                },
            });
        }
    }

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
                //alert(res.data.url)
            }
        });
    });

    //上传医院详情图
    upload.render({
        elem: '#hospital',
        url: proPath+'/fileupload/smallfile',
        headers:{
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function (res) {
            $('.static').val(res.data.url);
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
        placeName : function(val){
            if(val == ''){
                return "地点名称不能为空";
            }
        },
        englishIntroduce : function(val){
            if(val == ''){
                return "简介不能为空";
            }
        },
        placeAddress : function(val){
            if(val == ''){
                return "地址不能为空";
            }
        },
        placeLongitude: function (val) {
            if(val == ''){
                return "经度不能为空";
            }
        },
        placeLatitude: function (val) {
            if(val == ''){
                return "纬度不能为空";
            }
        },
        placeContent:function(val) {
            if(val =='')
            {
                return "详细内容不能为空"
            }
        },
        // thumbnails: function () {
        //     if($('.thumbnails').attr('src') === "undefined"){
        //         layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
        //             layer.close(index);
        //         });
        //         return ;
        //     }
        // },
        placeType: function (val) {
            if(val == "请选择地点类型"){
                return "请选择类型";
            }
        },
    });


    //监听提交
    form.on("submit(addNews)",function(data){
        //实际使用时的提交信息
        var data = {
            id : dataId,
            placeName : $(".placeName").val(),
            placeAddress : $(".placeAddress").val(),
            placeLongitude : $('.placeLongitude').val(),
            placeLatitude : $('.placeLatitude').val(),
            openTime : $('.openTime').val(),
            englishIntroduce : $('.englishIntroduce').val(),
            placeContent : $('#content').val(),
            headImage : $(".thumbnails").attr("src"),  //缩略图
            placeType : $('.placeType').val(),    //分类
            //languageType : $('.languageType').val(),
            delState : delState,
            checkState: checkState,
            languageType: 1,
            isShow : data.field.isShow == "on" ? "1" : "0",    //展示状态
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            staticPage: $('.static').val(),
            webSite:data.field.website
        };
        lovexian.post(proPath + 'admin/placeInfo/saveOrUpdate',data,function () {
            //alert($(".thumbnails").attr("src"));
            lovexian.alert.success('发布成功，等待审核');
            var index = parent.layer.getFrameIndex(window.name);
            layer.closeAll();
            $reset.click();
            // $('#lovexian-job').find('#query').click();
        });
    });

    //退出
    $(document).on('click', '#close', function() {
        layer.close(layer.index);
    });

    //显示数据
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable'+layui.data('id').placeTypeId),
            id: 'actionInfoTable'+layui.data('id').placeTypeId,
            url: proPath + '/admin/placeInfo/listByTypeId?languageType=1&placeType='+layui.data('id').placeTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'placeName', title: '名称', minWidth: 150,align:'left'},
                {field: 'creatorName', title: '发布人', width: 80,align:'left'},
               {title: '审核状态', templet: '#check-state',width:100,align:'center'},
              {title: '展示状态', templet: '#show-flag',width:100,align:'center'},
               {title: '置顶状态', templet: '#top-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 170, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]],
        });
    }
    //显示数据
    function initTable2() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable'+layui.data('id').placeTypeId),
            id: 'actionInfoTable'+layui.data('id').placeTypeId,
            url: proPath + '/admin/placeInfo/listByTypeId?languageType=1&placeType='+layui.data('id').placeTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'placeName', title: '名称', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {title: '展示状态', templet: '#show-flag',align:'center'},
                {title: '置顶状态', templet: '#top-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option'+placeTypeId, minWidth: 140,align:'center'}
            ]],
        });
    }

    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;

        if (layEvent === 'detail') {
            preview(data);
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除信息', '确定删除该条信息吗？', function () {
                lovexian.del(proPath + 'admin/placeInfo/deleteById?id='+ obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit') {
            if(obj.data.checkState == 0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;
            }
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            addPlaceInfo(obj.data,1);
        }

        //上传音频开始
        if (layEvent === 'audio') {
            var url = "";
            lovexian.get(proPath+"/admin/placeInfo/getAudioById",{"id":obj.data.id},function (res) {
                url = res.url;
                admin.popup({
                    id: 'LAY-theme-culture-placeAudio',
                    area:["400px","230px"],
                    shadeClose:false,
                    shade:0,
                    title: '文化地点音频',
                    success: function(){
                        adminView(this.id).render('theme/culture/placeAudio', {
                            placeId: obj.data.id,
                            url: url,
                            hidden:url.trim() == ""? "layui-hide":""
                        }).then(function(){
                            //视图文件请求完毕，视图内容渲染前的回调
                        }).done(function(){
                            //视图文件请求完毕和内容渲染完毕的回调
                            layui.use('theme/culture/placeAudio', layui.factory('theme/culture/placeAudio'));
                        });
                    }
                });
            });
        }//上传音频结束

        //上传视频开始
        if (layEvent === 'video') {
            let placeId = obj.data.id;
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            var socket;
            admin.popup({
                id: 'LAY-theme-culture-placeVideos',
                area:[width,height],
                shadeClose:false,
                shade:0,
                title: '文化地点视频',
                success: function(){
                    adminView(this.id).render('theme/culture/placeVideo', {
                        placeId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        layui.use('theme/culture/placeVideos', layui.factory('theme/culture/placeVideos'));
                        socket = lovexian.uploadBigFileProgerssBar('progressBar',$('#placeId').val());
                    });
                },
                end: function () {
                    console.log("弹出层关闭了");
                    socket.close();
                }
            });
        }//上传视频结束

        //多图上传开始
        if (layEvent === 'image') {
            let placeId = obj.data.id;
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';

            admin.popup({
                id: 'LAY-theme-culture-placeImages',
                area:[width,height],
                shadeClose:false,
                shade:0,
                title: '景点图片',
                success: function(){
                    adminView(this.id).render('theme/culture/placeImages', {
                        placeId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                        console.log("视图文件请求完毕，视图内容渲染前的回调");
                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        console.log("视图文件请求完毕和内容渲染完毕的回调");
                        layui.use('theme/culture/placeImages', layui.factory('theme/culture/placeImages'));
                    });
                }
            });
        }

        //多图上传结束

    });

    function deleteActions(actionIds) {
        lovexian.del(proPath + '/admin/placeInfo/BatchDelete/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除信息成功');
            $reset.click();
        });
    }

    //实现预览的函数
    function preview(data){
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        var show = data.isShow;
        var top = data.isTop;


            var index = layui.layer.open({
                title : "预览",
                type : 1,
                skin:"layui-layer-admin-page",
                offset: 'rb',
                area :[width,height],
                content : $('#placeDetailForm'),
                shade : false,
                resize:false,
                anim: 2,
                move:false,
                success : function(layero, index){
                    form.val("placeDetailForm",{
                        "placeName":data.placeName,
                        "placeAddress":data.placeAddress,
                        "placeLongitude":data.placeLongitude,
                        "placeLatitude":data.placeLatitude,
                        "openTime":data.openTime,
                        "englishIntroduce":data.englishIntroduce,
                    });
                    $("#content").val(data.placeContent);
                    $(".thumbnails").attr('src',data.headImage);
                    $('.placeType').val(data.placeType);
                    //$('.languageType').val(data.languageType);
                    show == 1 ? $('.isShow').attr('checked',true):$('.isShow').attr('checked',false);
                    top == 1 ? $('.isTop').attr('checked',true):$('.isTop').attr('checked',false);
                    delState = data.delState;
                    checkState = 0;
                    dataId = data.id;
                    form.render();
                },
                end:function (layero, index) {
                    $("#placeDetailForm").css("display","none");
                },
            });

    }

    function getQueryParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        // alert(createTimeFrom);
        // alert(createTimeTo);
        return {
            placeName: $searchForm.find('input[name="placeName"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }

    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        if(placeTypeId==1 || placeTypeId==4 || placeTypeId == 7){
            initTable2();
        }else {
            initTable();
        }
    });

    // 监听显示不显示
    form.on('switch(switchShow)', function (data) {
        var path=proPath+"/admin/placeInfo/updatePlace";
        var id=$(data.elem).val();
        var text = data.elem.checked ? '展示':'不展示';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
                lovexian.post(path,{"isShow":text==='展示'? 1:0,"id":id},function(res){
                    if(res.code == 200){
                        layer.alert('【'+text+'】成功^_^', {
                            icon: 1,
                            skin: 'layui-layer-molv'
                        });
                    }else{
                        layer.alert('【'+text+'】失败~_~', {
                            icon: 2,
                            skin: 'layui-layer-hong'
                        });
                        if(text === '展示')
                            data.elem.checked = true;
                        else
                            data.elem.checked = false;
                    }
                    form.render();
                });
                layer.close(index);
            },function (index) {
                if(text==="展示"){
                    data.elem.checked = false;
                }else{
                    data.elem.checked = true;
                }
                form.render();
                layer.close(index);
            }
        );
    });

    // 置顶不置顶
    form.on('switch(switchTop)',function(data){
        var path=proPath+"/admin/placeInfo/updatePlace";
        var id=$(data.elem).val();
        var text = data.elem.checked ? '置顶':'不置顶';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
                lovexian.post(path,{"isTop":text==='置顶'? 1:0,"id":id},function(res){
                    if(res.code == 200){
                        layer.alert('【'+text+'】成功^_^', {
                            icon: 1,
                            skin: 'layui-layer-molv'
                        });
                    }else{
                        layer.alert('【'+text+'】失败~_~', {
                            icon: 2,
                            skin: 'layui-layer-hong'
                        });
                        if(text === '置顶')
                            data.elem.checked = true;
                        else
                            data.elem.checked = false;
                    }
                    form.render();
                });
                layer.close(index);
            },function (index) {
                if(text==="置顶"){
                    data.elem.checked = true;
                }else{
                    data.elem.checked = false;
                }
                form.render();
                layer.close();
            }
        );
    });

    //对外暴露的接口
    exports('theme/culture/eletourist', {});
});