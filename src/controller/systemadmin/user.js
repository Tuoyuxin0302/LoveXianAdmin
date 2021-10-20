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
        $updateView = $('#user-update');

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

                layer.open({
                    type: 2,
                    title:['新增管理员','font-size:16px;color:#08132b;line-height:46px;padding-bottom:0;border-bottom:1px solid #fcfcfc;background-color:#fcfcfc'],
                    offset: '100px',
                    resize:false,
                    content: '#/systemadmin/user/userAdd',
                    btn: ['提交', '重置'],
                    area: ['957px','636px'],
                    end:function() {
                    },
                    yes: function (index, layero) {
                        layer.getChildFrame('#submit',index).click();
                        $query.click();
                    },
                    btn2: function (index, layero) {
                        layer.getChildFrame('#reset',index).click();
                        return false;
                    }
                });

            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的用户');
                } else {
                    lovexian.modal.confirm('删除用户', '确定删除该用户？', function () {
                        var userIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            userIds.push(item.userId)
                        });
                        deleteUsers(userIds.join(','));
                    });
                }
            }
            if (name === 'reset') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要重置密码的用户');
                } else {
                    var usernames = [];
                    layui.each(checkStatus.data, function (key, item) {
                        usernames.push(item.username)
                    });
                    lovexian.put(proPath + '/system/admin/password/reset?usernames=' + usernames.join(','), null, function () {
                        lovexian.alert.success('所选用户密码已重置为1234qwer');
                    });
                }
            }
            if (name === 'export') {
                var params = $.extend(getQueryParams(), {field: sortObject.field, order: sortObject.type});
                params.pageSize = $view.find(".layui-laypage-limits option:selected").val();
                params.pageNum = $view.find(".layui-laypage-em").next().html();
                lovexian.download(proPath + '/system/admin/excel', params, '用户信息表.xlsx');
            }
        },
        options: [{
            name: 'add',
            title: '新增用户',
            perms: 'user:add'
        }, {
            name: 'delete',
            title: '删除用户',
            perms: 'user:delete'
        }, {
            name: 'reset',
            title: '密码重置',
            perms: 'user:reset'
        }, {
            name: 'export',
            title: '导出Excel',
            perms: 'user:export'
        }]
    });

    treeSelect.render({
        elem: $updateView.find('#user-update-dept'),
        type: 'get',
        data: proPath + '/system/dept/select/tree',
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        placeholder: '请选择',
        search: false,
        success: function () {
            treeSelect.checkNode('user-update-dept', layui.data(layui.setter.tableName)[layui.setter.USERNAME].deptId);
        }
    });

    formSelects.config('user-update-role', {
        searchUrl: proPath + '/system/role/list',
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

    table.on('tool(userTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'detail') {
            layer.open({
                type: 1,
                title: '管理员信息',
                shade: false,
                skin: 'layui-layer-admin-page',
                resize: false,
                area: $(window).width() <= 750 ? '95%' : '660px',
                zIndex: 123456,
                content: $('#lovexian-user-detail'),
                success: function (index, layero) {
                    //初始化表单，用于回显
                    admin.req({
                        url: proPath+'/system/admin/'+data.username //实际使用请改成服务端真实接口
                        ,type : 'GET'
                        ,error:function(err){
                            layer.msg(err.responseJSON.message, {
                                offset: '15px'
                                ,icon: 2
                            });
                        }
                        ,done: function(res){
                            $avatarValue.attr("src", "../src/style/images/avatar/"+res.data.avatar);
                            $nameValue.html(res.data.username);
                            $rolesValue.html(res.data.roleName);
                            $deptnameValue.html(res.data.deptName);
                            $sexValue.html(res.data.sex === '0'?'男':res.data.sex === '1'?'女':'保密');
                            $mobileValue.html(res.data.mobile);
                            $emailValue.html(res.data.email);
                            $descriptionValue.html(res.data.description);
                            $lastLoginTimeValue.html(res.data.lastLoginTime);
                        }
                    });
                },
		end: function () {
                    $('#lovexian-user-detail').css("display","none");
                }
            });
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除管理员', '确定删除该用户？', function () {
                deleteUsers(data.userId);
            });
        }
        if (layEvent === 'edit') {
            var user = null;
            layer.open({
                type: 1,
                title: ['修改管理员','font-size:16px;color:#08132b;line-height:46px;padding-bottom:0;border-bottom:1px solid #fcfcfc;background-color:#fcfcfc'],
                shade: false,
                skin: 'layui-layer-admin-page',
                resize: false,
                // maxmin: true,
                shadeClose: false,
                area: $(window).width() <= 750 ? '90%' : '50%',
                zIndex: 1234567,
                content: $('#user-update'),
                btn: ['提交', '取消'],
                yes : function(index,layero){
                    var data = form.val("user-update-form");
                    if (lovexian.nativeEqual(data, user)) {
                        console.log('data is not change...');
                        lovexian.alert.warn('数据未作任何修改！');
                        return false;
                    }
                    lovexian.put(proPath + '/system/admin', data, function () {
                        layer.closeAll();
                        lovexian.alert.success(user.username + ' 用户数据修改成功');
                        $query.click();
                    });
                },
                success: function (index, layero) {
                    form.verify(validate);
                    //初始化表单，用于回显
                    admin.req({
                        url: proPath+'/system/admin/'+data.username //实际使用请改成服务端真实接口
                        ,type : 'GET'
                        ,done: function(res){
                            lovexian.validateLoginStatus(res);
                            user = res.data;
                            form.val("user-update-form", {
                                "username": user.username,
                                "mobile": user.mobile,
                                "email": user.email,
                                "lockStatus": user.lockStatus,
                                "sex": user.sex,
                                "description": user.description,
                                "userId": user.userId
                            });
                            user = form.val("user-update-form");
                        }
                    });
                },
		end: function () {
                    $('#user-update').css("display","none");
                }
            });

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
        treeSelect.revokeNode('dept');
        sortObject.type = 'null';
        tableIns.reload({where: getQueryParams(), page: {curr: 1}, initSort: sortObject});
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'userTable',
            url: proPath + '/system/admin/list',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'username', title: '用户名', minWidth: 100,align:'center'},
                {title: '性别', templet: '#user-sex',align:'center'},
                {field: 'deptName', title: '部门',align:'center'},
                {field: 'mobile', title: '手机', minWidth: 165,align:'center'},
                {field: 'email', title: '邮箱', minWidth: 180,align:'center'},
                {title: '状态', templet: '#user-status',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#user-option', minWidth: 140,align:'center'}
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
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            username: $searchForm.find('input[name="username"]').val().trim(),
            lockStatus: $searchForm.find("select[name='status']").val(),
            sex: $searchForm.find("select[name='sex']").val(),
            mobile: $searchForm.find("input[name='mobile']").val().trim(),
            deptId: $searchForm.find("input[name='dept']").val().trim()
        };
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
        lovexian.del(proPath + '/system/admin/' + userIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除用户成功');
            $query.click();
        });
    }


    //对外暴露的接口
    exports('systemadmin/user', {});
});
