layui.define(['dropdown', 'jquery', 'validate', 'lovexian', 'form', 'eleTree','laytpl','baseSetting','laytpl'], function (exports) {
    var $ = layui.jquery,
        lovexian = layui.lovexian,
        form = layui.form,
        validate = layui.validate,
        eleTree = layui.eleTree,
        dropdown = layui.dropdown,
        $view = $('#lovexian-dept'),
        laytpl = layui.laytpl,
        setter = layui.setter,
        lovexianresponse = setter.response,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $submit = $view.find('#submit'),
        $header = $view.find('#form-header'),
        $searchForm = $view.find('#dept-table-form'),
        $deptName = $searchForm.find('input[name="deptName"]'),
        _currentDeptData,
        _deptTree;

    form.verify(validate);
    form.render();

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    renderDeptTree();

    eleTree.on("nodeClick(deptTree)", function (d) {
        $header.text('修改部门');
        var data = d.data.currentData.data;
        _currentDeptData = data;
        form.val("dept-form", {
            "deptName": data.deptName,
            "orderNum": data.orderNum,
            "createTime": data.createTime,
            "parentId": data.parentId,
            "deptId": data.deptId
        });
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            if (name === 'add') {
                reset();
                var selected = _deptTree.getChecked(false, true);
                if (selected.length > 1) {
                    lovexian.alert.warn('只能选择一个节点作为父级！');
                    return;
                }
                form.val("dept-form", {
                    "parentId": selected[0] ? selected[0].id : ''
                });
            }
            if (name === 'delete') {
                var checked = _deptTree.getChecked(false, true);
                if (checked.length < 1) {
                    lovexian.alert.warn('请勾选需要删除的部门');
                    return;
                }
                var deptIds = [];
                layui.each(checked, function (key, item) {
                    deptIds.push(item.id)
                });
                lovexian.modal.confirm('提示', '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！', function () {
                    lovexian.del(proPath + '/system/dept/' + deptIds.join(','), null, function () {
                        lovexian.alert.success('删除成功！');
                        reloadDeptTree();
                        reset();
                    })
                });
            }
            if (name === 'export') {
                lovexian.download(proPath + '/system/dept/excel', getQueryParams(), '部门信息表.xlsx');
            }
        },
        options: [{
            name: 'add',
            title: '新增部门',
            perms: 'dept:add'
        }, {
            name: 'delete',
            title: '删除部门',
            perms: 'dept:delete'
        }, {
            name: 'export',
            title: '导出Excel',
            perms: 'dept:export'
        }]
    });

    $view.on('click', '#submit', function () {
        $view.find('#submit-form').trigger('click');
    });

    $reset.on('click', function () {
        $deptName.val('');
        reloadDeptTree();
        reset();
    });

    $query.on('click', function () {
        reloadDeptTree();
    });

    function getQueryParams() {
        return {
            "deptName": $deptName.val().trim()
        }
    }

    function reset() {
        $header.text('新增部门');
        $view.find('#reset-form').trigger('click');
    }

    function renderDeptTree() {
        _deptTree = eleTree.render({
            elem: '.dept-tree',
            url: proPath + '/system/dept/tree',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            accordion: true,
            highlightCurrent: true,
            showCheckbox: true,
            checkStrictly: true,
            renderAfterExpand: false,
            where: {
                "deptName": $deptName.val().trim(),
            },
            request: {
                name: 'name',
                key: "id",
                checked: "checked",
                data: 'data'
            },
            response: {
                statusName: "code",
                statusCode: 200,
                dataName: "data"
            },
            done: function(res){
                if(res.code == lovexianresponse.statusCode.logout){
                    lovexian.modal.confirm('登录状态', '登录状态已失效，请退出系统重新登录', function () {
                        layer.msg('即将退出...', {
                            time: 2000 //2秒关闭（如果不配置，默认是3秒）
                        }, function(index){
                            layer.close(index);
                            layui.admin.exit();
                        });
                    }, function () {

                    });
                }

                if(res.code == lovexianresponse.statusCode.elselogin){
                    lovexian.modal.confirm('登录状态', '由于您的账号在其他地方登录了！此会话已失效', function () {
                        layer.msg('即将退出...', {
                            time: 2000 //2秒关闭（如果不配置，默认是3秒）
                        }, function(index){
                            layer.close(index);
                            layui.admin.exit();
                        });
                    }, function () {

                    });
                }
            }
        });
        return _deptTree;
    }

    function reloadDeptTree() {
        _deptTree = renderDeptTree();
    }

    form.on('submit(dept-form-submit)', function (data) {
        if (data.field.deptId && $header.text().indexOf('修改') !== -1) {
            if (lovexian.nativeEqual(data.field, _currentDeptData)) {
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
            lovexian.put(proPath + '/system/dept', data.field, function () {
                lovexian.alert.success('修改成功');
                reloadDeptTree();
                reset();
            })
        } else {
            lovexian.post(proPath + '/system/dept', data.field, function () {
                lovexian.alert.success('新增成功');
                reloadDeptTree();
                reset();
            })
        }
        return false;
    });
    //对外暴露的接口
    exports('systemadmin/dept', {});
});
