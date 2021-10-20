layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-news'),
        $query = $view.find('#query'),
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
    initTable();
    element.render('tab','newsTab');
    element.on('tab(newsTab)', function (data) {
        initTable();

    });

    //渲染权限
    var fakerData = ["faker"];
    var getTpl = newsMoreTpl.innerHTML
        , view = document.getElementById('newsMoreContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });

    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position: 'fixed'
    });

    initTable();

    element.tabChange('newsTab', 1);

    dropdown.render({
        elem: $view.find('.news-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('newsInfoTable');
            if (name === 'add') {
                addNewsInfo();
                $reset.click();
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的文章');
                } else {
                    lovexian.modal.confirm('删除文章', '确定删除该篇文章？', function () {
                        var newsIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            newsIds.push(item.id)
                        });

                        deleteNews(newsIds.join(','));
                        $reset.click();
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '添加文章',
            perms: 'newsInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'newsInfo:delete'
        }]
    });

    //新增新闻信息
    function addNewsInfo(data, isEdit) {
        lovexian.popup("news/newsAdd", isEdit ? "编辑文章" : "添加文章", $.extend(data, {isEdit: isEdit}), function () {
            if (isEdit) {
                    //编辑文章的回显操作
                    form.val('newsContent', {
                        'newsTitle': data.newsTitle,
                        'newsAbstract': data.newsAbstract
                    });
                    $('#newsTypeId').val(data.typeId);
                    $("#languageTypeId").val(data.languageType);
                    data.isTop == 0 ? $('input[name="isTop"]').attr('checked', null) : "";
                    $("input[name='openness'][value=" + data.isShow + "]").prop("checked", true);
                    $('.thumbImg').attr("src", data.newsHeadPhoto);
                }
                layui.use('news/newsAdd', layui.factory('news/newsAdd'));
            },
            function () {
                // $query.click();
            });
    }

    //初始化信息表格
    function initTable(isQuery) {
        tableIns = lovexian.table.init({
            elem: $('#newsInfoTable'),
            id: 'newsInfoTable',
            url: proPath + '/admin/newsInfo/list',
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'newsTitle', title: '新闻标题', minWidth: 200, align: 'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200, align: 'left'},
                {title: '审核状态', templet: '#check-state', align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {title: '新闻类别', templet: '#news-type', align: 'center'},
                {field: 'updateTime', title: '更新时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#news-option', minWidth: 140, align: 'center'}
            ]]
        });
    }

    form.on("switch(switchShow)", function (data) {
        var id = this.value;
        var show_value = this.checked ? 1 : 0;
        var message = "";
        if (show_value == 1) {
            message = "设置成功";
        }
        else if (show_value == 0) {
            message = "取消显示"
        }
        data = {
            id: id,
            isShow: show_value,
        };
        lovexian.post(proPath + 'admin/newsInfo/update', data, function () {
            lovexian.alert.success(message);
        })
    });

    form.on("switch(switchTop)", function (data) {
        var id = this.value;
        var show_value = this.checked ? 1 : 0;
        var message = "";
        if (show_value == 1) {
            message = "设置成功";
        }
        else if (show_value == 0) {
            message = "取消置顶"
        }
        data = {
            id: id,
            isTop: show_value,
        };
        lovexian.post(proPath + 'admin/newsInfo/update', data, function () {
            lovexian.alert.success(message);
        })
    });

    //每条信息最后的三个按钮操作键
    table.on('tool(newsInfoTable)', function (obj) {
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
                };
                pre_phone.css(css_str);
            }
        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除管理员', '确定删除该篇文章吗？', function () {
                var newsId = data.id;
                lovexian.del(proPath + '/admin/newsInfo/deleteById?id=' + newsId, null, function () {
                    lovexian.alert.success('删除文章成功');
                    $reset.click();
                });
            });
        }
        if (layEvent === 'edit') {
            //编辑新闻信息
            if (obj.data.checkState == 0) {
                layer.msg("未通过审核前不能编辑！！", {time: 2000, icon: 5, shift: 6}, function () {
                }); //弹出时间，图标，特效
                return;
            }
            addNewsInfo(data, true);
        }
    });

    //批量删除文章的方法
    function deleteNews(newsIds) {
        lovexian.del(proPath + '/admin/newsInfo/BatchDelete/' + newsIds, null, function () {
            console.log("success");
            lovexian.alert.success('删除文章成功');
            $reset.click();
        });
    }

    //查看文章详情
    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/newsInfo/preview/'+data.id,function (res) {
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

    //按条件查找
    function QueryTable() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        params = {
            newsTitle: $searchForm.find('input[name="newsTitle"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delState: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
        tableQuery = lovexian.table.init({
            elem: $('#newsInfoTable'),
            id: 'newsInfoTable',
            url: proPath + 'admin/newsInfo/list',
            type: 'GET',
            where: params,
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'newsTitle', title: '新闻标题', minWidth: 200, align: 'left'},
                {field: 'creatorName', title: '发布人', minWidth: 200, align: 'left'},
                {title: '审核状态', templet: '#check-state', align: 'center'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {title: '新闻类别', templet: '#news-type', align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#news-option', minWidth: 140, align: 'center'}
            ]]
        });
    }


    $query.on('click', function () {
        QueryTable();
    });

    $reset.on('click', function () {
        $("#news-table-form")[0].reset();
        initTable();
    });

    //对外暴露的接口
    exports('news/news', {});
});