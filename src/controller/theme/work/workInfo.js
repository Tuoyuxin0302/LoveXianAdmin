layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-workPermit'),
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
    initTable();

    var idvalue2;
    element.on('tab(workTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        idvalue2=idvalue;
        layui.data('id',{key:'workTypeId',value:idvalue});
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

    element.tabChange('workTab',1);

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('workInfoTable'+layui.data('id').workTypeId);
            if (name === 'add') {
                addWorkInfo({},false);
                //跳转到workAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/actionAdd';
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的工作');
                } else {
                    lovexian.modal.confirm('删除工作信息', '确定删除该工作信息？', function () {
                        var workIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            workIds.push(item.id)
                        });
                        deleteWorks(workIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加工作',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });
    var workInfo;

    function addWorkInfo(data,isEdit){
        console.log(isEdit);
        lovexian.popup("theme/work/workAdd",isEdit?"编辑工作信息":"添加工作信息",$.extend(data,{isEdit:isEdit}),function () {
                if(isEdit){
                    //编辑文章的回显操作
                    form.val('workInfoContent',{
                        'workTitle':data.workTitle,
                        'subTitle':data.workSubtitle,
                        'workAbstract':data.workAbstract
                    });
                    $("#languageTypeId").val(data.languageType);
                    var typeId=data.workTypeId;
                    var select = document.getElementById("workType");
                    for (var i = 0; i < select.options.length; i++){
                        if (select.options[i].value == typeId){
                            select.options[i].selected = true;
                            break;
                        }
                    }
                    data.isTop==1?$('input[name="isTop"]').attr('checked', true):"";
                    $("input[name='openness'][value="+data.isShow+"]").prop("checked",true);
                    $('.thumbImg').attr("src",data.workHeadPhoto);
                }else{

                    var select = document.getElementById("workType");
                    for (var i = 0; i < select.options.length; i++){
                        if (select.options[i].value == idvalue2){
                            select.options[i].selected = true;
                            break;
                        }
                    }
                }

                layui.use('theme/work/workAdd', layui.factory('theme/work/workAdd'));
            }
           );
    }
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#workInfoTable'+layui.data('id').workTypeId),
            id: 'workInfoTable'+layui.data('id').workTypeId,
            url: proPath + '/admin/workInfoAdmin/listByTypeId?workTypeId=' + layui.data('id').workTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'workTitle', title: '工作标题', minWidth:100,align:'left'},
                {
                    field: 'workHeadPhoto', title: '头图', event:'showImage', templet: function (d) {
                        var url = d.workHeadPhoto;
                        return '<div>' +
                            '<img src="' + url + '" height:90px width:70px>' +
                            '</div>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'creatorName', title: '发布人', minWidth:120,align:'left'},
                {field: 'workSubtitle', title: '副标题',minWidth: 120, align:'left'},
                {field: 'checkState', title: '审核状态', templet: '#check-state',minWidth: 120,align:'center'},
                {field: 'showFlag', title: '展示状态', templet: '#show-flag',minWidth: 120,align:'center'},
                {field: 'topFlag', title: '置顶状态', templet: '#top-flag',minWidth: 120,align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                // {field: 'workContent', title: '工作信息',minWidth: 120, align:'center'},
                // {field: 'workTypeId', title: '工作类型',minWidth: 120, align:'left'},
                {field: 'updateTime', title: '更新时间',minWidth: 180, sort: true,align:'center'},
                {field: 'updaterName', title: '更新者',minWidth: 120,},
                {title: '操作', toolbar: '#action-option', minWidth: 120, fixed: 'right'}
            ]],
        });
    }

    table.on('tool(workInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        var type
        if(obj.event === 'showImage'){
            layer.open({
                type: 1
                ,id:'lawerInfoTable'+type
                ,content: '<img src="' + data.workHeadPhoto + '" style="height:200px" />'
                ,btn: '关闭'
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll();
                }
            });
        }
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
            lovexian.modal.confirm('删除爱工作信息', '确定删除该工作信息吗？', function () {
                lovexian.del(proPath + '/admin/workInfoAdmin/deleteById?id='+ obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除工作信息成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            layui.data('workData',{key:'editId',value:'1'});
            layui.data('workData',{ key:'data', value:obj.data});
            if(obj.data.checkState===0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;

            }
            addWorkInfo(obj.data,true);
            initTable();
        }
    });
    //工具栏事件
    // table.on('toolbar(workInfoTable)', function(obj){
    //     var checkStatus = table.checkStatus(obj.config.id);
    //     switch(obj.event){
    //         case 'getCheckData':
    //             var data = checkStatus.data;
    //             layer.alert(JSON.stringify(data));
    //             break;
    //         case 'getCheckLength':
    //             var data = checkStatus.data;
    //             layer.msg('选中了：'+ data.length + ' 个');
    //             break;
    //         case 'isAll':
    //             layer.msg(checkStatus.isAll ? '全选': '未全选');
    //             break;
    //     }
    // });
    form.on('switch(switchShow)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message="";
        if(show_value==1){
            message="成功展示";
        }else {
            message="取消成功";

        }
        var id = this.value;
        var data = {
            id: id,
            isShow: show_value
        };
        lovexian.post(proPath + '/admin/workInfoAdmin/showUpdate', data, function () {

            lovexian.alert.success(message);

        });

    });
    form.on('switch(switchTop)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message="";
        if(show_value==1){
            message="置顶成功";
        }else {
            message="取消置顶";
        }
        var id = this.value;
        var data = {
            id: id,
            isTop: show_value
        };
        lovexian.post(proPath + '/admin/workInfoAdmin/showUpdate', data, function () {

            lovexian.alert.success(message);
            $query.click();
        });

    });
    function deleteWorks(workIds) {
        lovexian.del(proPath + '/admin/workInfoAdmin/BatchDelete/' + workIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除工作信息成功');
            $query.click();
        });
    }

/*    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.workTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = data.creatorName;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.workContent;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);
            //设置图片
            var image_src = data.workHeadPhoto;
            var ifr_image = $(ifr_document).find(".img");
            ifr_image.html(image_src);
        }
    }*/
    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/workInfoAdmin/preview/'+data.id,function (res) {
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
            workTitle: $searchForm.find('input[name="workTitle"]').val().trim(),
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

    //对外暴露的接口
    exports('theme/work/workInfo', {});
});