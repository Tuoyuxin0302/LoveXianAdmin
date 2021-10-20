//爱有家——中介信息

layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects','upload', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
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
        pre_phone = $("#previewPhone");
    $searchForm = $view.find('form');
    $query = $searchForm.find("div[name='query']");
    $reset = $searchForm.find("div[name='reset']");


    form.render();
    initTable();
    element.render('tab','actionTab');
    var typeId = 1;
    element.on('tab(actionTab)', function (data) {

    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = actionMoreTpl.innerHTML
        , view = document.getElementById('actionMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });


    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    laydate.render({
        elem: '#workTime'
        ,type: 'datetime',
        trigger: 'click',
        zIndex: 99999999,
        position:'fixed'
    });


    element.tabChange('actionTab', 1);
// 下拉框
    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('actionInfoTable');
            if (name === 'add') {
                // 添加一个页面
                var agentId = null;
                addActionInfo({});
            }
            if (name === 'delete') {
                console.log(checkStatus)
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的中介信息');
                } else {
                    lovexian.modal.confirm('删除中介信息', '确定删除中介信息？', function () {
                        var agentIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            agentIds.push(item.id)
                        });
                        deleteActions(agentIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '新增中介',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });

    /**
     * 表单回显
     * @param data
     */
    function setFormData(data) {
        $(".thumbImg").attr('src', data.headImage);

        // 给表单赋值
        form.val("agentContent", {
                "agentName": data.agentName,
                "agentAddress": data.agentAddress,
                "agentPhone": data.agentPhone,
                "companyBranch": data.companyBranch,
                "businessScope": data.businessScope,
                 "workTime": data.workTime,
            }
        );

        if (data.isTop == 1) {
            $("input[type='checkbox'][name='isTop2']").attr("checked", true);
        }
        data.isShow === 0 ? $("input[type='radio'][name='openness2'][value='0']").attr("checked", true) :
            $("input[type='radio'][name='openness2'][value='1']").attr("checked", true);
        form.render();
    }



// 弹出添加或者编辑的一个页面
    function addActionInfo(data) {
        var width = $(window).width() - $("#my-side").width() + 'px';
        var height = $(window).height() - $("#my-header").height() + 'px';
        var index = layui.layer.open({
            title: "添加文章",
            type: 1,
            skin: "layui-layer-admin-page",
            offset: 'rb',
            area: [width, height],
            content: $('#agent'),
            shade: false,
            resize: false,
            anim: 2,

            success: function (layero, index) {
                setFormData(data);

            },
            end: function (layero, index) {
                $('#project').css('display','none');
                layui.index.render();

            },
        })
    }
// 表格初始化
    function initTable() {
        tableIns = lovexian.table.init({
            // 渲染哪个表格
            elem: $('#actionInfoTable'),
            id: 'actionInfoTable',
            url: proPath + 'admin/agentInfo/getAgentlist?languageType=1',
            type: 'GET',
           // toolbar: ' true', //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'agentName', title: '中介姓名', minWidth: 120, align: 'left'},
                {
                    field: 'headImage', title: '缩略图',  event: 'showImage',templet: function (d) {
                        return '<div ><img src="'+d.headImage+'" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'agentAddress', title: '地址', minWidth: 200, align: 'left'},
                {field: 'agentPhone', title: '联系方式', minWidth: 120, align: 'left'},
                {title: '审核状态', templet: '#check-state', minWidth: 120, align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {field: 'businessScope', title: '负责区域', minWidth: 200, align: 'left'},
                {field: 'companyBranch', title: '公司门店', minWidth: 200, align: 'left'},
                {field: 'workTime', title: '入职时间', minWidth: 200, align: 'left'},

                {field: 'creatorName', title: '发布人', minWidth: 120, align: 'left'},

                {field: 'createTime', title: '创建时间', minWidth: 200, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 120, align: 'center',fixed:'right'}
            ]],
        });
    }


    // 监听显示不显示
    form.on('switch(switchShow)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message=""
        if(show_value==1){

             message="成功展示";
        }else {
            message="取消成功";

        }
        var id = this.value;
        var data = {
            id: id,
            isShow: show_value
        }
        lovexian.post(proPath + 'admin/agentInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });




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
        lovexian.post(proPath + 'admin/agentInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });


    //上传缩略图
    upload.render({
        elem: '.thumbBox',
        url: proPath + '/fileupload/smallfile',
        method: "post",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        headers: {
            Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
        },
        done: function (res, index, upload) {
            $('.thumbImg').attr('src', res.data.url);
            $('.thumbBox').css("background", "#fff");
        }
    });

    function clearFormData() {
        $(".agentName").val("");
        $(".agentAddress").val("");
        $(".agentPhone").val("");
        $("#workTime").val("");
        $(".companyBranch").val("");
        $(".businessScope").val("");
        $("#headImage").val("");
        $("#checkState").val("");

        $(".thumbImg").attr('src',"");
    }

    // 查看详情
    function vieworgInfo(data) {
        var width = $(window).width() - $("#my-side").width()+ 'px';
        var height = $(window).height() - $("#my-header").height() + 'px';
        var index = layui.layer.open({
            title: "查看中介",
            type: 1,
            skin: "layui-layer-admin-page",
            offset: 'rb',
            area: [width, height],
            content: $('#agentDetail'),
            shade: false,
            resize: false,
            anim: 2,
            // zIndex: layer.zIndex,
            success: function (layero, index) {
                $(".agentName").attr("disabled",true);
                $(".agentAddress").attr("disabled",true);
                $(".agentPhone").attr("disabled",true);
                $(".workTime").attr("disabled",true);
                $(".companyBranch").attr("disabled",true);
                $(".businessScope").attr("disabled",true);
                $("#headImage").attr("disabled",true);
                $("#checkState").attr("disabled",true);
                setFormData(data);
            },
            end: function (layero, index) {
                clearFormData()
                $("#agentDetail").css("display","none");
            },
        })
    }


//  监听每一行的工具条
    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;

        if(obj.event === 'showImage'){
            layer.open({
                title:false,
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                shadeClose: true, //开启遮罩关闭
                end: function (index, layero) {
                    return false;
                },
                content: '<div style="text-align:center"><img src="' + data.headImage + '"  style="height:100% ;width:100%"/></div>'
            });}

        if (layEvent === 'detail') {
            vieworgInfo(data);
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除爱有家-中介信息', '确定删除该中介信息吗？', function () {
                lovexian.del(proPath + '/admin/agentInfo/deleteById?id=' + obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除中介成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
           layui.data('editAgent', {key: 'editId', value: '1'});
           layui.data('agentData', {key: 'data', value: data});
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;
            }
            agentId = obj.data.id;
            addActionInfo(obj.data);
        }
    });

    function deleteActions(agentIds) {
        lovexian.del(proPath + '/admin/agentInfo/BatchDelete/' + agentIds, null, function () {

            lovexian.alert.success('删除中介成功');
            $query.click();
        });
    }

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if (ifr_document) {
            //设置标题
            var title_str = data.houseTitle;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者house
            var author_str = data.creatorName;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置正文
            var content_str = data.houseContent;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);
            // 设置时间

        }
    }


/*取消按钮*/
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })
    /**
     * 提交表单
     */
    form.on("submit(addProject)", function (data) {
        if($("#headImage").attr("src")==null){
            layer.alert("图片不能为空",  {time:2000, icon:5, shift:6},function(index){
          // 回调方法
                layer.close(index);
            });
            return ;
        }
        //var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        //实际使用时的提交信息
        var data;
        if (typeof agentId == "undefined" || agentId == null || agentId == "") {
            data = {
                agentName: $(".agentName").val(),  //中介姓名
                agentAddress: $(".agentAddress").val(), // 地址
                agentPhone: $(".agentPhone").val(),  // 联系方式
                companyBranch: $(".companyBranch").val(), // 公司门店
                workTime: $("#workTime").val(), // 工作时间
                businessScope: $(".businessScope").val(),// 负责区域
                headImage: $("#headImage").attr("src"),  //缩略图
                checkState: $("#checkState").val(),// 状态
                isShow: $("input[type='radio'][name='openness2']:checked").val(),
                isTop: data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
            };
        } else {
            data = {
                id: agentId,
                agentName: $(".agentName").val(),  //中介姓名
                agentAddress: $(".agentAddress").val(), // 地址
                agentPhone: $(".agentPhone").val(),  // 联系方式
                workTime: $("#workTime").val(), // 工作开始时间
                companyBranch: $(".companyBranch").val(), // 公司门店
                businessScope: $(".businessScope").val(),// 负责区域
                headImage: $("#headImage").attr("src"),  //缩略图
                checkState: $("#checkState").val(),// 状态


                isShow: $("input[type='radio'][name='openness2']:checked").val(),
                isTop: data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
            };
        }

        lovexian.modal.confirm("添加中介信息","确认添加中介信息吗",function () {
            lovexian.post(proPath + 'admin/agentInfo/saveOrUpdate', data, function (res) {
                var status = $('.actionStatus select').val();
                layer.closeAll();

                if(res.status == '200'){
                    if( status == '100'){
                        lovexian.alert.success('保存草稿成功');
                    }else{
                        lovexian.alert.success('发布成功，等待审核');
                    }
                    parent.layui.$("input[name='query']").click();
                }else{
                    lovexian.alert.error('保存失败:'+res.message);
                }
            });

        });

    });

    function getQueryParams() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        // alert(createTimeTo);
        return {
            agentName: $searchForm.find('input[name="actTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }


    $query.on('click', function () {
        var params = getQueryParams();
        tableIns.reload({where: params});
    });

    $reset.on('click', function () {
        $("#action-table-form")[0].reset();

        initTable();
    });

    //对外暴露的接口
    exports('theme/life/house/agent', {});
});