
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        view = layui.view,

        $view = $('#lovexian-law-check'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        dropdown = layui.dropdown,
        form = layui.form,
        table = layui.table,
        router = layui.router(),
        search = router.search,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        element = layui.element,
        pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query = $view.find('div[name="query"]');
    $reset = $view.find('div[name="reset"]'),

        form.render();

    initTable();
    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.on('tab(lawCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('lawCheckId',{key:'lawCheckTypeId',value:idvalue});
        initTable();
    });


    element.tabChange('lawCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#lawCheckInfoTable'),
            id: 'lawCheckInfoTable',
            url: proPath + '/admin/lawCheck/selectCheckByType?languageType=1&lawTypeId=1',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'lawTitle', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#lawCheck-option', minWidth: 140,align:'center'}
            ]]
        });
    }


    table.on('tool(lawCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/lawCheck/checkHistory",{"lawId":data.lawId},function (res) {
                if(res.status == '200'){
                    admin.popup({
                        id: 'LAY-theme-action-check',
                        area:['400px','80%'],
                        shadeClose:false,
                        shade:0,
                        title: '审核历史',
                        success: function () {
                            view(this.id).render('common/checkHistory',{
                                history: res.data,
                            }).then(function () {
                                //视图文件请求完毕，视图内容渲染前的回调
                            }).done(function () {
                                //视图文件请求完毕和内容渲染完毕的回调
                            });
                        }
                    });
                }else {
                    lovexian.alert.error("获取审核历史信息失败！");
                }
            });
        }
        if (layEvent === 'edit') {
            checkLawInfo(data);
        }
    });
    function checkLawInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }
        lovexian.popup("theme/life/lawCheckDetail","审核文章",data,function () {
                console.log(data)
                form.val("lawCheckDetail",{
                    "lawTitle":data.lawTitle,
                    "lawSubtitle":data.lawSubtitle,
                    "lawAbstract":data.lawAbstract,
                });
                data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);
                $('.thumbImg').attr("src",data.headImage);
                layui.use('theme/life/lawCheckDetail', layui.factory('theme/life/lawCheckDetail'));
            },
            function () {
                $query.click();
            });
    }
    function deleteActions(actionIds) {
        lovexian.del(proPath + '/api/lawInfo/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除法律条文信息成功');
            $query.click();
        });
    }

    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.lawTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = "西安外事办";
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.lawContent;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);
        }
    }

    function getQueryParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            lawTitle: $searchForm.find('input[name="lawTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='state']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }


    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        initTable();
    });

    //对外暴露的接口
    exports('theme/life/lawCheck', {});
});