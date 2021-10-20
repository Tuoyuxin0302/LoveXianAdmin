
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        view = layui.view,
        $view = $('#lovexian-health-check'),
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
        position:'fixed'
    });

    element.on('tab(healthCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('healthCheckId',{key:'healthCheckTypeId',value:idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
    });


    element.tabChange('healthCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#healthCheckInfoTable'+layui.data('healthCheckId').healthCheckTypeId),
            id: 'healthCheckInfoTable'+layui.data('healthCheckId').healthCheckTypeId,
            url: proPath + '/admin/healthCheck/selectCheckByType?typeId='+layui.data('healthCheckId').healthCheckTypeId,
            type:'GET',
            totalRow: true,
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'title', title: '信息标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'checkTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]]


        });
    }

    table.on('tool(healthCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'history') {

            lovexian.get(proPath+"/admin/healthCheck/checkhistory",{"healthInfoId":data.healthCheckId},function (res) {
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
            checkHealthInfo(data);
        }
    });
    // //工具栏事件
    // table.on('toolbar(healthCheckInfoTable)', function(obj){
    //     var checkStatus = table.checkStatus(obj.config.id);
    //     switch(obj.event){
    //         case 'getCheckData':
    //             var data = checkStatus.data;
    //             layer.alert(JSON.stringify(data));
    //             break;
    //         case 'getCheckLength':
    //             var data = checkStatus.data;
    //             layer.msg('选中了：'+ data.length + ' 个');
    //             break;
    //         case 'isAll':
    //             layer.msg(checkStatus.isAll ? '全选': '未全选')
    //             break;
    //     }
    // });
/*    function checkWorkInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }

        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        layer.open({
            title : "审核工作",
            type : 2,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content : '#/theme/life/health/healthInfoCheck',
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero,index){
                layui.data("parent", {
                    key: "data"
                    ,value: data
                });
            },
            end:function () {
                layui.data('parent', {
                    key: 'data'
                    ,remove: true
                });
            }
        })
    }*/
    function checkHealthInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }
        lovexian.popup("theme/life/health/healthInfoCheck","审核文章",data,function () {


                form.val("healthCheckDetail",{
                    'healthTitle':data.title,
                    'subTitle':data.subtitle,
                    'healthContent':data.content
                });
                data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);

                $('.thumbImg').attr("src",data.headImage);
                layui.use('theme/life/health/healthInfoCheck', layui.factory('theme/life/health/healthInfoCheck'));
            },
            function () {
                $query.click();
            });
    }

    function deleteActions(healthIds) {
        lovexian.del(proPath + '/api/healthInfo/' + healthIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $query.click();
        });
    }

    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.title;
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
            title: $searchForm.find('input[name="title"]').val() || '',
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
    });

    //对外暴露的接口
    exports('theme/life/health/healthCheck', {});
});