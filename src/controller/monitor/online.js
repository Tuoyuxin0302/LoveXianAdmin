layui.define(['jquery', 'form', 'table', 'lovexian','baseSetting','admin'], function (exports) {
    var $ = layui.jquery,
        setter = layui.setter,
        laydate = layui.laydate,
        admin = layui.admin,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        lovexian = layui.lovexian,
        form = layui.form,
        table = layui.table,
        $view = $('#lovexian-online'),
        $query = $view.find('#query'),
        $reset = $view.find('#reset'),
        $searchForm = $view.find('form'),
        tableIns;

    form.render();

    initTable();

    table.on('tool(onlineTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'del') {
            lovexian.modal.confirm('踢出用户', '确定将该用户踢出？', function () {
                if (data.current) {
                    $.get(proPath + '/system/logout/'+data.id, function () {
                        // window.location.reload();
                        admin.exit();
                    });
                } else {
                    lovexian.del(proPath + "/system/login/kickout/" + data.id, null, function () {
                        lovexian.alert.success('踢出用户成功');
                        $query.click();
                    });
                }
            });
        }
    });

    $query.on('click', function () {
        tableIns.reload({where: getQueryParams()});
    });

    $reset.on('click', function () {
        $searchForm[0].reset();
        tableIns.reload({where: getQueryParams()});
    });

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $view.find('table'),
            id: 'onlineTable',
            url: proPath + '/system/login/online',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            page: false,
            cols: [[
                {title: '用户名', templet: '#online-username', minWidth: 180},
                {field: 'loginTime', title: '登录时间', minWidth: 180},
                // {field: 'lastAccessTime', title: '最后访问时间', minWidth: 180},
                {field: 'ip', title: 'IP地址', minWidth: 165},
                {field: 'loginAddress', title: '登录地点', minWidth: 180},
                // {title: '状态', templet: '#online-status'},
                {title: '操作', toolbar: '#online-option'}
            ]],
            done: function (r) {
                $view.find('span#count').html('当前共<strong> ' + r.count + ' </strong>人在线')
                    .parents('div.lovexian-hide').show();
            }
        });
    }

    function getQueryParams() {
        return {
            username: $searchForm.find('input[name="username"]').val().trim()
        };
    }

    //对外暴露的接口
    exports('monitor/online', {});
});