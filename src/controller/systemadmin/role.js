layui.define(['dropdown', 'jquery', 'laydate','baseSetting', 'lovexian', 'form', 'eleTree', 'table', 'validate','laytpl'], function (exports) {
    var $ = layui.jquery,
        setter = layui.setter,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        laydate = layui.laydate,
        lovexian = layui.lovexian,
        form = layui.form,
        laytpl = layui.laytpl,
        table = layui.table,
        eleTree = layui.eleTree,
        dropdown = layui.dropdown,
        validate = layui.validate,
        $view = $('#lovexian-role'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $submit = $view.find('#submit'),
        $searchForm = $view.find('#role-table-form'),
        $header = $view.find('#form-header'),
        tableIns;

    form.verify(validate);
    form.render();

    initTable();

    laydate.render({
        elem: '#createTime',
        range: true
    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    var menuTree = eleTree.render({
        elem: '.menu-tree',
        url: proPath + '/system/menu/tree',
        headers:{
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        showCheckbox: true,
        accordion: true,
        checkStrictly: true,
        renderAfterExpand: false,
        request: {
            name: "title",
            key: "id",
            children: "list",
            checked: "checked",
            data: "data"
        },
        response: {
            statusName: "code",
            statusCode: 200,
            dataName: "data"
        }
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('roleTable');
            if (name === 'add') {
                resetRoleForm();
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的角色');
                } else {
                    lovexian.modal.confirm('删除角色', '确定删除所选角色？', function () {
                        var roleIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            roleIds.push(item.roleId);
                        });
                        deleteRoles(roleIds.join(','));
                    });
                }
            }
            if (name === 'export') {
                var params = getQueryParams();
                params.pageSize = $view.find(".layui-laypage-limits option:selected").val();
                params.pageNum = $view.find(".layui-laypage-em").next().html();
                lovexian.download(proPath + '/system/role/excel', params, '角色信息表.xlsx');
            }
        },
        options: [{
            name: 'add',
            title: '新增角色',
            perms: 'role:add'
        }, {
            name: 'delete',
            title: '删除角色',
            perms: 'role:delete'
        }, {
            name: 'export',
            title: '导出Excel',
            perms: 'role:export'
        }]
    });

    table.on('tool(roleTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'edit') {
            $header.text('修改角色');
            form.val("role-form", {
                "roleId": data.roleId,
                "roleName": data.roleName,
                "remark": data.remark
            });
            if (data.menuId) {
                menuTree.setChecked(data.menuId.split(','), true);
            } else {
                menuTree.setChecked([], true);
            }
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除角色', '确定删除该角色？', function () {
                deleteRoles(data.roleId);
            });
        }
    });

    $query.on('click', function () {
        resetRoleForm();
        tableIns.reload({where: getQueryParams(), page: {curr: 1}});
    });

    $reset.on('click', function () {
        resetRoleForm();
        $searchForm[0].reset();
        tableIns.reload({where: getQueryParams(), page: {curr: 1}});
    });

    $submit.on('click', function () {
        $view.find('#submit-form').trigger('click');
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'roleTable',
            url: proPath + '/system/role/listAndMenu',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'roleName', title: '角色名称', minWidth: 120},
                {field: 'remark', title: '角色描述'},
                {field: 'createTime', title: '创建时间', minWidth: 180},
                {title: '操作', toolbar: '#role-option', width: 100}
            ]]
        });
    }

    function getQueryParams() {
        return {
            roleName: $searchForm.find('input[name="roleName"]').val().trim(),
            invalidate_ie_cache: new Date()
        };
    }

    function resetRoleForm() {
        $view.find('#reset-form').trigger('click');
        $header.text('新增角色');
        menuTree.setChecked([], true);
        menuTree.unExpandAll();
    }

    form.on('submit(role-form-submit)', function (data) {
        var selected = menuTree.getChecked(false, true);
        var menuId = [];
        layui.each(selected, function (key, item) {
            menuId.push(item.id)
        });
        data.field.menuId = menuId.join(',');
        if (!menuId.length) {
            lovexian.modal.confirm('提示', '当前角色未授予任何权限，是否继续？', function () {
                addOrUpdateRole(data.field);
            });
        } else {
            addOrUpdateRole(data.field);
        }
        return false;
    });

    function deleteRoles(roleIds) {
        lovexian.del(proPath + '/system/role/delete/' + roleIds, null, function () {
            lovexian.alert.success('删除角色成功');
            $query.trigger('click');
        })
    }

    var addOrUpdateRole = function (data) {
        if (data.roleId && $header.text() === '修改角色') {
            console.log(data);
            lovexian.put(proPath + '/system/role', data, function () {
                lovexian.alert.success('修改角色成功');
                $query.trigger('click');
            });
        } else {
            lovexian.post(proPath + '/system/role', data, function () {
                lovexian.alert.success('新增角色成功');
                $query.trigger('click');
            });
        }
    }

    //对外暴露的接口
    exports('systemadmin/role', {});
});
