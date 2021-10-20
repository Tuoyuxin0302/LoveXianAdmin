layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        adminView = layui.view,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-touristActivity'),//与html中id相同
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
        pre_phone = $("#previewPhone");

    $searchForm = $view.find('form');
    $query=$searchForm.find("div[name='query']");
    $reset=$searchForm.find("div[name='reset']");

    form.render();
    var typeId=1;


    element.on('tab(actionTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('id',{key:'activityTypeId',value:idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
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
        position:'fixed'
    });

    element.tabChange('actionTab',1);
    dropdown.render({//添加删除小组件
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('touristInfoTable');

            if (name === 'add') {
                addActionInfo("",false);
                //跳转到actionAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/actionAdd';
            }
            if (name === 'delete') {//批量删除
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的景点信息');
                } else {
                    lovexian.modal.confirm('删除景点', '确定删除这些景点信息吗？', function () {
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
            title: '录入景点',
            perms: 'tourist:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'tourist:delete'
        }]
    });
    function clearFormData() {
        $(".name").val("");
        $(".longitude").val("");
        $(".latitude").val("");
        $(".locationName").val("");
        $(".hotTime").val("");
        $(".coldTime").val("");
        $(".tickets").val("");
        $(".keywords").val("");
        $(".traffic").val("");
        $(".introduction").val("");
        $(".others").val("");
        $(".thumbnails").attr('src',"");

    }
    function addActionInfo(data,isEdit){//新增数据页面
        lovexian.popup("theme/culture/touristAdd",isEdit?"编辑景点信息":"添加景点信息",$.extend(data,{isEdit:isEdit}),function () {
                if (isEdit) {
                    $("#languageTypeId").val(data.languageType);
                    data.isTop == 1 ? $("input[type='checkbox'][name='isTopCheck']").attr("checked", true) :
                        $("input[type='checkbox'][name='isTopCheck']").attr("checked", false);
                }
                layui.use('theme/culture/touristAdd', layui.factory('theme/culture/touristAdd'));
            },
            function () {
                // $reset.click();
             /*   window.parent.location.reload();*/
            });
    }

    function initTable() {//初始化界面（下面的表格）
        tableIns = lovexian.table.init({
            elem: $('#touristInfoTable'),
            id: 'touristInfoTable',
            url: proPath + '/admin/scene/listByTypeId?languageType=1',//id根据组件而动，初始化表格
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'name', title: '景点名称 ', minWidth: 200,align:'left'},//对应后台idea的字段
                {field: 'creatorName', title: '发布人', width: 100,align:'left'},
                {title: '审核状态', templet: '#check-state',width: 100,align:'center'},
                {title: '展示状态', templet: '#show-flag',width: 100,align:'center'},
                {title: '置顶状态', templet: '#top-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 150, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center',fixed:'right'}
            ]],
        });
    }
    table.on('tool(touristInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'detail') {//三大组件之detail,要修改
            showContent(obj.data);
        }
        if (layEvent === 'del') {//删除景点信息
            lovexian.modal.confirm('删除景点信息', '确定删除这条景点的记录吗？', function () {
                lovexian.del(proPath + '/admin/scene/deleteById?id='+ obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除该景点成功');
                    $reset.click(); 
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;
            }
            addActionInfo(obj.data,true);
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
                title: '景点图片',
                success: function(){
                    adminView(this.id).render('theme/culture/sceneImages', {
                        sceneId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                        console.log("视图文件请求完毕，视图内容渲染前的回调");

                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        console.log("视图文件请求完毕和内容渲染完毕的回调");
                        layui.use('theme/culture/sceneImages', layui.factory('theme/culture/sceneImages'));
                    });
                }
            });
        }

        if (layEvent === 'video') {
            let sceneId = obj.data.id;
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            var socket;
            admin.popup({
                id: 'LAY-theme-culture-sceneVideos',
                area:[width,height],
                shadeClose:false,
                shade:0,
                title: '景点视频',
                success: function(){
                    adminView(this.id).render('theme/culture/sceneVideos', {
                        sceneId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        layui.use('theme/culture/sceneVideos', layui.factory('theme/culture/sceneVideos'));
                        socket = lovexian.uploadBigFileProgerssBar('progressBar',$('#sceneId').val());
                    });
                },
                end: function () {
                    console.log("弹出层关闭了");
                    socket.close();
                }
            });
        }
        if (layEvent === 'audio') {
            var url = "";
            lovexian.get(proPath+"/admin/scene/getAudioById",{"id":obj.data.id},function (res) {
                url = res.url;
                admin.popup({
                    id: 'LAY-theme-culture-sceneAudio',
                    area:["400px","230px"],
                    shadeClose:false,
                    shade:0,
                    title: '景点音频',
                    success: function(){
                        adminView(this.id).render('theme/culture/sceneAudio', {
                            sceneId: obj.data.id,
                            url: url,
                            hidden:url.trim() == ""? "layui-hide":""
                        }).then(function(){
                            //视图文件请求完毕，视图内容渲染前的回调
                        }).done(function(){
                            //视图文件请求完毕和内容渲染完毕的回调
                            layui.use('theme/culture/sceneAudio', layui.factory('theme/culture/sceneAudio'));
                        });
                    }
                });
            });
        }
    });//操作
    function deleteActions(actionIds) {//操作组件之一，删除
        lovexian.del(proPath + '/admin/scene/BatchDelete/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除景点成功');
            $reset.click();
        });
    }
    function showContent(data){
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        layer.open({
            title : "预览景点信息",
            type : 1,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content : $('#touristDetailForm'), //具体显示的check
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero,index){
                var name = $('.Dname');
                var longitude = $('.Dlongitude');
                var latitude = $('.Dlatitude');
                var locationName = $('.DlocationName');//name用#,class 别名用.
                var hotTime=$('.DhotTime');
                var coldTime=$('.DcoldTime');
                var tickets=$('.Dtickets');
                var introduction=$('.Dintroduction');
                var traffic=$('.Dtraffic');
                var others=$('.Dothers');
                var webSite = $(".DwebSite");
                name.val(data.name);
                longitude.val(data.longitude);
                latitude.val(data.latitude);
                locationName.val(data.locationName);
                hotTime.val(data.hotTime);
                coldTime.val(data.coldTime);
                webSite.val(data.webSite)
                tickets.val(data.tickets);
                introduction.val(data.introduction);
                traffic.val(data.traffic);
                others.val(data.others);
                $(".Dthumbnails").attr("src",data.thumbnails);
                data.isTop==1? $("input[type='checkbox'][name='isTopCheck']").attr("checked",true):
                    $("input[type='checkbox'][name='isTopCheck']").attr("checked",false);
                data.isShow==0 ? $("input[type='radio'][name='opennessCheck'][value='0']").attr("checked",true):
                    $("input[type='radio'][name='opennessCheck'][value='1']").attr("checked",true);
                form.render();
            },
            end:function () {
                clearFormData();
                $('#touristDetailForm').css("display","none");
                //window.parent.location.reload();//关闭刷新

            }
        })
    }
    function getQueryParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();

        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            name: $searchForm.find('input[name="name"]').val(),//.trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delStatus: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }
    $query.on('click',function () {
        //QueryData();
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {//重置
        initTable();
    });
    //展示状态的请求
    form.on('switch(delState)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '展示':'不展示';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
                lovexian.post(proPath+"/admin/scene/updateAction",{"isShow":text==='展示'? 1:0,"id":id},function(res){
                    if(res.code == 200){
                        layer.alert('【'+text+'】成功^_^', {
                            icon: 1,
                            skin: 'layui-layer-molv'
                        });
                        // lovexian.success()
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
            }, function (index) {
                if(text==='展示')
                {
                    data.elem.checked=false;
                }
                else data.elem.checked=true;
                form.render();
                layer.close(index);
            }
        );
    });

    //置顶状态的请求
    form.on('switch(isTop)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '置顶':'不置顶';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
                lovexian.post(proPath+"/admin/scene/updateAction",{"isTop":text==='置顶'? 1:0,"id":id},function(res){
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
            }, function (index) {
                if (text === '置顶') {
                    data.elem.checked = false;
                } else data.elem.checked = true;
                form.render();
                layer.close(index);
            }
        );
    });
    //对外暴露的接口
    exports('theme/culture/touristActivity', {});
});