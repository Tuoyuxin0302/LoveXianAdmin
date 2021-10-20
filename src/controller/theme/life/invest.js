
//爱活动——活动信息——孙美琪
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','upload','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        layer = layui.layer,
        setter = layui.setter,
        $view = $('#lovexian-invest'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        upload = layui.upload,
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
        validate = layui.validate;//校验
        $searchForm = $view.find('form');
        $query=$searchForm.find("div[name='queryInvest']");
        $reset=$searchForm.find("div[name='reset']");

        form.verify(validate);//校验

    form.render();
    var projectId;
    var flag2=false;
    element.init();
    element.on('tab(investTab)',function (data) {
        initTable();
    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = investMoreTpl.innerHTML
        , view = document.getElementById('investMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });

    element.tabChange('investTab',1);
    //上传缩略图
    var uploader = upload.render({
        isupload:true,
        elem: '.thumbBox',
        url: proPath+'/fileupload/smallfile',
        method : "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function(res, index, upload){
            $('.thumbImg').attr('src',res.data.url);
            $('.thumbBox').css("background","#fff");
        }
    });

    dropdown.render({
        elem: $view.find('.invest-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('investInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id"));
            if (name === 'add') {
                flag2=false;
                clearFormData();
                addActionInfo({},false);
                //跳转到actionAdd页面
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的文章');
                } else {
                    lovexian.modal.confirm('删除文章', '确定删除该篇文章？', function () {
                        var investIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            investIds.push(item.id)
                        });
                        deleteActions(investIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加文章',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });

    function deleteActions(investIds) {
        var path;
        $(".layui-tab-title .layui-this").attr("lay-id")==1 ?
            (path=proPath + '/admin/investInfo/BatchDelete/' + investIds)
            :(path=proPath + '/admin/projectInfo/BatchDelete/' + investIds);
        lovexian.del(path, null, function () {
            console.log("success");
            lovexian.alert.success('批量删除成功');
            $reset.click();
        });
    }


    function setFormData(data){
        form.val("project",{
                "projectTitle":data.projectTitle,
            "subTitle":data.projectSubtitle,
            "principalName":data.principalName,
            "phone":data.principalPhone,
            "address":data.principalAddress,
            "relatedproject":data.relatedProject,
            "content":data.projectIntroduction,
    }
        );
        $("#projectheadImage").attr('src',data.headimage);
        $("#languageTypeId2").val(data.languageType);
        data.isTop==0?$('input[name="isTop2"]').attr('checked', null):"";
        $("input[name='openness2'][value="+data.isShow+"]").prop("checked",true);
        form.render();
    }

    function clearFormData() {
        $(".projectTitle").val("");
        $(".subTitle").val("");
        $(".principalName").val("");
        $(".phone").val("");
        $(".address").val("");
        $(".relatedproject").val("");
        $("#content").val("");
        $("#projectheadImage").attr('src',"");
    }


    function addActionInfo(data,isEdit){
        var tabId = $(".layui-tab-title .layui-this").attr("lay-id");
        if(tabId == 1){
            lovexian.popup("theme/life/investAdd"
                ,isEdit?"编辑文章":"添加文章"
                , $.extend(data,{isEdit:isEdit}),function () {
                    if(isEdit){
                        //编辑文章的回显操作
                            form.val('investCon',{
                                'actionTitle':data.investTitle,
                                'subTitle':data.investSubtitle,
                                'abstract':data.investAbstrinvest
                            });
                            $("#languageTypeId").val(data.languageType);
                            data.isTop==0?$('input[name="isTop"]').attr('checked', null):"";
                            $("input[name='openness'][value="+data.isShow+"]").prop("checked",true);
                            $('#investImage').attr("src",data.headImage);
                    }
                    layui.use('theme/life/investAdd', layui.factory('theme/life/investAdd'));
                },
                function () {

                });
        }else {
            reloaduploader(true);
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            layui.layer.open({
                title: "项目合作信息",
                type: 1,
                skin: "layui-layer-admin-page",
                offset: 'rb',
                area: [width, height],
                content: $('#project'),
                shade: false,
                resize: false,
                anim: 2,
                // zIndex: layer.zIndex,
                success: function (layero, index) {
                    if (isEdit) {
                        //编辑项目合作信息
                        setFormData(data);
                    }
                },
                end: function (layero, index) {
                    $('#project').css('display','none');
                }
            });
        }
    }


    function initTable() {
        $("#projectId").val("");
        tableIns = lovexian.table.init({
            elem: $('#investInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'investInfoTable'+$(".layui-tab-title .layui-this").attr("lay-id"),
            url: $(".layui-tab-title .layui-this").attr("lay-id")==1?
            proPath + '/admin/investInfo/list?languageType=1&actTypeId='+$(".layui-tab-title .layui-this").attr("lay-id")
            :proPath+ '/admin/projectInfo/list?languageType=1',
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: $(".layui-tab-title .layui-this").attr("lay-id")==1? 'investTitle':'projectTitle', title: '文章标题', minWidth: 200,align:'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {field: 'checkState',title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'isShow',title: '展示状态', templet: '#show-flag',align:'center'},
                {field: 'isTop',title: '置顶状态', templet: '#top-flag',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#invest-option', minWidth: 140,align:'center'}
            ]],
        });
    }


    table.on('tool(investInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;

        if (layEvent === 'detail') {
            if($(".layui-tab-title .layui-this").attr("lay-id")==2){
                showProjectInfo(data);
                $("#saveBtn2").css('display','none');
                $("#cancelBtn2").css('display','none');
            } else{
                showContent(data);
                pre_layer.show();
                resetPrePhoneCss();
                pre_bg.on("click",function(){
                    pre_layer.hide();
                });
                //预览图片居中样式
                var css_str = {};
                var pos_left = 0;
                var pos_top = 0;
                $(window).resize(resetPrePhoneCss);
                //重置预览手机页面的CSS
                function resetPrePhoneCss(){
                    pos_left = $(window).width() / 2 - pre_phone.width() / 2;
                    pos_top = $(window).height() / 2 - pre_phone.height() / 2+25;
                    css_str = {
                        left:pos_left + "px",
                        top:pos_top + "px"
                    }
                    pre_phone.css(css_str);
                }
            }
        } //detail结束
        if (layEvent === 'del') {
            var path;
            $(".layui-tab-title .layui-this").attr("lay-id")==1?
                (path=proPath + '/admin/investInfo/deleteById?id='+ obj.data.id)
                :(path=proPath + '/admin/projectInfo/deleteProject?id='+ obj.data.id);
            lovexian.modal.confirm('删除爱投资信息', '确定删除该篇文章吗？', function () {
                lovexian.del(path, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除文章成功');
                    $reset.click();
                });
            });
        } //del结束
        if (layEvent === 'edit') {
            flag2=true;
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;
            }
            projectId=obj.data.id;
            $("#projectId").val(projectId);
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
             addActionInfo(obj.data,true);
        } //edit结束
    });

    function showProjectInfo(data) {
        reloaduploader(false);
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        var index = layui.layer.open({
            title : "项目合作信息",
            type : 1,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content :$('#project'),
            shade : false,
            resize:false,
            anim: 2,
            // zIndex: layer.zIndex,
            success : function(layero, index){
                if(data!=null){
                    $(".projectTitle").attr("disabled",true);
                    $(".subTitle").attr("disabled",true);
                    $(".principalName").attr("disabled",true);
                    $(".phone").attr("disabled",true);
                    $(".address").attr("disabled",true);
                    $(".relatedproject").attr("disabled",true);
                    // $("#projectheadImage").removeClass("thumbImg");
                    $("#content").attr("disabled",true);
                    $("#languageTypeId2").attr("disabled",true);
                    $("input[type='checkbox'][name='isTop2']").attr("disabled",true);
                    $("input[type='radio'][name='openness2']").attr("disabled",true);
                    setFormData(data);
                }
            },
            end:function (layero, index) {
                $(".projectTitle").attr("disabled",false);
                $(".subTitle").attr("disabled",false);
                $(".principalName").attr("disabled",false);
                $(".phone").attr("disabled",false);
                $(".address").attr("disabled",false);
                $(".relatedproject").attr("disabled",false);
                $("#content").attr("disabled",false);
                $("#languageTypeId2").attr("disabled",false);
                $("input[type='checkbox'][name='isTop2']").attr("disabled",false);
                $("input[type='radio'][name='openness2']").attr("disabled",false);
            },
        })

    }

    function reloaduploader(upload){
        uploader.reload({isupload:upload});
    }


    function showContent(data){
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/investInfo/preview/'+data.id,function (res) {
            if(res.status=='200'){
                //预览
                if (ifr_document) {
                    //设置正文
                    var content_str = res.data;
                    var ifr_content = $(ifr_document).find(".article-content");
                    ifr_content.html(content_str);
                }
            }else{
                //无法预览
            }
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
            investTitle: $searchForm.find('input[name="investTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }

    function getProjectQueryParams() {
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
        $(".layui-tab-title .layui-this").attr("lay-id")==1?(params=getQueryParams()):(params=getProjectQueryParams());
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        $("#action-table-form")[0].reset();
        initTable();
    });

    form.on("submit(addProject)",function(data){
        //实际使用时的提交信息
        if(!flag2){
            $("#projectId").val("");
        }
        let sum=lovexian.validateLength("input[name='projectTitle']",200,'标题长度不能大于200')+
            lovexian.validateLength("input[name='subTitle']",500,'子标题长度不能大于500')+
            lovexian.validateLength("input[name='relatedproject']",1000,'相关项目长度不能大于1000');
        if(sum>0){
            return;
        }
        var data = {
            id:$("#projectId").val(),
            projectTitle : $(".projectTitle").val(),  //文章标题
            projectSubtitle:$(".subTitle").val(),
            principalName:$(".principalName").val(),
            principalPhone:$(".phone").val(),
            principalAddress:$(".address").val(),
            relatedProject:$(".relatedproject").val(),
            projectIntroduction:$("#content").val(),
            headimage : $("#projectheadImage").attr("src"),  //缩略图
            languageType:$("#languageTypeId2").val(),
            checkState:0,
            isShow:$("input[type='radio'][name='openness2']:checked").val(),
            isTop : data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
        };
        lovexian.modal.confirm('添加项目合作信息', '确定提交项目合作信息吗？', function () {
            lovexian.post(proPath + 'admin/projectInfo/saveOrUpdate',data,function (res) {
                if(res.status == '200'){
                    if( status == '0'){
                        lovexian.alert.success('保存草稿成功');
                    }else{
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    $("#projectId").val("");
                    layer.closeAll();
                    $('#resetBtn').click();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }
                return false;

                /*
                            lovexian.alert.success('保存成功，等待审核');
                            var index = layer.getFrameIndex(window.name);
                            $("#projectId").val("");
                            layer.close(index);
                            layer.closeAll();
                            return false;
                */
            });

        });

        $("#projectId").val("");
    });

    //展示状态的请求
    form.on('switch(delState)',function(data){
        var path;
        $(".layui-tab-title .layui-this").attr("lay-id")==1 ?
            (path=proPath+"/admin/investInfo/updateInvest"):
            (path=proPath+"/admin/projectInfo/updateProject");
        var id=$(data.elem).val();
        var text = data.elem.checked ? '展示':'不展示';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(path,{"isShow":text==='展示'? 1:0,"id":id},function(res){
                if(res.code == 200){
                    layer.alert('【'+text+'】成功^_^', {
                        icon: 1,
                        skin: 'layui-layer-molv'
                    });
                }else{
                    layer.alert('【'+text+'】失败~_~', {
                        icon: 2,
                        skin: 'layui-layer-hong'
                    });
                    if(text === '展示')
                        data.elem.checked = true;
                    else
                        data.elem.checked = false;
                }
                form.render();
            });
            layer.close(index);
        },function (index) {
            if(text==="展示"){
                data.elem.checked=false;
            }else{
                data.elem.checked=true;
            }
            form.render();
            layer.close(index);
        });

    });

    //置顶状态的请求
    form.on('switch(isTop)',function(data){
        var path;
        $(".layui-tab-title .layui-this").attr("lay-id")==1 ?
            (path=proPath+"/admin/investInfo/updateInvest"):
            (path=proPath+"/admin/projectInfo/updateProject");
        var id=$(data.elem).val();
        var text = data.elem.checked ? '置顶':'不置顶';
        layer.confirm("您正在【"+text+"】该信息，您确定吗？",{icon: 3, title:'提示'}, function (index) {
            lovexian.post(path,{"isTop":text==='置顶'? 1:0,"id":id},function(res){
                if(res.code == 200){
                    layer.alert('【'+text+'】成功^_^', {
                        icon: 1,
                        skin: 'layui-layer-molv'
                    });
                }else{
                    layer.alert('【'+text+'】失败~_~', {
                        icon: 2,
                        skin: 'layui-layer-hong'
                    });
                    if(text === '置顶')
                        data.elem.checked = true;
                    else
                        data.elem.checked = false;
                }
                form.render();
            });
            layer.close(index);
        },function (index) {
            if(text==="置顶"){
                data.elem.checked=false;
            }else{
                data.elem.checked=true;
            }
            form.render();
            layer.close(index);
        });

    });



//表单校验
    form.verify({
        projectTitle : function(val){
            if(val == ''){
                return "文章标题不能为空";
            }
        },
        investContent : function(val){
            if(val == ''){
                return "文章内容不能为空";
            }
        }
    });

    $("#cancelBtn2").click(function () {
        layer.closeAll();
    });



    //对外暴露的接口
    exports('theme/life/invest', {});
});