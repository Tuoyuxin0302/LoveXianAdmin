layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-lawerInfo'),//与html中id相同
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
    var stars;

    form.render();
    initTable();
    var typeId=1;


    element.on('tab(lawerTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('id',{key:'lawerTypeId',value:idvalue});
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
        position: 'fixed'
    });

    element.tabChange('lawerTab',1);
    dropdown.render({//添加删除小组件
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('lawerInfoTable');
            if (name === 'add') {
                addLawerInfo("",0);
                //跳转到actionAdd页面
                //                 // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/actionAdd';
            }
            if (name === 'delete') {//批量删除
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的律师信息');
                } else {
                    lovexian.modal.confirm('删除律师', '确定删除这些律师信息吗？', function () {
                        var lawerIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            lawerIds.push(item.id)
                        });
                        deleteActions(lawerIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加律师信息',
            perms: 'add:lawerInfo'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'del:lawerInfo'
        }]
    });
    function clearFormData() {
        $(".lawerName").val("");
        $(".lawerOrganization").val("");
        $(".telNumber").val("");
        $(".skillField").val("");
        $(".workTime").val("");
        $(".lawerAbstract").val("");
        $(".keywords").val("");
        // $(".thumbImg").val("");
        $(".others").val("");
        $(".thumbImg").attr('src',"");
        $(".star").val("");
    }
    function addLawerInfo(data,isEdit){
        // console.log(isEdit);
        lovexian.popup("theme/life/lawerAdd",isEdit?"编辑律师":"添加律师",$.extend(data,{isEdit:isEdit}),function () {
                if(isEdit===1) {
                    layui.use('theme/life/lawerAdd', layui.factory('theme/life/lawerAdd'));
                    form.val("lawerForm",{
                        "lawerName":data.lawerName,
                        "lawerOrganization":data.lawerOrganization,
                        "telNumber":data.telNumber,
                        "skillField":data.skillField,
                        "lawerAbstract":data.lawerAbstract,
                        "keywords":data.keywords,
                        "workTime":data.workTime,

                    });
                    $('.thumbImg').attr("src",data.lawerHeadPhoto);

                } else{
                    layui.use('theme/life/lawerAdd', layui.factory('theme/life/lawerAdd'));

                }

            });
    }

    function initTable() {//初始化界面（下面的表格）
        tableIns = lovexian.table.init({
            elem: $('#lawerInfoTable'),
            id: 'lawerInfoTable',
            url: proPath + '/admin/lawerInfo/listByTypeId?',//id根据组件而动，初始化表格
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox',fixed: 'lift'},
                {field: 'lawerName', title: '律师姓名 ', minWidth: 120,align:'center',fixed: 'lift'},//对应后台idea的字段
                {
                    field: 'lawerHeadPhoto', title: '图片', event: 'showImage', templet: function (d) {
                        var url = d.lawerHeadPhoto;
                        return '<div>' +
                            '<img src="' + url + '" height:70px width:90px />' +
                            '</div>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'lawerOrganization', title: '工作机构', minWidth:120,align:'center'},
                {field: 'telNumber', title: '手机号码', minWidth:180,align:'center'},
                {field: 'creatorName', title: '发布人', minWidth:180,align:'center'},
                {title: '审核状态', templet: '#check-state',minWidth:120,align:'center'},
                {title: '展示状态', templet: '#show-flag',minWidth:120,align:'center'},
                {title: '置顶状态', templet: '#top-flag',minWidth:120,align:'center'},
                {field: 'workTime', title: '工作年限', minWidth: 180, sort: true,align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {field: 'updateTime', title: '更新时间',minWidth: 180, sort: true,align:'center'},
                {field: 'updaterName', title: '更新者'},
                {title: '操作', toolbar: '#action-option', minWidth: 120, fixed: 'right'}
            ]],
        });
    }

    table.on('tool(lawerInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        var type
        if(obj.event === 'showImage'){
            layer.open({
                type: 1
                ,id:'lawerInfoTable'+type
                ,content: '<img src="' + data.lawerHeadPhoto + '" style="height:200px" />'
                ,btn: '关闭'
                ,btnAlign: 'c' //按钮居中
                ,shade: 0 //不显示遮罩
                ,yes: function(){
                    layer.closeAll();
                }
            });
        }
        if (layEvent === 'detail') {//三大组件之detail,要修改
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
        if (layEvent === 'del') {//删除景点信息
            lovexian.modal.confirm('删除律师信息', '确定删除这条律师的记录吗？', function () {
                lovexian.del(proPath + '/admin/lawerInfo/deleteById?id='+ obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除该律师成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            addLawerInfo(obj.data,1);
        }
    });//操作


    function deleteActions(lawerIds) {//操作组件之一，删除
        lovexian.del(proPath + '/admin/lawerInfo/BatchDelete/' + lawerIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $query.click();
        });
    }

/*    function showContent(data){//操作组件之一，展示
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.lawerName;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = data.creatorName;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.introduction;
            var tickets=data.tickets
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html("introduction:"+content_str+"</br>"+tickets);
            //设置图片
            var image_src = data.lawerHeadPhoto;
            var ifr_image = $(ifr_document).find(".img");
            ifr_image.html(image_src);
        }
    }*/

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/lawerInfo/preview/'+data.id,function (res) {
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
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        // alert(createTimeFrom);
        // alert(createTimeTo);
        return {
            lawerName: $searchForm.find('input[name="lawerName"]').val().trim(),
            lawerOrganization:$searchForm.find('input[name="lawerOrganization"]').val()|| '',
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
    $reset.on('click',function () {//重置
        initTable();
    });

    //置顶状态的请求
    form.on('switch(isTop)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '置顶':'不置顶';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(proPath+"/admin/lawerInfo/updateLawer",{"isTop":text==='置顶'? 1:0,"id":id},function(res){
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
        });
    });

    //展示状态的请求
    form.on('switch(isShow)',function(data){
        var id=$(data.elem).val();
        var text = data.elem.checked ? '展示':'不展示';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(proPath+"/admin/lawerInfo/updateLawer",{"isShow":text==='展示'? 1:0,"id":id},function(res){
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
        });
    });



    //对外暴露的接口
    exports('theme/life/lawer', {});
});