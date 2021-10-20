layui.define(['dropdown', 'jquery', 'laydate', 'form', 'eleTree', 'validate','laytpl','baseSetting', 'lovexian'], function (exports) {
    var $ = layui.jquery,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        form = layui.form,
        validate = layui.validate,
        eleTree = layui.eleTree,
        dropdown = layui.dropdown,
        $view = $('#lovexian-menu'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $submit = $view.find('#submit'),
        setter = layui.setter,
        lovexianresponse = setter.response,
        $searchForm = $view.find('#menu-table-form'),
        $menuName = $searchForm.find('input[name="menuName"]'),
        $type = $view.find('input[type="radio"][name="type"]'),
        $icon = $view.find('input[name="icon"]'),
        $icon_parent = $icon.parents('.layui-form-item'),
        $url = $view.find('input[name="menuPath"]'),
        $url_parent = $url.parents('.layui-form-item'),
        $order = $view.find('input[name="orderNum"]'),
        $order_parent = $order.parents('.layui-form-item'),
        $header = $view.find('#form-header'),
        _currentMenuData,
        _selectNode,
        _menuTree,
        iconChoice = true,
        tableIns;

    form.verify(validate);
    form.render();

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    $("#clear").click(function(){
        $("input[name='icon']").val("");
        $(this).hide();
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            if (name === 'add') {

                reset();
                var selected = _menuTree.getChecked(false, true);
                console.log(selected);

                if (selected.length > 1) {
                    lovexian.alert.warn('只能选择一个节点作为父级！');
                    return;
                }
                if (selected[0] && selected[0].type === '1') {
                    lovexian.alert.warn('不能选择按钮作为父级！');
                    return;
                }
                form.val("menu-form", {
                    "parentId": selected[0] ? selected[0].id : ''
                });
            }
            if (name === 'delete') {
                var checked = _menuTree.getChecked(false, true);
                if (checked.length < 1) {
                    lovexian.alert.warn('请勾选需要删除的菜单或按钮');
                    return;
                }
                var menuIds = [];
                layui.each(checked, function (key, item) {
                    menuIds.push(item.id)
                });
                lovexian.modal.confirm('提示', '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！', function () {
                    lovexian.del(proPath + '/system/menu/' + menuIds.join(','), null, function () {
                        lovexian.alert.success('删除成功！');
                        reloadMenuTree();
                        reset();
                    })
                });
            }
            if (name === 'export') {
                lovexian.download(proPath + '/system/menu/excel', {
                    "menuName": $menuName.val().trim()
                }, '菜单信息表.xlsx');
            }
        },
        options: [{
            name: 'add',
            title: '新增',
            perms: 'menu:add'
        }, {
            name: 'delete',
            title: '删除',
            perms: 'menu:delete'
        }, {
            name: 'export',
            title: '导出Excel',
            perms: 'menu:export'
        }]
    });

    _menuTree = renderMenuTree();

    eleTree.on("nodeClick(menuTree)", function (d) {
        console.log("tete");

        var data = d.data.currentData.data;
        if (data.icon != null && data.icon.trim()!="") {
            $("#clear").show();
        }
        _currentMenuData = data;
        $type.attr("disabled", true);
        var type = data.menuType;
        handleTypeChange(type);
        if (type === '0') { // 菜单
            $header.text('修改菜单');
        } else { // 按钮
            $header.text('修改按钮');
        }
        form.val("menu-form", {
            "icon": data.icon,
            "menuPath": data.menuPath,
            "orderNum": data.orderNum,
            "menuType": data.menuType,
            "menuName": data.menuName,
            "perms": data.perms,
            "parentId": data.parentId,
            "menuId": data.menuId
        });
    });

    form.on("radio(menu-type)", function (data) {
        handleTypeChange(data.value);
    });

    $reset.on('click', function () {
        $menuName.val('');
        reloadMenuTree();
        reset();
    });

    $query.on('click', function () {
        reloadMenuTree();
        reset();
    });

    $submit.on('click', function () {
        $view.find('#submit-form').trigger('click');
    });

    $icon.focus(function () {
        if(iconChoice){
            iconChoice = false;
            layer.open({
                type: 2,
                title:['图标选择','font-size:16px;color:#08132b;line-height:46px;padding-bottom:0;border-bottom:1px solid #fcfcfc;background-color:#fcfcfc'],
                offset:'50px',
                resize:false,
                content: '#/systemadmin/menu/icon',
                btn: ['确定'],
                area: ['957px','636px'],
                end:function() {
                    iconChoice = true;
                },
                yes: function (index, layero) {
                    var icon = layer.getChildFrame('#lovexian-icon',index).find('.icon-active .icon-name').text();
                    if (icon) {
                        form.val("menu-form", {
                            "icon": 'layui-icon-' + icon
                        });
                        $("#clear").show();
                    } else {
                        form.val("menu-form", {
                            "icon": ''
                        });
                    }
                    iconChoice = true;
                    layer.closeAll();
                }
            });
        }
    });

    function reset() {
        $view.find('#reset-form').trigger('click');
        handleTypeChange('0');
        $type.removeAttr("disabled");
    }

    function renderMenuTree() {
        _menuTree = eleTree.render({
            elem: '.menuTree',
            url: proPath + '/system/menu/tree',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            where: {
                "menuName": $menuName.val().trim()
            },
            accordion: true,
            highlightCurrent: true,
            showCheckbox: true,
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
        return _menuTree;
    }

    function reloadMenuTree() {
        _menuTree = renderMenuTree();
    }

    var handleTypeChange = function (type) {
        form.val("menu-form", {
            "icon": '',
            "url": '',
            "orderNum": ''
        });
        if (type === '1') {
            $header.text('新增按钮');
            $icon_parent.hide();
            $url_parent.hide();
            $order_parent.hide();
        } else {
            $header.text('新增菜单');
            $icon_parent.show();
            $url_parent.show();
            $order_parent.show();
        }
    };

    form.on('submit(menu-form-submit)', function (data) {
        if (data.field.menuId && $header.text().indexOf('修改') !== -1) {
            if (lovexian.nativeEqual(data.field, _currentMenuData)) {
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
            lovexian.put(proPath + '/system/menu', data.field, function (res) {
                if(res.status == '200'){
                    lovexian.alert.success('修改成功');
                    reloadMenuTree();
                    reset();
                }else{
                    lovexian.alert.error('修改失败');
                }
            })
        } else {
            lovexian.post(proPath + '/system/menu', data.field, function (res) {
                if(res.status == '200'){
                    lovexian.alert.success('新增成功');
                    reloadMenuTree();
                    reset();
                }else{
                    lovexian.alert.error('新增失败');
                }
            })

        }
        return false;
    });

    //对外暴露的接口
    exports('systemadmin/menu', {});
});
