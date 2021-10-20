
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

    element.on('tab(organizationCheckTab)',function (data) {

        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
    });


    element.tabChange('organizationCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#organizationCheckInfoTable'+ $(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'organizationCheckInfoTable'+ $(".layui-tab-title .layui-this").attr("lay-id"),
            url: proPath + '/admin/organizationCheck/list?orgTypeId='+ $(".layui-tab-title .layui-this").attr("lay-id"),
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'orgName', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#organization-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    var checkId;
    var orgCheckId;
    table.on('tool(organizationCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        checkId=data.checkId;
        orgCheckId=data.orgCheckId;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/organizationCheck/checkhistory",{"actionId":data.orgCheckId},function (res) {
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
            checkorganizationInfo(data);
        }
    });
    function checkorganizationInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
                layer.close(index);
            }); //弹出时间，图标，特效
            return ;
        }
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        layer.open({
            title : "审核文章",
            type : 1,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content :$("#orgCheck"),
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero,index){
                setPrjectData(data);
            },
            end:function () {
                $("#orgCheck").css("display","none");
            }
        })
    }
    form.on("submit(checkProject)",function(data){

        var data = {
            refuseReason : $("#refuseReason").val(),  //拒绝理由
            checkState : data.field.checkState,//审核状态
            orgCheckId:orgCheckId,
            checkId: checkId
        };
        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/organizationCheck/check',data,function (res) {
            layer.closeAll();
            $reset.click();
            if(res.status == '200'){
                lovexian.alert.success('审核完成');
                return false;

            }else{
                lovexian.alert.error('保存失败:'+res.message);
            }
        });
    });
    function setPrjectData(data) {
        //console.log(data);
        form.val("orgCheck",{
                "orgName":data.orgName,
                "orgAddress":data.orgAddress,
                "orgIntroduce":data.orgIntroduce,
                "orgPhone":data.orgPhone,
                "locationName":data.locationName,
                "orgRoute":data.orgRoute,
            }
        );
        $("#headImage").attr('src',data.headImage);
        data.isTop==1? $("input[type='checkbox'][name='isTopCheck']").attr("checked",true):
            $("input[type='checkbox'][name='isTopCheck']").attr("checked",false);
        data.isShow==0 ? $("input[type='radio'][name='opennessCheck'][value='0']").attr("checked",true):
            $("input[type='radio'][name='opennessCheck'][value='1']").attr("checked",true);
        form.render();
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
            orgName: $searchForm.find('input[name="organizationTitle"]').val(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }
    form.on("radio(checkState)", function (data) {
        if (data.elem.title == "审核拒绝") {
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #checkState").attr("lay-verify", "required");
        } else {
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #checkState").removeAttr("lay-verify");
        }
    });

    $query.on('click',function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        initTable();
        $("#org-table-form")[0].reset();
    });
    //对外暴露的接口
    exports('theme/life/organization/orgCheckInfo', {});
})