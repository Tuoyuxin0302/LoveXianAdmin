layui.define(['jquery', 'dropdown', 'admin','formSelects', 'view','validate','baseSetting','lovexian','laydate', 'form', 'table', 'laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        lovexian = layui.lovexian,
        table = layui.table,
        formSelects = layui.formSelects,
        validate = layui.validate,
        setter = layui.setter,
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
        $updateView = $('#user-update');


    initTable();

    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });
    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click'
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('userTable');
            if (name === 'export') {
                var params = $.extend(getQueryParams(), {field: sortObject.field, order: sortObject.type});
                params.pageSize = $view.find(".layui-laypage-limits option:selected").val();
                params.pageNum = $view.find(".layui-laypage-em").next().html();
                lovexian.download(proPath + '/admin/cellUser/list', params, '用户信息表.xlsx');
            }
        },
        options: [{
            name: 'export',
            title: '导出Excel',
            perms: 'user:export'
        }]
    });

    formSelects.config('user-update-role', {
        searchUrl: proPath + '/admin/cellUser/list',
        response: {
            statusCode: 200
        },
        header: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        beforeSuccess: function (id, url, searchVal, result) {
            var data = result.data.rows;
            var tranData = [];
            for (var i = 0; i < data.length; i++) {
                tranData.push({
                    name: data[i].roleName,
                    value: data[i].roleId
                })
            }
            result.data = tranData;
            return result;
        },
        success: function () {
            formSelects.value('user-update-role', layui.data(layui.setter.tableName)[layui.setter.USERNAME].roleId.split(','));
        },
        error: function (id, url, searchVal, err) {
            lovexian.alert.error('获取角色列表失败');
        }
    });

    table.on('sort(userTable)', function (obj) {
        sortObject = obj;
        console.log(sortObject);
        tableIns.reload({
            initSort: obj,
            where: $.extend(getQueryParams(), {
                field: obj.field,
                order: obj.type
            })
        });
    });

    $query.on('click', function () {
        var params = $.extend(getQueryParams(), {field: sortObject.field, order: sortObject.type});
        tableIns.reload({where: params, page: {curr: 1}});
    });

    $reset.on('click', function () {
        $searchForm[0].reset();
        //treeSelect.revokeNode('dept');
        sortObject.type = 'null';
        tableIns.reload({where: getQueryParams(), page: {curr: 1}, initSort: sortObject});
    });


    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'userTable',
            url: proPath + '/admin/cellUser/list',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'username', title: '用户名', minWidth: 100,align:'center'},
                {field: 'name', title: '姓名', align:'center'},
                {title: '性别', templet: '#user-sex',align:'center'},
                {field: 'age', title: '年龄',align:'center'},
                {field: 'email', title: '邮箱', minWidth: 180,align:'center'},
                {field: 'nation', title: '国籍',align:'center'},
                {field: 'hobby', title: '爱好', align:'center'},
                {field: 'introduction', title: '自我介绍', minWidth: 165,align:'center'},
                {field: 'registerTime', title: '注册时间', minWidth: 180, sort: true,align:'center'},
                {field: 'updateTime', title: '登录时间', minWidth: 180, sort: true,align:'center'},
            ]]
        });
    }

    function getQueryParams() {
        return {
            username: $searchForm.find('input[name="username"]').val().trim(),
            lockStatus: $searchForm.find("select[name='status']").val(),
            sex: $searchForm.find("select[name='sex']").val(),
            // mobile: $searchForm.find("input[name='mobile']").val().trim(),
            // deptId: $searchForm.find("input[name='dept']").val().trim()
        };
    }



    //对外暴露的接口
    exports('appuser/user', {});
});
