layui.define(['jquery', 'form', 'table', 'lovexian', 'laydate','baseSetting'], function (exports) {
    var $ = layui.jquery,
        form = layui.form,
        table = layui.table,
        setter = layui.setter,
        lovexian = layui.lovexian,
        laydate = layui.laydate,
        $view = $('#lovexian-generator'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $searchForm = $view.find('form'),
        tableIns,
        proPath = layui.baseSetting.LoveXianConfig.proApi;

    laydate.render({
        elem: '#createTime',
        range: true
    });

    form.render();
    initTable();

    $query.on('click', function () {
        tableIns.reload({where: getQueryParams(), page: {curr: 1}});
    });

    $reset.on('click', function () {
        $searchForm[0].reset();
        tableIns.reload({where: getQueryParams(), page: {curr: 1}});
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'configureTable',
            url: proPath + '/generator/tables/info',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                // {type: 'checkbox'},
                {field: 'name', title: '表名',align:'center'},
                {field: 'remark', title: '备注',align:'center'},
                {field: 'dataRows', title: '数据量（行）',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180,align:'center'},
                {field: 'updateTime', title: '修改时间', minWidth: 180,align:'center'},
                {title: '操作', toolbar: '#generator-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    function getQueryParams() {
        return {
            dataSourceType: $searchForm.find("select[name='dataSourceType']").val().trim(),
            tableName: $searchForm.find("input[name='tableName']").val().trim()
        };
    }

    table.on('tool(configureTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'generate') {
            lovexian.modal.confirm('代码生成', '确定生成数据表<strong> ' + data.name + ' </strong>对应的前后端代码？', function () {
                lovexian.download(proPath + '/generator', data, data.name + '_code.zip');
            });
        }
    });

    //对外暴露的接口
    exports('develop/generator', {});
});