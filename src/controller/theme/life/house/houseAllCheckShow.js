
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        view = layui.view,
        setter = layui.setter,
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
    element.render('tab','houseCheckTab');

    var typeId=1;


    element.on('tab(houseCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('houseCheckId',{key:'activityCheckTypeId',value:idvalue});
        initTable();
    });

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.tabChange('houseCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionCheckInfoTable'+layui.data('houseCheckId').activityCheckTypeId),
            id: 'actionCheckInfoTable'+layui.data('houseCheckId').activityCheckTypeId,
            url: proPath + 'admin/houseCheck/selectCheckByType?languageType=1&houseTypeId='+layui.data('houseCheckId').activityCheckTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'houseTitle', title: '购房信息标题', minWidth: 200,align:'left'},

                {
                    field: 'headImage', title: '缩略图', event: 'showImage', templet: function (d) {
                        return '<div ><img src="' + d.headImage + '" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },

                {field: 'creatorName', title: '发布人', minWidth: 120,align:'left'},
                {title: '审核状态', templet: '#check-state',minWidth: 120,align:'center'},
/*                {title: '展示状态', templet: '#show-flag',align:'center'},
                {title: '置顶状态', templet: '#top-flag',align:'center'},*/
                {field: 'createTime', title: '创建时间', minWidth: 200, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 120,align:'center'}
            ]],
        });
    }

    table.on('tool(actionCheckInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;


        if (layEvent === 'showImage') {
            layer.open({
                title: false,
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                shadeClose: true, //开启遮罩关闭
                end: function (index, layero) {
                    return false;
                },
                content: '<div style="text-align:center"><img src="' + data.headImage + '"  style="height:100% ;width:100%"/></div>'
            });
        }

        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/houseCheck/checkhistory",{"houseId":data.houseId},function (res) {
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
            checkActionInfo(data,true);
        }
    });

    function checkActionInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }

        lovexian.popup("theme/life/house/houseCheck","审核文章",data,function () {
                form.val('houseCheckDeatil',{
                    'houseTitle':data.houseTitle,
                    'houseSubtitle':data.houseSubtitle,
                    'houseAbstract':data.houseAbstract
                });
                data.isTop==0?$('input[name="isTopCheck"]').attr('checked', null):"";
                $("input[name='opennessCheck'][value="+data.isShow+"]").prop("checked",true);

                $('.thumbImg').attr("src",data.headImage);
                layui.use('theme/life/house/houseCheck', layui.factory('theme/life/house/houseCheck'));
            },
            function () {
                $query.click();
            });
    }

    function deleteActions(actionIds) {
        lovexian.del(proPath + '/api/actionInfo/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $query.click();
        });
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
            houseTitle: $searchForm.find('input[name="actTitle"]').val().trim(),
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
        $("#action-table-form")[0].reset();

        initTable();
    });

    //对外暴露的接口
    exports('theme/life/house/houseAllCheckShow', {});
});