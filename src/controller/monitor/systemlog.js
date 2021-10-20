layui.define(['jquery', 'laydate', 'form', 'table', 'lovexian', 'dropdown','baseSetting','laytpl'], function (exports) {
    var $ = layui.jquery,
        laydate = layui.laydate,
        setter = layui.setter,
        lovexian = layui.lovexian,
        form = layui.form,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        table = layui.table,
        dropdown = layui.dropdown,
        laytpl = layui.laytpl,
        $view = $('#lovexian-log'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $delete = $view.find('#delete'),
        $searchForm = $view.find('form'),
        sortObject = {field: 'time', type: null},
        tableIns;

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });

    form.render();
    initTable();

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            if (name === 'delete') {
                var checkStatus = table.checkStatus('logTable');
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请勾选需要删除的日志');
                } else {
                    lovexian.modal.confirm('删除日志', '确定删除所选日志？', function () {
                        var logIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            logIds.push(item.id)
                        });
                        deleteLogs(logIds.join(','))
                    });
                }
            }
            if (name === 'export') {
                var params = $.extend(getQueryParams(), {field: sortObject.field, order: sortObject.type});
                params.pageSize = $view.find(".layui-laypage-limits option:selected").val();
                params.pageNum = $view.find(".layui-laypage-em").next().html();
                lovexian.download(proPath + '/system/log/excel', params, '系统日志表.xlsx');
            }
        },
        options: [{
            name: 'delete',
            title: '删除日志',
            perms: 'log:delete'
        }, {
            name: 'export',
            title: '导出Excel',
            perms: 'log:export'
        }]
    });

    table.on('tool(logTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除日志', '确定删除该条系统日志？', function () {
                deleteLogs(data.id);
            });
        }
    });

    table.on('sort(logTable)', function (obj) {
        sortObject = obj;
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
        sortObject.type = 'null';
        tableIns.reload({where: getQueryParams(), page: {curr: 1}, initSort: sortObject});
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'logTable',
            url: proPath + '/system/log/list',
            headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'username', title: '操作人'},
                {field: 'operContent', title: '操作描述'},
                {field: 'operTime', title: '耗时', templet: "#log-time", sort: true},
                {field: 'operMethod', title: '操作方法'},
                {field: 'operParams', title: '方法参数'},
                {field: 'ip', title: 'IP地址'},
                {field: 'location', title: '操作地点'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true},
                {title: '操作', toolbar: '#log-option'}
            ]]
        });
    }

    function deleteLogs(logIds) {
        lovexian.del(proPath + '/system/log/delete/' + logIds, null, function () {
            lovexian.alert.success('删除系统日志成功');
            $query.click();
        });
    }

    function getQueryParams() {
        var createTimeFrom,
            createTimeTo,
            createTime = $searchForm.find('input[name="createTime"]').val();
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            username: $searchForm.find('input[name="username"]').val().trim(),
            operContent: $searchForm.find('input[name="operation"]').val().trim(),
            invalidate_ie_cache: new Date()
        };
    }
    //对外暴露的接口
    exports('monitor/systemlog', {});
});