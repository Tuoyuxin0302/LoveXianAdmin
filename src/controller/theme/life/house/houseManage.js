// layui.use('theme/life/actionAdd', layui.factory('theme/life/actionAdd'));
//爱有家——活动信息

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


    form.render();
    element.render('tab', 'actionTab');


    var typeId = 1;


    element.on('tab(actionTab)', function (data) {
        var idvalue = data.index + 1;//从0开始

        layui.data('houseId', {key: 'activityTypeId', value: idvalue});
        // $searchForm.find('input[name="actTitle"]').val("");
        initTable();
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

    element.tabChange('actionTab', 1);

    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('actionInfoTable' + layui.data('houseId').activityTypeId);
            if (name === 'add') {
                addActionInfo();
                //跳转到actionAdd页面
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/theme/life/actionAdd';
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除信息');
                } else {
                    lovexian.modal.confirm('删除信息', '确定删除吗？', function () {
                        var houseIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            houseIds.push(item.id)
                        });
                        deleteActions(houseIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '新增有家',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });

// 弹出一个页面
    function addActionInfo(data, isEdit) {
        lovexian.popup("theme/life/house/houseAdd", isEdit ? "编辑文章" : "添加文章", $.extend(data, {isEdit: isEdit}), function () {
                if (isEdit) {
                    //编辑文章的回显操作
                    form.val('houseContent', {
                        'houseTitle': data.houseTitle,
                        'houseSubtitle': data.houseSubtitle,
                        'houseAbstract': data.houseAbstract
                    });
                    console.log(data.isTop)
                    data.isTop == 0 ? $('input[name="isTop"]').attr('checked', null) : "";
                    $("input[name='openness'][value=" + data.isShow + "]").prop("checked", true);
                    $('.thumbImg').attr("src", data.headImage);
                }
                layui.use('theme/life/house/houseAdd', layui.factory('theme/life/house/houseAdd'));
            },
            function () {
                $reset.click();
            });
    }


    function initTable() {
        tableIns = lovexian.table.init({
            // 渲染哪个表格
            elem: $('#actionInfoTable' + layui.data('houseId').activityTypeId),
            id: 'actionInfoTable' + layui.data('houseId').activityTypeId,
            url: proPath + 'admin/houseInfo/listByTypeId?languageType=1&houseTypeId=' + layui.data('houseId').activityTypeId,
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'houseTitle', title: '购房信息标题', minWidth: 200, align: 'left'},

                {
                    field: 'headImage', title: '缩略图', event: 'showImage', templet: function (d) {
                        return '<div ><img src="' + d.headImage + '" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },
                {field: 'creatorName', title: '发布人', minWidth: 120, align: 'left'},
                {title: '审核状态', templet: '#check-state', minWidth: 120, align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 200, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 120, align: 'center'}
            ]],
        });
    }

//  绑定点击事件
    table.on('tool(actionInfoTable)', function (obj) {
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
            lovexian.modal.confirm('删除爱有家信息', '确定删除吗？', function () {
                lovexian.del(proPath + '/admin/houseInfo/deleteById?id=' + obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
            layui.data('editHouseArticle', {key: 'editId', value: '1'});
            layui.data('articleHouseData', {key: 'data', value: data});


            if (obj.data.checkState == 0) {
                layer.msg("未通过审核前不能编辑！！", {time: 2000, icon: 5, shift: 6}, function () {
                }); //弹出时间，图标，特效
                return;


            }
            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑
            addActionInfo(obj.data, true);
        }
    });

    function deleteActions(houseIds) {
        lovexian.del(proPath + '/admin/houseInfo/BatchDelete/' + houseIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除成功');
            $query.click();
        });
    }

    function showContent(data) {

        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/houseInfo/preview/'+data.id,function (res) {
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

    // 监听显示不显示
    form.on('switch(switchShow)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message = ""
        if (show_value == 1) {

            message = "成功展示";
        } else {
            message = "取消成功";

        }
        var id = this.value;
        var data = {
            id: id,
            isShow: show_value
        }
        lovexian.post(proPath + 'admin/houseInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });

// 置顶不置顶
    form.on('switch(switchTop)', function (data) {
        var index_sms;
        var show_value = this.checked ? '1' : '0';
        var message = ""
        if (show_value == 1) {
            message = "置顶成功";
        } else {
            message = "取消置顶";
        }
        var id = this.value;
        var data = {
            id: id,
            isTop: show_value
        }
        lovexian.post(proPath + 'admin/houseInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

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

        return {
            houseTitle: $searchForm.find('input[name="actTitle"]').val().trim(),
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
    exports('theme/life/house/houseManage', {});
});