layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-news-check'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        dropdown = layui.dropdown,
        form = layui.form,
        view = layui.view,
        table = layui.table,
        router = layui.router(),
        search = router.search,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        element = layui.element,
        pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        pre_phone = $("#previewPhone");
        $searchForm = $view.find('form');
        $query = $searchForm.find('div[name="query"]');
        $reset = $searchForm.find('div[name="reset"]');

        form.render();

    initTable();
    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });

    initTable();

    element.tabChange('newsCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#newsCheckInfoTable'),
            id: 'newsCheckInfoTable',
            url: proPath + '/admin/newsCheck/list',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'newsTitle', title: '新闻标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {title: '新闻类别', templet: '#news-type', align:'center'},
                {field: 'updateTime', title: '更新时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#news-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    table.on('tool(newsCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/newsCheck/checkhistory",{"newsId":data.newsId},function (res) {
                if(res.status == '200'){
                    admin.popup({
                        id: 'LAY-theme-action-check',
                        area:['400px','80%'],
                        shadeClose:false,
                        shade:0,
                        title: '审核历史',
                        success: function(){
                            view(this.id).render('common/checkHistory', {
                                history: res.data,
                            }).then(function(){
                                //视图文件请求完毕，视图内容渲染前的回调
                            }).done(function(){
                                //视图文件请求完毕和内容渲染完毕的回调
                            });
                        }
                    });
                }else{
                    lovexian.alert.error("获取审核历史信息失败！");
                }
            });
        }
        if (layEvent === 'edit') {
            checkNewsInfo(data);
        }
    });




    function checkNewsInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }

        lovexian.popup("news/newsInfoCheck","新闻审核", data,function () {
            //编辑文章的回显操作
            form.val('newsCheckDetail',{
                'newsTitle':data.newsTitle,
                'newsAbstract':data.newsAbstract
            });
            data.isTop==0?$('input[name="isTop"]').attr('checked', null):"";
            $("input[name='openness'][value="+data.isShow+"]").prop("checked",true);
            $('.thumbImg').attr("src",data.newsHeadPhoto);
            layui.use('news/newsInfoCheck', layui.factory('news/newsInfoCheck'));
        },
        function () {
            // $reset.click();
        });
    }

    function QueryTable() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        params = {
            newsTitle: $searchForm.find('input[name="newsTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
        tableQuery = lovexian.table.init({
            elem: $('#newsCheckInfoTable'),
            id: 'newsCheckInfoTable',
            url: proPath + '/admin/newsCheck/list',
            type:'GET',
            where:params,
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'newsTitle', title: '新闻标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {title: '新闻类别', templet: '#news-type', align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#news-option', minWidth: 140,align:'center'}
            ]]
        });
    }


    $query.on('click',function () {
        QueryTable();
    });

    $reset.on('click',function () {
        initTable();
    });

    //对外暴露的接口
    exports('news/newsCheck', {});
});