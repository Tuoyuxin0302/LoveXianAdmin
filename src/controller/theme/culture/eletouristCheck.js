layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl','upload'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        view = layui.view,
        $view = $('#lovexian-culture-check'),
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
        upload = layui.upload,
        pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query=$searchForm.find("div[name='query']");
    $reset=$searchForm.find("div[name='reset']");

    form.render();

    var placeId;
    var checkId;

    element.on('tab(placeTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('id',{key:'placeTypeId',value:idvalue});
        initTable();
    });

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.tabChange('placeTab',1);

    function placeCheck(data){
        if(data.checkState != 0){
            layer.msg("只能审核一次", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        var index = layui.layer.open({
            title : "审核",
            type : 1,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content : $('#placeForm'),
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero, index){
                layui.data('placeData',{key:'data', value:data});
                form.val("placeForm",{
                    "placeName":data.placeName,
                    "placeAddress":data.placeAddress,
                    "placeLongitude":data.placeLongitude,
                    "placeLatitude":data.placeLatitude,
                    "openTime":data.openTime,
                    "website":data.webSite,
                    "englishIntroduce":data.englishIntroduce,
                });
                $("#content").val(data.placeContent);
                $(".thumbImg").attr('src',data.headImage);
                form.render();
            },
            end:function (layero, index) {
                layui.data('placeData',{key:'data', remove:true});
                $("#placeForm").css("display","none");

            },
        })
    }

    form.on("radio(checkState)",function(data){
        if(data.elem.title == "审核拒绝"){
            $(".releaseData").removeClass("layui-hide");
            $(".releaseData #checkState").attr("lay-verify","required");
        }else{
            $(".releaseData").addClass("layui-hide");
            $(".releaseData #checkState").removeAttr("lay-verify");
        }
    });
    //监听提交
    form.on("submit(addCheck)",function(){
        //实际使用时的提交信息
        var data = {
            refuseReason: $("#refuseReason").val(),
            checkState: $('input[name="placeCheck"]:checked').val(),
            placeId: placeId,
            checkId: checkId,
        };
        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/placeCheck/check',data,function () {
            lovexian.alert.success('审核完成');
            layer.closeAll();
            return false;
        });
    });

    //退出
    form.on("submit(exit)",function(){
        layer.close(layer.index);
    });

    //显示数据
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#placeCheckTable'+layui.data('id').placeTypeId),
            id: 'placeCheckTable'+layui.data('id').placeTypeId,
            url: proPath + '/admin/placeCheck/selectCheckByType?languageType=1&placeType='+layui.data('id').placeTypeId,
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'placeName', title: '名称', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140,align:'center'}
            ]],
        });
    }

    table.on('tool(placeCheckTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        placeId = data.placeId;
        checkId = data.checkId;

        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/placeCheck/checkhistory",{"placeId":placeId},function (res) {
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
            placeCheck(data);
        }
    });

    //实现预览的函数
    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if(ifr_document){
            //设置标题
            var title_str = data.actTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者
            var author_str = data.creatorName;
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
        // alert(createTimeFrom);
        // alert(createTimeTo);
        return {
            placeName: $searchForm.find('input[name="placeName"]').val().trim(),
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
    exports('theme/culture/eletouristCheck', {});
});