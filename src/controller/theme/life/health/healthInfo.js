layui.define(['dropdown', 'admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        lovexian = layui.lovexian,
        form = layui.form,
        table = layui.table,
        formSelects = layui.formSelects,
        validate = layui.validate,
        setter = layui.setter,
        treeSelect = layui.treeSelect,
        dropdown = layui.dropdown,
        $view = $('#lovexian-admin'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $searchForm = $view.find('form'),
        sortObject = {field: 'createTime', type: null},
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        tableIns,
        laytpl = layui.laytpl,
        $nameValue = $('#username'),
        $rolesValue = $('#roles'),
        $avatarValue = $('#avatar'),
        $deptnameValue = $('#deptname'),
        $sexValue = $('#sex'),
        $mobileValue = $('#mobile'),
        $emailValue = $('#email'),
        $descriptionValue = $('#description'),
        $lastLoginTimeValue = $('#lastLoginTime'),
        $updateView = $('#user-update'),
    pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        pre_phone = $("#previewPhone");
    form.render();
    treeSelect.render({
        elem: $view.find('#dept'),
        type: 'get',
        data: proPath + '/system/dept/select/tree',
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        placeholder: '请选择',
        search: false
    });


    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    formSelects.render();

    initTable();

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('userTable');
            if (name === 'add') {

                addHealthInfo({},false);

            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的爱健康信息');
                } else {
                    lovexian.modal.confirm('删除信息', '确定删除爱健康记录？', function () {
                        var userIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            userIds.push(item.id)
                        });
                        deleteUsers(userIds.join(','));
                    });
                }
            }
        },
        options: [{
            name: 'add',
            title: '新增健康信息',
            perms: 'user:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'user:delete'
        }]
    });

    table.on('tool(userTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        var type
        if(obj.event === 'showImage'){
            layer.open({
                title:false,
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                shadeClose: true, //开启遮罩关闭
                end: function (index, layero) {
                    return false;
                },
                content: '<div style="text-align:center"><img src="' + data.headImage + '"  style="height:100% ;width:100%"/></div>'
            });}

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
        if (layEvent === 'del') {//删除景点信息
            lovexian.modal.confirm('删除记录', '确定删除此条记录？', function () {
                lovexian.del(proPath + '/admin/healthInfo/delete?id=' + obj.data.id, null, function () {
                    console.log(obj.data.id);
                    console.log("success");
                    lovexian.alert.success('删除该记录成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
            layui.data('editHealth',{key:'editId',value:'1'});

            layui.data('healthData',{key:'data', value:obj.data});
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;

            }
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            addHealthInfo(obj.data,true);
        }
    });


/*    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.title;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = data.creatorName;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.content;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);
        }
    }*/

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/healthInfo/preview/'+data.id,function (res) {
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

    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });
    $reset.on('click', function () {
        $searchForm[0].reset();
        treeSelect.revokeNode('dept');
        sortObject.type = 'null';
        tableIns.reload({where: getQueryParams(), page: {curr: 1}, initSort: sortObject});
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'userTable',
            url: proPath + '/admin/healthInfo/list',
            defaultToolbar: ['filter', 'exports', 'print', { //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
                title: '提示'
                ,layEvent: 'LAYTABLE_TIPS'
                ,icon: 'layui-icon-tips'
            }],
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'title', title: '文章标题', minWidth: 120,align:'left'},
                {
                    field: 'headImage', title: '缩略图',  event: 'showImage',templet: function (d) {
                        return '<div ><img src="'+d.headImage+'" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'creatorName', title: '发布人', minWidth: 120,align:'left'},
                {field:'checkState',title: '审核状态', templet: '#check-state',minWidth: 120,align:'center'},
                {field:'shwoFlag',title: '展示状态', templet: '#show-flag',minWidth: 120,align:'center'},
                {field:'topFlag',title: '置顶状态', templet: '#top-flag',minWidth: 120,align:'center'},

                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {field: 'updateTime', title: '更新时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#user-option', minWidth: 120,align:'center',fixed: 'right'}
            ]]
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
            title: $searchForm.find('input[name="title"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            typeId: $searchForm.find("select[name='healthType']").val(),
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }
    function addHealthInfo(data,isEdit){
        console.log(isEdit);
        lovexian.popup("/theme/life/health/healthAdd",isEdit?"编辑信息":"添加信息",$.extend(data,{isEdit:isEdit}),function () {
                if(isEdit){
                    //编辑文章的回显操作
                    form.val('healthAdd',{
                        'title':data.title,
                        'subTitle':data.subtitle,
                        'content':data.content,
                    });
                    $("#languageTypeId").val(data.languageType);
                    $("input[name='openness'][value="+data.isShow+"]").prop("checked",true);
                    $('.thumbImg').attr("src",data.headImage);
                    data.isTop==1?$('input[name="isTop"]').attr('checked', true):"";
                }
                layui.use('theme/life/health/healthAdd', layui.factory('theme/life/health/healthAdd'));
            });
    }

    function deleteUsers(userIds) {
        var currentUserId = layui.data(layui.setter.tableName)[layui.setter.USERNAME]['userId'] + '';
        console.log(currentUserId);
        console.log(userIds);
        // return false;
        if (('' + userIds).split(',').indexOf(currentUserId) !== -1) {
            lovexian.alert.warn('所选用户包含当前登录用户，无法删除');
            return;
        }
        lovexian.del(proPath + '/admin/healthInfo/batchDelete/' + userIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除用户成功');
            $query.click();
        });
    }
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
        lovexian.post(proPath + '/admin/healthInfo/showUpdate', data, function () {

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
        lovexian.post(proPath + '/admin/healthInfo/showUpdate', data, function () {

            lovexian.alert.success(message);

        });

    });

    //对外暴露的接口
    exports('theme/life/health/healthInfo', {});
});
