function gaodeMap(){
    layui.use('lovexian',function () {
        var lovexian = layui.lovexian;

        lovexian.popup("/common/gaodeMap","高德地图",{},function(){},function(){});
    });
    return;
}

layui.define(['element', 'dropdown', 'baseSetting','validate', 'admin', 'formSelects','upload', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-activity'),
        laytpl = layui.laytpl,
        lovexian = layui.lovexian,
        dropdown = layui.dropdown,
        form = layui.form,
        upload = layui.upload,
        table = layui.table,
        router = layui.router(),
        search = router.search,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        element = layui.element,
        pre_layer = $(".preview-layer"),
        pre_bg = $(".preview-bg"),
        pre_phone = $("#previewPhone"),
        user=null;

    // 非空校验
    validate = layui.validate;
    form.verify(validate);

    $searchForm = $view.find('form');
    $query = $searchForm.find("div[name='query']");
    $reset = $searchForm.find("div[name='reset']");

    form.render();
    var typeId = 1;
    initTable();
    element.on('tab(orgTab)', function (data) {
        initTable();
    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = orgMoreTpl.innerHTML
        , view = document.getElementById('orgMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });


    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.tabChange('orgTab', 1);

    dropdown.render({
        elem: $view.find('.org-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('orgInfoTable' + $(".layui-tab-title .layui-this").attr("lay-id"));
            if (name === 'add') {
                addorgInfo({},false);
                //跳转到orgAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/orgAdd';
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的机构');
                } else {
                    lovexian.modal.confirm('删除机构', '确定删除该机构？', function () {
                        var orgIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            orgIds.push(item.id)
                        });
                        deleteorgs(orgIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加机构',
            perms: 'orgInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'orgInfo:delete'
        }]
    });

    function addorgInfo(data,flag){
        var width = $(window).width() - $("#my-side").width() + 'px';
        var height = $(window).height() - $("#my-header").height() + 'px';
        var index = layui.layer.open({
            title:flag ? "编辑机构":"添加机构",
            type: 1,
            skin: "layui-layer-admin-page",
            offset: 'rb',
            area: [width, height],
            content: $('#orgInfoAdd'),
            shade: false,
            resize: false,
            anim: 2,
            // zIndex: layer.zIndex,
            success: function (layero, index) {
                if (!flag) {
                    setFormData({},"orgInfoAdd");


                } else {
                    setFormData(data,"orgInfoAdd");
                    user= form.val("orgInfoAdd");
                }

            },
            end: function (layero, index) {
                clearFormData();
                $("#orgInfoAdd").css("display","none");
                $reset.click();
            },
        })
    }
    function vieworgInfo(data) {
        var width = $(window).width() - $("#my-side").width()+ 'px';
        var height = $(window).height() - $("#my-header").height() + 'px';
        var index = layui.layer.open({
            title: "查看机构",
            type: 1,
            skin: "layui-layer-admin-page",
            offset: 'rb',
            area: [width, height],
            content: $('#organization'),
            shade: false,
            resize: false,
            anim: 2,
            // zIndex: layer.zIndex,
            success: function (layero, index) {
                $(".orgName").attr("disabled",true);
                $(".orgAddress").attr("disabled",true);
                $(".orgIntroduce").attr("disabled",true);
                $(".orgPhone").attr("disabled",true);
                $(".locationName").attr("disabled",true);
                $(".orgRoute").attr("disabled",true);
                $(".longitude").attr("disabled",true);
                $(".latitude").attr("disabled",true);
                $(".Dthumbnails").attr('src',data.headImage);
                setFormData(data,"organization");
            },
            end: function (layero, index) {
                $(".orgName").attr("disabled",false);
                $(".orgAddress").attr("disabled",false);
                $(".orgIntroduce").attr("disabled",false);
                $(".orgPhone").attr("disabled",false);
                $(".locationName").attr("disabled",false);
                $(".orgRoute").attr("disabled",false);
                $(".longitude").attr("disabled",false);
                $(".latitude").attr("disabled",false);
                clearFormData();
                $("#organization").css("display","none");

            },
        })
    }
    var dataId;
    function setFormData(data,tableName){
       // console.log(data);
        form.val(tableName,{
            "orgName":data.orgName,
            "orgAddress":data.orgAddress,
            "orgIntroduce":data.orgIntroduce,
            "orgPhone":data.orgPhone,
            "locationName":data.locationName,
            "orgRoute":data.orgRoute,
            "longitude":data.locationLongitude,
            "latitude":data.locationLatitude,
        });
        dataId=data.id;
        $(".thumbImg").attr('src',data.headImage);
        form.render();
    }
    function clearFormData() {
        $(".orgName").val("");
        $(".orgAddress").val("");
        $(".orgIntroduce").val("");
        $(".orgPhone").val("");
        $(".locationName").val("");
        $(".orgRoute").val("");
        $(".longitude").val("");
        $(".latitude").val("");
        $('.thumbImg')[0].src='';
    }
    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#orgInfoTable' +  $(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'orgInfoTable' + $(".layui-tab-title .layui-this").attr("lay-id"),
            url: proPath + 'admin/organizationInfo/listByType?orgTypeId=' +  $(".layui-tab-title .layui-this").attr("lay-id"),
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'orgName', title: '机构名称', minWidth: 200, align: 'left'},
                {field: 'creatorName', title: '创建人', minWidth: 200, align: 'left'},
                {title: '审核状态', templet: '#check-state', align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#org-option', minWidth: 140, align: 'center'}
            ]]
        });
    }

    table.on('tool(orgInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'detail') {
            vieworgInfo(obj.data);
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除机构信息','确定删除该机构吗？', function () {
                lovexian.del(
                    proPath + '/admin/organizationInfo/deleteById?id='+ obj.data.id, null, function (data) {
                        console.log("success");
                        lovexian.alert.success('删除机构成功');
                        $reset.click();
                    });
            });
        }
        if (layEvent === 'del2') {
            lovexian.modal.confirm('删除爱学习信息', '确定删除该篇机构吗？', function () {
                lovexian.del(proPath + '/admin/organizationInfo/remove?id=' + obj.data.id, null, function (data) {
                    lovexian.alert.success('删除机构成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit2') {
            lovexian.modal.confirm('还原爱学习信息', '确定还原该篇机构吗？', function () {
                lovexian.del(proPath + 'admin/organizationInfo/resetOrgInfo?id=' + obj.data.id, null, function (data) {
                    // alert(JSON.stringify(data));
                    console.log("success");
                    lovexian.alert.success('还原机构成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑也跳转到orgAdd，根据类型判断是添加还是编辑
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;

            }
            addorgInfo(obj.data,true);
        }
    });

    function deleteorgs(orgIds) {
        lovexian.del(proPath + '/admin/organizationInfo/BatchDelete/' + orgIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除机构成功');
            $reset.click();
        });
    }

    function getQueryParams() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        // alert(createTimeFrom);
        // alert(createTimeTo);
        return {
            orgName: $searchForm.find('input[name="actTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }


    $query.on('click', function () {
        var params = getQueryParams();
       // console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click', function () {
        $("#org-table-form")[0].reset();
        initTable();
    });
    //上传缩略图
    upload.render({
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

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }


    /*//表单校验废弃版
    form.verify({
        orgName : function(val){
            if(val == ''){
                return "机构标题不能为空";
            }
        },
        orgAddress : function(val){
            // var actInfo = removeTAG(orgContent.getContent());
            if(val == ''){
                return "机构地址不能为空";
            }
        },
        orgRoute : function(val){
            if(val == ''){
                return "机构路线不能为空";
            }
        },
        orgPhone : function(val){
            // var actInfo = removeTAG(orgContent.getContent());
            if(val == ''){
                return "机构联系方式不能为空";
            }
        },
        locationName : function(val){
            if(val == ''){
                return "机构坐标名不能为空";
            }
        },
        orgIntroduce : function(val){
            // var actInfo = removeTAG(orgContent.getContent());
            if(val == ''){
                return "机构介绍不能为空";
            }
        },
    });
*/
    form.on('switch(switchTop)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message=""
        if(show_value==1){
            message="置顶成功";
        }else {
            message="取消置顶";
        }
        var id = this.value;
        var data = {
            id: id,
            isTop: show_value
        }
        lovexian.post(proPath +  'admin/organizationInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });

    form.on('switch(switchShow)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message=""
        if(show_value==1){
            message="展示成功";
        }else {
            message="取消展示";
        }
        var id = this.value;
        var data = {
            id: id,
            isShow: show_value
        }
        lovexian.post(proPath +  'admin/organizationInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });
    form.on("submit(addNews)",function(data){
        let sum = lovexian.validateLength("input[id='orgNames']",250,"标题长度不能大于250");

        if(sum > 0) {
            return;
        }

        if(data.field.longitude==""){
            layer.alert("经纬度不能为空",{time:2000,icon:5,shift:6},function (index) {
                layer.close(index);
            });
            return;
        }

        if($('.thumbImg')[0].src==""){
            layer.alert("图片不能为空",{time:2000,icon:5,shift:6},function (index) {
                layer.close(index);
            });
            return;
        }
        var data = {
            id:dataId,
            orgName : data.field.orgName,  //文章标题
            orgAddress : data.field.orgAddress,  //文章子标题
            orgIntroduce :data.field.orgIntroduce, //文章内容
            orgPhone: data.field.orgPhone,
            delState: 0,
            readCount: 100,
            learnOrderNum: 1,
            headImage : $(".thumbImg").attr("src"),  //缩略图
            orgRoute : data.field.orgRoute,   //活动信息分类
            orgTypeId : $(".layui-tab-title .layui-this").attr("lay-id"),    //活动信息分类
            checkState : $('.orgStatus select').val(),    //发布状态
            isShow : $('#isShowId input[name="openness"]:checked ').val(),  //是否置顶
            isTop : data.field.isTop == "on" ? "1" : "0",    //是否置顶
            locationLongitude: $('.longitude').val(), //活动信息分类
            locationLatitude: $('.latitude').val(),//活动信息分类
            locationName: data.field.locationName,   //活动信息分类
            languageType: $('.languageStatus select').val()
        };
        //数据比较，判断是否保存
        var orgInfo= form.val("orgInfoAdd");
       /* console.log(user==null);
        console.log(orgInfo);
        console.log(user);*/
        if(user!=null){
            if (lovexian.nativeEqual(orgInfo, user)) {
                console.log('data is not change...')
                lovexian.alert.warn('数据未作任何修改！');
                return false;
            }
        }


        lovexian.post(proPath + 'admin/organizationInfo/saveOrUpdate',data,function (res) {
            var status = $('.orgStatus select').val();
            if(res.status == '200'){
                layer.closeAll();
                $reset.click();
                if( status == '100'){
                    lovexian.alert.success('保存草稿成功');
                }else{
                    lovexian.alert.success('发布成功，等待审核');
                }

            }else{
                lovexian.alert.error('保存失败:'+res.message);
            }
            return false;
        });
    });
   /* layui.use([ 'form'], function () {
        var $ = layui.jquery,
            form = layui.form;
        /!* 监听 *!/

        form.on('submit(lovexian-form-group-submit)', function (data) {
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            var index = layui.layer.open({
                title : "高德地图",
                type : 2,
                skin:"layui-layer-admin-page",
                area :['800px','600px'],
                content : '#/common/gaodeMap',
                shade : false,
                resize:false,
                anim: 2,
                zIndex: layer.zIndex,
                success : function(layero, index){
                    // layer.setTop(layero);//多层窗口时此层置顶
                    setTimeout(function(){
                        layer.getChildFrame('#container',index).css("height","520px");
                    },1000)
                }
            })
            return false;
        });
    });*/


    /*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();
        $reset.click();
    })
    //对外暴露的接口
    exports('theme/life/organization/orgInfo', {});
});