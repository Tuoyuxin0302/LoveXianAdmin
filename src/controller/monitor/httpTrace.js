layui.define(['jquery', 'table', 'lovexian', 'form','baseSetting'], function (exports) {
    var $ = layui.jquery,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        table = layui.table,
        setter = layui.setter,
        lovexian = layui.lovexian,
        $view = $('#lovexian-httptrace'),
        $searchForm = $view.find('form'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        form = layui.form,
        tableIns;

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
            page: false,
            id: 'httptraceTable',
            url: proPath + '/monitor/actuator/httptrace',
            headers: {
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {field: 'requestTime', title: '请求时间', minWidth: 180},
                {title: '请求方法', templet: "#httptrace-method"},
                {field: 'url', title: '请求URL', minWidth: 380},
                {title: '响应状态', templet: '#httptrace-status'},
                {title: '请求耗时', templet: '#httptrace-time'}
            ]],
            done: function (r) {
                $view.find('#count').text(r.count);
            }
        });
    }

    function getQueryParams() {
        return {
            method: $searchForm.find('select[name="method"]').val(),
            url: $searchForm.find('input[name="url"]').val().trim(),
            invalidate_ie_cache: new Date()
        };
    }
    //对外暴露的接口
    exports('monitor/httpTrace', {});
});