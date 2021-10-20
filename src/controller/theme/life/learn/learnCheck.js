
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        view = layui.view,
        $view = $('#lovexian-activity-check'),
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

    element.on('tab(learnCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('learnCheckId',{key:'learnCheckTypeId',value:idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
    });


    element.tabChange('learnCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#learnCheckInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'learnCheckInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id"),
            url: proPath + '/admin/learnCheck/selectCheckByType?learnTypeId='+$(".layui-tab-title .layui-this").attr("lay-id"),
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'learnTitle', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#learn-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    table.on('tool(learnCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/learnCheck/checkhistory",{"actionId":data.learnId},function (res) {
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
            checklearnInfo(data);
        }
    });

    function checklearnInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
                layer.close(index);
            }); //弹出时间，图标，特效
            return ;
        }
        lovexian.popup("theme/life/learnCheck","审核文章",data,function () {
                console.log(data)
                form.val("actionCheckDetail",{
                    "actionTitle":data.learnTitle,
                    "subTitle":data.learnSubtitle,
                    "abstract":data.learnAbstract,
                });
                data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);
                $('.thumbImg').attr("src",data.headImage);
                layui.use('theme/life/learn/studyCheck', layui.factory('theme/life/learn/actionCheck'));
            },
            function () {
                $reset.click();
            });
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
            learnTitle: $searchForm.find('input[name="learnTitle"]').val(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }


    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        $("#learn-table-form")[0].reset();
        initTable();
    });
    //对外暴露的接口
    exports('theme/life/learn/learnCheck', {});
})