
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        view = layui.view,
        $view = $('#lovexian-invest-check'),
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

    var invCheckId;
    var checkId;

    initTable();
    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });

    element.on('tab(investCheckTab)',function (data) {
        initTable();
    });

    form.on("radio(checkState)",function(data){
        if(data.elem.title == "审核拒绝"){
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #checkState").attr("lay-verify","required");
        }else{
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #checkState").removeAttr("lay-verify");
        }
    });


    element.tabChange('investCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#investCheckInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'investCheckInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id"),
            url: $(".layui-tab-title .layui-this").attr("lay-id")==1 ?
            proPath + '/admin/investCheck/listInvestByType?languageType=1&investTypeId='+$(".layui-tab-title .layui-this").attr("lay-id")
            :proPath+ '/admin/investCheck/listProject?languageType=1',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: $(".layui-tab-title .layui-this").attr("lay-id")==1 ? 'investTitle':'projectTitle', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {field: 'checkState',title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]]
        });
    }

    table.on('tool(investCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        invCheckId=data.invCheckId;
        checkId=data.checkId;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/investCheck/checkhistory",{"investId":data.invCheckId},function (res) {
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
            checkInvestInfo(data);
        }
    });

    form.on("submit(checkProject)",function(data){
        var data = {
            refuseReason : $("#refuseReason").val(),  //拒绝理由
            checkState : data.field.checkState,//审核状态
            invCheckId:invCheckId,
            checkId: checkId
        };
        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/investCheck/projectCheck',data,function (res) {
            lovexian.alert.success('审核完成');
            // var index = parent.layer.getFrameIndex(window.name);
            // parent.layer.close(index);
            $('#resetBtn').click();
            layer.closeAll();
            return false;
            // $('#lovexian-job').find('#query').click();
        });
    });


    function checkInvestInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }
        var tabId=$(".layui-tab-title .layui-this").attr("lay-id");
        if(tabId==1){
            lovexian.popup("theme/life/investChecking","审核文章",data,function () {
                    form.val("actionCheckDetail",{
                        "investTitle":data.investTitle,
                        "subTitle":data.investSubtitle,
                        "abstract":data.investAbstrinvest,
                    });
                    data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                    $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);
                    $('.thumbImg').attr("src",data.headImage);
                    layui.use('theme/life/investChecking', layui.factory('theme/life/investChecking'));
                },
                function () {
                    // $query.click();
                });
        }else{
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            layer.open({
                title : "审核文章",
                type : 1,
                skin:"layui-layer-admin-page",
                offset: 'rb',
                area :[width,height],
                content : $("#projectCheck"),
                shade : false,
                resize: false,
                anim: 2,
                success : function(layero,index){
                        setPrjectData(data);
                },
                end:function () {
                    // $query.click();
                }
            })
        }

    }

    function setPrjectData(data) {
        form.val("projectCheck",{
                "projectTitle":data.projectTitle,
                "subTitle":data.projectSubtitle,
                "principalName":data.principalName,
                "phone":data.principalPhone,
                "address":data.principalAddress,
                "relatedproject":data.relatedProject,
                "content":data.projectIntroduction,
            }
        );
        $("#checkheadImage").attr('src',data.headImage);
        data.isTop==0?$('input[name="projectisTop"]').attr('checked', null):"";
        $("input[name='projectOpenness'][value="+data.isShow+"]").prop("checked",true);
        // data.isTop==1? $("input[type='checkbox'][name='projectisTop']").attr("checked",true):
        //     $("input[type='checkbox'][name='projectisTop']").attr("checked",false);
        // data.isShow==0 ? $("input[type='radio'][name='projectOpenness'][value='0']").attr("checked",true):
        //     $("input[type='radio'][name='projectOpenness'][value='1']").attr("checked",true);
        form.render();
    }


    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.actTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = "西安外事办";
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.actContent;
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
            investTitle: $searchForm.find('input[name="investTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }

    function getProjectParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            projectTitle: $searchForm.find('input[name="investTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }



    $query.on('click',function () {
        var params;
        $(".layui-tab-title .layui-this").attr("lay-id")==1?(params=getQueryParams()):(params=getProjectParams());
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        // $("#action-table-form")[0].reset();
        initTable();
    });

    $("#cancelBtn2").click(function () {
        layer.closeAll();
    });


    //对外暴露的接口
    exports('theme/life/investCheck', {});
});