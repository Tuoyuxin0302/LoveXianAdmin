//爱活动——活动信息——孙美琪
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-activity'),
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
    element.init();
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

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('actionInfoTable'+layui.data('id').activityTypeId);
            if (name === 'add') {
                addActionInfo({},false);
                //跳转到actionAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/actionAdd';
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的文章');
                } else {
                    lovexian.modal.confirm('删除文章', '确定删除该篇文章？', function () {
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
            title: '添加文章',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });

    function addActionInfo(data,isEdit){
        var actiondata=data;
        lovexian.popup("theme/life/actionAdd",isEdit?"编辑文章":"添加文章",$.extend(data,{isEdit:isEdit}),function () {
            if(isEdit){
                //编辑文章的回显操作
                form.val('actionContent',{
                   'actTitle':data.actTitle,
                   'actSubtitle':data.actSubtitle,
                    'actAbstract':data.actAbstract
                });
                $("#languageTypeId").val(data.languageType);
                data.isTop==0?$('input[name="isTop"]').attr('checked', null):"";
                $("input[name='openness'][value="+data.isShow+"]").prop("checked",true);
                $('.thumbImg').attr("src",data.headImage);
            }
            layui.use('theme/life/actionAdd', layui.factory('theme/life/actionAdd'));
        },
        function () {
            // $reset.click();
        });
    }


    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable'+layui.data('id').activityTypeId),
            id: 'actionInfoTable'+layui.data('id').activityTypeId,
            url: proPath + '/admin/actionInfo/listByTypeId?actTypeId='+$(".layui-tab-title .layui-this").attr("lay-id"),
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'actTitle', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {title: '展示状态', templet: '#show-flag',align:'center'},
                {title: '置顶状态', templet: '#top-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]],
        });
    }

    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;

        if (layEvent === 'detail') {
            showContent(data);
            pre_layer.show();
            resetPrePhoneCss();
            pre_bg.on("click",function(){
                pre_layer.hide();
            });

            //预览图片居中样式
            var css_str = {};
            var pos_left = 0;
            var pos_top = 0;
            $(window).resize(resetPrePhoneCss);
            //重置预览手机页面的CSS
            function resetPrePhoneCss(){
                pos_left = $(window).width() / 2 - pre_phone.width() / 2;
                pos_top = $(window).height() / 2 - pre_phone.height() / 2+25;
                css_str = {
                    left:pos_left + "px",
                    top:pos_top + "px"
                }
                pre_phone.css(css_str);
            }
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除爱活动信息', '确定删除该篇文章吗？', function () {
                lovexian.del(proPath + '/admin/actionInfo/deleteById?id='+ obj.data.id, null, function () {
                    lovexian.alert.success('删除文章成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit') {
            layui.data('editArticle',{key:'editId',value:'1'});
            layui.data('articleData',{key:'data', value:data});

            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;
            }
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            addActionInfo(obj.data,true);
        }
    });

    function deleteActions(actionIds) {
        lovexian.del(proPath + '/admin/actionInfo/BatchDelete/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $reset.click();
        });
    }

    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/actionInfo/preview/'+data.id,function (res) {
            if(res.status=='200'){
                //预览
                if (ifr_document) {
                    //设置正文
                    var content_str = res.data;
                    var ifr_content = $(ifr_document).find(".article-content");
                    ifr_content.html(content_str);
                }
            }else{
                //无法预览
            }
        });

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
            actTitle: $searchForm.find('input[name="actTitle"]').val().trim(),
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
       initTable();
    });

    //展示状态的请求
    form.on('switch(delState)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '展示':'不展示';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(proPath+"/admin/actionInfo/updateAction",{"isShow":text==='展示'? 1:0,"id":id},function(res){
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
                data.elem.checked=false;
            }else{
                data.elem.checked=true;
            }
            form.render();
            layer.close(index);
        });
    });

    //置顶状态的请求
    form.on('switch(isTop)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '置顶':'不置顶';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(proPath+"/admin/actionInfo/updateAction",{"isTop":text==='置顶'? 1:0,"id":id},function(res){
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
                data.elem.checked=false;
            }else{
                data.elem.checked=true;
            }
            form.render();
            layer.close(index);
            }
        );
    });



    //对外暴露的接口
    exports('theme/life/activity', {});
});