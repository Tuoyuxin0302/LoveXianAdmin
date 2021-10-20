layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-activity'),
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
    $query = $searchForm.find("div[name='query']");
    $reset = $searchForm.find("div[name='reset']");
    // 非空校验
    validate = layui.validate;
    form.verify(validate);

    form.render();
    initTable();
    element.on('tab(learnTab)', function (data) {
        initTable();
    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = learnMoreTpl.innerHTML
        , view = document.getElementById('learnMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });


    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    element.tabChange('learnTab', 1);

    dropdown.render({
        elem: $view.find('.learn-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('learnInfoTable' + $(".layui-tab-title .layui-this").attr("lay-id"));

            if (name === 'add') {
                addlearnInfo({},false);
                //跳转到learnAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/learnAdd';
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的文章');
                } else {
                    lovexian.modal.confirm('删除文章', '确定删除该篇文章？', function () {
                        var actionIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            actionIds.push(item.id)
                        });
                        deletelearns(actionIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加文章',
            perms: 'learnInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'learnInfo:delete'
        }]
    });

    function addlearnInfo(data,isEdit) {
        lovexian.popup("theme/life/studyAdd",isEdit?"编辑文章":"添加文章",$.extend(data,{isEdit:isEdit}),function () {
                if(isEdit){
                    //编辑文章的回显操作
                    form.val('learnInfo',{
                        'learnTitle':data.learnTitle,
                        'learnSubtitle':data.learnSubtitle,
                        'learnAbstract':data.learnAbstract
                    });
                    $("#languageType").val(data.languageType);
                    data.isTop==0?$('input[name="isTop"]').attr('checked', null):"";
                    $("input[name='isShow'][value="+data.isShow+"]").prop("checked",true);
                    $('.thumbImg').attr("src",data.headImage);
                }
                layui.use('theme/life/learn/learnAdd', layui.factory('theme/life/learn/learnAdd'));
            },
            function () {
                $reset.click();
            });
    }


    function initTable() {
        tableIns = lovexian.table.init({
            elem: $('#learnInfoTable' + $(".layui-tab-title .layui-this").attr("lay-id")),
            id: 'learnInfoTable' + $(".layui-tab-title .layui-this").attr("lay-id"),
            url: proPath + '/admin/learnInfo/listByTypeId?learnTypeId='+$(".layui-tab-title .layui-this").attr("lay-id"),
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'learnTitle', title: '文章标题', minWidth: 200, align: 'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200, align: 'left'},
                {title: '审核状态', templet: '#check-state', align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#learn-option', minWidth: 140, align: 'center'}
            ]]
        });
    }

    table.on('tool(learnInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        if (layEvent === 'detail') {
                showContent(data);
                pre_layer.show();
                resetPrePhoneCss();
                pre_bg.on("click", function () {
                    pre_layer.hide();
                });

                //预览图片居中样式
                var css_str = {};
                var pos_left = 0;
                var pos_top = 0;
                $(window).resize(resetPrePhoneCss);

                //重置预览手机页面的CSS
                function resetPrePhoneCss() {
                    pos_left = $(window).width() / 2 - pre_phone.width() / 2;
                    pos_top = $(window).height() / 2 - pre_phone.height() / 2 + 25;
                    css_str = {
                        left: pos_left + "px",
                        top: pos_top + "px"
                    }
                    pre_phone.css(css_str);
                }

        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除爱学习信息','确定删除该篇文章吗？', function () {
                lovexian.del(
                    proPath + '/admin/learnInfo/deleteById?id=' + obj.data.id, null, function (data) {

                    console.log("success");
                    lovexian.alert.success('删除文章成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'del2') {
            lovexian.modal.confirm('删除爱学习信息', '确定彻底删除该篇文章吗？', function () {
                lovexian.del(proPath + '/admin/learnInfo/remove?id=' + obj.data.id, null, function (data) {
                    console.log("success");
                    lovexian.alert.success('删除文章成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit2') {
            lovexian.modal.confirm('还原爱学习信息', '确定还原该篇文章吗？', function () {
                lovexian.del(proPath + '/admin/learnInfo/resetLearnInfo?id=' + obj.data.id, null, function (data) {
                    // alert(JSON.stringify(data));
                    console.log("success");
                    lovexian.alert.success('还原文章成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑也跳转到learnAdd，根据类型判断是添加还是编辑
            if(obj.data.checkState==0){
                layer.msg("未通过审核前不能编辑！！", {time:2000, icon:5, shift:6}, function(){
                }); //弹出时间，图标，特效
                return ;

            }
             addlearnInfo(obj.data,true);
        }
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
        lovexian.post(proPath +  'admin/learnInfo/showOrTop', data, function () {

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
        lovexian.post(proPath +  'admin/learnInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });

    function deletelearns(actionIds) {
        lovexian.del(proPath + '/admin/learnInfo/BatchDelete/' + actionIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $reset.click();
        });
    }

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath + '/admin/learnInfo/preview/' + data.id, function (res) {
            if (res.status == '200') {
                //预览
                if (ifr_document) {
                    //设置正文
                    var content_str = res.data;
                    var ifr_content = $(ifr_document).find(".article-content");
                    ifr_content.html(content_str);
                }
            } else {
                //无法预览
            }
        });
    }


    function getQueryParams() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }

        return {
            learnTitle: $searchForm.find('input[name="actTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }


    $query.on('click', function () {
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click', function () {
        $("#learn-table-form")[0].reset();
        initTable();
    });

    //对外暴露的接口
    exports('theme/life/learn/learnInfo', {});
});