layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl', 'upload'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        adminView = layui.view,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-culture'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        dropdown = layui.dropdown,
        form = layui.form,
        table = layui.table,
        router = layui.router(),
        search = router.search,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        tableIns,
        element = layui.element,
        pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        upload = layui.upload,
        validate = layui.validate;
    //表单校验
    form.verify(validate);
    form.render();
    pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query = $searchForm.find("div[name='query']");
    $reset = $searchForm.find("div[name='reset']");

    form.render();
    var placeTypeId;
    element.on('tab(placeTab)', function (data) {
        var idvalue = data.index + 1;//从0开始
        layui.data('id', {key: 'placeTypeId', value: idvalue});
        $searchForm.find('input[name="actTitle"]').val("");
        if (layui.data('id').placeTypeId == 1) {
            initTable();
        } else if (layui.data('id').placeTypeId == 2) {
            initTable2();
        } else if (layui.data('id').placeTypeId == 3) {
            initTable3();
        } else {
            initTable4();
        }
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

    element.tabChange('placeTab', 1);


    //格式化时间
    function filterTime(val) {
        if (val < 10) {
            return "0" + val;
        } else {
            return val;
        }
    }


    //退出
    $(document).on('click', '#close', function () {
        layer.close(layer.index);
    });

    //显示数据 活跃用户
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable' + layui.data('id').placeTypeId),
            id: 'actionInfoTable' + layui.data('id').placeTypeId,
            url: proPath + '/admin/cellUser/active',
            //url: proPath + '/admin/placeInfo/listByTypeId?languageType=1&placeType='+layui.data('id').placeTypeId,
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'deviceId', title: '设备id', minWidth: 150, align: "left"},
                // {field: 'username', title: '用户名称', minWidth: 200, align: "left"},
                {
                    field: 'username', title: '用户名称', templet: function (data) {
                        if (data.name == null) {
                            return '无用户名'
                        } else {
                            return data.name;
                        }

                    }, minWidth: 200, align: "left"
                },

                {field: 'visitTime', title: '访问时间', minWidth: 200, align: "left"},

            ]],
        });
    }

    //显示数据 登录用户
    function initTable2() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable' + layui.data('id').placeTypeId),
            id: 'actionInfoTable' + layui.data('id').placeTypeId,
            url: proPath + '/admin/cellUser/login',
            //url: proPath + '/admin/placeInfo/listByTypeId?languageType=1&placeType='+layui.data('id').placeTypeId,
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'deviceId', title: '设备id', minWidth: 150, align: "left"},
                // {title: '用户名称', templet: '#user-name', align: "left"},
                {
                    field: 'username', title: '用户名称', templet: function (data) {
                        if (data.name == null) {
                            return '无用户名'
                        } else {
                            return data.name;
                        }

                    }, minWidth: 200, align: "left"
                },
                {field: 'updateTime', title: '最近登录时间', minWidth: 200, align: "left"},
                {field: 'logoutTime', title: '退出登录时间', minWidth: 200, align: "left"},
                {field: 'visitTime', title: '访问时间', minWidth: 200, align: "left"},
            ]],
        });
    }

    //显示数据 注册用户
    function initTable3() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable' + layui.data('id').placeTypeId),
            id: 'actionInfoTable' + layui.data('id').placeTypeId,
            url: proPath + '/admin/cellUser/register',
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'deviceId', title: '设备id', minWidth: 150, align: "left"},
                {
                    field: 'username', title: '用户名称', templet: function (data) {
                        if (data.name == null) {
                            return '无用户名'
                        } else {
                            return data.name;
                        }

                    }, minWidth: 200, align: "left"
                },
                {field: 'visitTime', title: '访问时间', minWidth: 200, align: "left"},
            ]],
        });
    }

    //显示数据 下载用户
    function initTable4() {
        tableIns = lovexian.table.init({
            elem: $('#actionInfoTable' + layui.data('id').placeTypeId),
            id: 'actionInfoTable' + layui.data('id').placeTypeId,
            url: proPath + '/admin/cellUser/download',
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'deviceId', title: '设备id', minWidth: 150, align: "left"},
                {
                    field: 'username', title: '用户名称', templet: function (data) {
                        if (data.name == null) {
                            return '无用户名'
                        } else {
                            return data.name;
                        }

                    }, minWidth: 200, align: "left"
                },
                {
                    field: 'registerTime', title: '访问时间', templet: function (data) {
                        if (data.visitTime == null) {
                            return '未注册'
                        } else {
                            return data.visitTime;
                        }

                    }, minWidth: 200, align: "left"
                },
            ]],
        });
    }

    function getQueryParams() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        // alert(createTimeFrom);
        // alert(createTimeTo);
        return {
            placeName: $searchForm.find('input[name="placeName"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }

    $query.on('click', function () {
        var params = getQueryParams();
        tableIns.reload({where: params});
    });

    $reset.on('click', function () {
        if (placeTypeId = 1) {
            initTable();
        } else if (placeTypeId = 2) {
            initTable2();
        } else if (placeTypeId = 3) {
            initTable3();
        } else {
            initTable4();
        }
    });

    // 监听显示不显示
    // form.on('switch(switchShow)', function (data) {
    //     var path=proPath+"/admin/placeInfo/updatePlace";
    //     var id=$(data.elem).val();
    //     var text = data.elem.checked ? '展示':'不展示';
    //     layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
    //             lovexian.post(path,{"isShow":text==='展示'? 1:0,"id":id},function(res){
    //                 if(res.code == 200){
    //                     layer.alert('【'+text+'】成功^_^', {
    //                         icon: 1,
    //                         skin: 'layui-layer-molv'
    //                     });
    //                 }else{
    //                     layer.alert('【'+text+'】失败~_~', {
    //                         icon: 2,
    //                         skin: 'layui-layer-hong'
    //                     });
    //                     if(text === '展示')
    //                         data.elem.checked = true;
    //                     else
    //                         data.elem.checked = false;
    //                 }
    //                 form.render();
    //             });
    //             layer.close(index);
    //         },function (index) {
    //             if(text==="展示"){
    //                 data.elem.checked = false;
    //             }else{
    //                 data.elem.checked = true;
    //             }
    //             form.render();
    //             layer.close(index);
    //         }
    //     );
    // });

    //对外暴露的接口
    exports('activeUser/activeUser', {});
});


