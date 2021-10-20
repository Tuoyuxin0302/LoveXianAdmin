
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

    element.on('tab(folkCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('folkCheckId',{key:'folkCheckTypeId',value:idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
    });


    element.tabChange('folkCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#folkCheckInfoTable'+layui.data('folkCheckId').folkCheckTypeId),
            id: 'folkCheckInfoTable'+layui.data('folkCheckId').folkCheckTypeId,
            url: proPath + '/admin/folkCheck/list',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'folkloreTitle', title: '民俗标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#folk-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    table.on('tool(folkCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/folkCheck/checkhistory",{"actionId":data.folkId},function (res) {
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
            checkfolkInfo(data);
        }
    });

    function checkfolkInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
                layer.close(index);
            }); //弹出时间，图标，特效
            return ;
        }
        lovexian.popup("theme/culture/checkFolkInfo","审核文章",data,function () {
                console.log(data)
                form.val("actionCheckDetail",{
                    "folkloreTitle":data.folkloreTitle,
                    "subTitle":data.folkloreSubtitle,
                    "abstract":data.folkloreAbstract,
                });
                data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);
                $('.thumbImg').attr("src",data.headImage);
                layui.use('theme/culture/folk/checkFolkInfo', layui.factory('theme/culture/folk/checkFolkInfo'));
            },
            function () {
                $reset.click();
            });
    }
    function getQueryParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();

        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            folkloreTitle: $searchForm.find('input[name="folkTitle"]').val().trim(),
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
        initTable();
        $("#folk-table-form")[0].reset();
    });
    //对外暴露的接口
    exports('theme/culture/folk/folkCheckInfo', {});
})