//通知信息

layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects', 'upload', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
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
    element.render('tab', 'actionTab');
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
        , type: 'datetime',
        trigger: 'click',
        zIndex: 99999999,

        position: 'fixed'
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
                    lovexian.alert.warn('请选择需要删除通知信息');
                } else {
                    lovexian.modal.confirm('删除通知信息', '确定删除通知信息？', function () {
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
            title: '新增通知',
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
        // 给表单赋值
        form.val("noticeContent", {
                "title": data.title,
                "content": data.content,

            }
        );
        if (data.isTop == 1) {
            $("input[type='checkbox'][name='isTop']").attr("checked", true);
        }

        // console.error(data.isTop)
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
            url: proPath + 'admin/noticeInfo/list?noticeType=1',
            type: 'GET',
            // toolbar: ' true', //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'title', title: '通知标题', minWidth: 120, align: 'left'},
                {field: 'content', title: '通知内容', minWidth: 200, align: 'left'},
                {title: '展示状态', templet: '#show-flag', align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},

                {field: 'publisher', title: '发布人', minWidth: 120, align: 'left'},
                {field: 'publishTime', title: '通知时间', minWidth: 200, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 120, align: 'center', fixed: 'right'}
            ]],
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
        lovexian.post(proPath + 'admin/noticeInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });


    form.on('switch(switchTop)', function (data) {

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
        lovexian.post(proPath + 'admin/noticeInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });


    /**
     * 表单校验
     */
    form.verify({
        title: function (val) {
            if (val == '') {
                return "通知标题不能为空";
            }
        },

        content: function (val) {
            if (val == '') {
                return "通知内容不能为空";
            }
        },


    });

//  监听每一行的工具条
    table.on('tool(actionInfoTable)', function (obj) {
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
            lovexian.modal.confirm('删除通知', '确定删除该通知信息吗？', function () {
                lovexian.del(proPath + 'admin/noticeInfo/deleteById?id=' + obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除通知成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {

            //编辑也跳转到actionAdd，根据类型判断是添加还是编辑

            agentId = obj.data.id;
            addActionInfo(obj.data);
        }
    });

    function deleteActions(agentIds) {
        lovexian.del(proPath + 'admin/noticeInfo/batchDelete/' + agentIds, null, function () {

            lovexian.alert.success('删除通知成功');
            $query.click();
        });
    }

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if (ifr_document) {
            //设置标题
            var title_str = data.title;
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html(title_str);
            //设置作者house
            var author_str = data.publisher;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置作者时间
            var publishTime = data.publishTime;
            var ifr_time = $(ifr_document).find(".article-top .article-yue");
            ifr_time.html(publishTime);
            //设置正文
            var content_str = data.content;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);


        }
    }


    /*取消按钮*/
    $('#cancelBtn').click(function () {
        layer.closeAll();

    })
    /**
     * 提交表单
     */
    form.on("submit(addProject)", function (data) {

        //var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});
        //实际使用时的提交信息
        var data;
        if (typeof agentId == "undefined" || agentId == null || agentId == "") {
            data = {
                title: $(".title").val(),  //中介姓名
                content: $(".content").val(), // 地址
                noticeType:1,
                isShow: $("input[type='radio'][name='openness2']:checked").val(),
                isTop: data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
            };
        } else {
            data = {
                id: agentId,
                title: $(".title").val(),
                content: $(".content").val(),
                noticeType:1,
                isShow: $("input[type='radio'][name='openness2']:checked").val(),
                isTop: data.field.isTop2 == "on" ? "1" : "0",    //是否置顶
            };
        }

        lovexian.post(proPath + 'admin/noticeInfo/saveOrUpdate', data, function () {
            lovexian.alert.success('保存成功，等待审核');
            layer.closeAll();
            $reset.click()
            return false;
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
            title: $searchForm.find('input[name="actTitle"]').val().trim(),
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
    exports('notice/notice', {});
});