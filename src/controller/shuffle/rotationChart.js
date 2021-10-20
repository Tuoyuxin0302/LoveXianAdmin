layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl','upload'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-culture'),
        adminView = layui.view,
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
        tabId = $(".layui-tab-title .layui-this").attr("lay-id"),
        pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query=$searchForm.find("div[name='query']");
    $reset=$searchForm.find("div[name='reset']");

    form.render();

    element.on('tab(placeTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('id',{key:'placeTypeId',value:idvalue});
        chartLocation = layui.data('id').placeTypeId;
        if(idvalue == 3){
            $(".action-more").addClass('layui-hide');
            initTable2();
        }else{
            $(".action-more").removeClass('layui-hide');
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
                addChart("",0);
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
    var chartLocation;
    function addChart(data,isEdit){
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        admin.popup({
            id: 'LAY-theme-culture-sceneImages',
            area:[width,height],
            shadeClose:false,
            shade:0,
            title: '轮播图',
            success: function(){
                // if(data.location == 3){
                //     adminView(this.id).render('shuffle/rotationAdd', {
                //         sceneId: data.sceneId,
                //     }).then(function(){
                //         //视图文件请求完毕，视图内容渲染前的回调
                //         console.log("视图文件请求完毕，视图内容渲染前的回调");
                //
                //     }).done(function(){
                //         //视图文件请求完毕和内容渲染完毕的回调
                //         console.log("视图文件请求完毕和内容渲染完毕的回调");
                //         layui.use('shuffle/rotationAdd', layui.factory('shuffle/rotationAdd'));
                //     });
                // }
                layui.data('chart',{key: 'location',value: chartLocation});
                adminView(this.id).render('shuffle/rotationAdd', {
                }).then(function(){
                    //视图文件请求完毕，视图内容渲染前的回调
                    console.log("视图文件请求完毕，视图内容渲染前的回调");

                }).done(function(){
                    //视图文件请求完毕和内容渲染完毕的回调
                    console.log("视图文件请求完毕和内容渲染完毕的回调");
                    layui.use('shuffle/rotationAdd', layui.factory('shuffle/rotationAdd'));
                });
            },
            end:function () {
                layui.data('chart',{key: 'location',remove: chartLocation});
            }
        });
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
        placeContent:function(val)
        {
            if(val =='')
            {
                return "详细内容不能为空"
            }
        },
        thumbnails: function () {
            if(typeof ($(".thumbnails").attr("src"))=="undefined")
            {
                return "请上传图片";
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
            headImage : $(".thumbImg").attr("src"),  //缩略图
            placeType : $('.placeType').val(),    //分类
            languageType : $('.languageType').val(),
            delState : delState,
            checkState: checkState,
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

    //显示数据
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable'+layui.data('id').placeTypeId),
            id: 'actionInfoTable'+layui.data('id').placeTypeId,
            url: proPath + '/admin/shufflingFigure/list?location='+layui.data('id').placeTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'imageName', title: '图片名称', minWidth: 200,align:'left'},
                {
                    field: 'path', title: '图片', templet: function (d) {
                        var url = d.path;
                        return '<a href="' + url + '" target="_blank " title="点击查看">' +
                            '<img src="' + url + '" style="height:100px" />' +
                            '</a>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},

                {title: '展示状态', templet: '#show-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '图片类型', templet: '#chart-type',minWidth: 200,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]],
        });
    }

    //显示数据
    function initTable2() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable'+layui.data('id').placeTypeId),
            id: 'actionInfoTable'+layui.data('id').placeTypeId,
            url: proPath + '/admin/scene/listByTypeId?languageType=1',//id根据组件而动，初始化表格
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'name', title: '景点名称', minWidth: 200,align:'left'},//对应后台idea的字段
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},



                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option2', minWidth: 140,align:'center',fixed:'right'}
            ]],
        });
    }

    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除信息', '确定删除该条信息吗？', function () {
                lovexian.del(proPath + 'admin/shufflingFigure/deleteImage?id='+ obj.data.id, null, function () {
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
            addChart(obj.data,1);
        }

        if (layEvent === 'image') {
            let sceneId = obj.data.id;
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';

            admin.popup({
                id: 'LAY-theme-culture-sceneImages',
                area:[width,height],
                shadeClose:false,
                shade:0,
                title: '景点轮播图',
                success: function(){
                    layui.data('chart',{key: 'location',value: chartLocation});
                    adminView(this.id).render('shuffle/sceneRotationAdd', {
                        sceneId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                        console.log("视图文件请求完毕，视图内容渲染前的回调");

                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        console.log("视图文件请求完毕和内容渲染完毕的回调");
                        layui.use('shuffle/sceneRotationAdd', layui.factory('shuffle/sceneRotationAdd'));
                    });
                },
                end:function () {
                    layui.data('chart',{key: 'location',remove: chartLocation});
                }
            });
        }
    });

    function deleteActions(actionIds) {
        lovexian.del(proPath + '/admin/shufflingFigure/BatchDelete/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除信息成功');
            $reset.click();
        });
    }

    //实现预览的函数
    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.actTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = data.creatorName;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.actContent;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);
        }
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
            imageName: $searchForm.find('input[name="placeName"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            //checkState: $searchForm.find("select[name='check']").val(),
        };
    }

    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        initTable();
    });

    // 监听显示不显示
    form.on('switch(switchShow)', function (data) {
        var path=proPath+"/admin/shufflingFigure/updatePlace";
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
    exports('shuffle/rotationChart', {});
});