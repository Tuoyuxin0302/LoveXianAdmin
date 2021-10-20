
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

    element.on('tab(actionCheckTab)',function (data) {
        var idvalue=data.index+1;//从0开始
        layui.data('houseCheckId',{key:'activityCheckTypeId',value:idvalue});
        initTable();
    });


    element.tabChange('actionCheckTab',1);

    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#actionCheckInfoTable'),
            id: 'actionCheckInfoTable',
            url: proPath + 'admin/agentCheck/selectCheckList',
            type: 'GET',
          //  toolbar: ' true', //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'agentName', title: '中介姓名', minWidth: 100, align: 'left'},
                {field: 'businessScope', title: '负责区域', minWidth: 200, align: 'left'},
                {
                    field: 'headImage', title: '缩略图', event: 'showImage', templet: function (d) {
                        return '<div ><img src="' + d.headImage + '" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },

                {field: 'creatorName', title: '发布人', minWidth: 100, align: 'left'},
                {title: '审核状态', templet: '#check-state',minWidth: 120, align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140, align: 'center'}
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
            lovexian.get(proPath+"/admin/agentCheck/checkhistory",{"agentId":data.agentId},function (res) {
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
            layui.data('editAgent', {key: 'editId', value: '1'});
            layui.data('agentData', {key: 'data', value: data});
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            agentId = obj.data.agentId;
            checkId = obj.data.checkId;
            checkActionInfo(obj.data);
        }
    });

    /**
     * 弹出一个form表单
     * @param data
     */
    function checkActionInfo(data){

        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
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
            content : $('#agentCheck'),
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero,index){
                setFormData(data);

            },
            end:function () {
                layui.data('editHouseArticle', {key: 'editId', remove: '1'});
                layui.data('articleHouseData', {key: 'data', remove: data});
                $("#agentCheck").css("display","none");
            }
        })
    }


    /**
     * 表单回显
     * @param data
     */
    function setFormData(data) {
        // 给表单赋值
        form.val("agentCheck", {
                "agentName": data.agentName,
                "agentAddress": data.agentAddress,
                "agentPhone": data.agentPhone,
                "companyBranch": data.companyBranch,
                "businessScope": data.businessScope,
                "workTime": data.workTime,

            }
        );
        $("#headImage").attr('src', data.headImage);
        $("input[type='checkbox'][name='isTop2']").attr("checked", true);
       console.log(data);
        /* 审核页面的置顶和不置顶*/
        data.isTop==1? $("input[type='checkbox'][name='isTopCheck']").attr("checked",true):
            $("input[type='checkbox'][name='isTopCheck']").attr("checked",false);
        data.isShow==0 ? $("input[type='radio'][name='opennessCheck'][value='0']").attr("checked",true):
            $("input[type='radio'][name='opennessCheck'][value='1']").attr("checked",true);
    }

    form.render();

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
            agentName: $searchForm.find('input[name="actTitle"]').val().trim(),
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


    form.on("submit(cancelBtn)",function(data){
        layer.closeAll();
    });
    /**
     * 提交表单
     */
    form.on("submit(addProject)", function (data) {

        //实际使用时的提交信息
        var data = {
            refuseReason: $("#refuseReason").val(),
                checkId:checkId,
                agentId: agentId,
                agentName: $(".agentName").val(),  //中介姓名
                agentAddress: $(".agentAddress").val(), // 地址
                agentPhone: $(".agentPhone").val(),  // 联系方式
                companyBranch: $(".companyBranch").val(), // 公司门店
                businessScope: $(".businessScope").val(),// 负责区域
                headImage: $("#headImage").attr("src"),  //缩略图
                checkState: $("input[type='radio'][name='checkState']:checked").val(),// 状态
                isShow: $("input[type='radio'][name='openness2']:checked").val(),
                isTop: data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
            };
        if (data.checkState == 2) {
            if (data.refuseReason.trim() == "") {
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.post(proPath + 'admin/agentCheck/check', data, function () {
            lovexian.alert.success('审核成功');

            layer.closeAll();
            $reset.click()
            return false;
        });
    });


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
    exports('theme/life/house/agentAllCheckShow', {});
});