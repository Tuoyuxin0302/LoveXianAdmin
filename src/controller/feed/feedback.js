//反馈信息

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
                addActionInfo({});
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除反馈信息');
                } else {
                    lovexian.modal.confirm('删除反馈信息', '确定删除反馈信息？', function () {
                        var agentIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            agentIds.push(item.id)
                        });
                        deleteActions(agentIds.join(','));
                    });
                }
            }

        },
        options: [ {
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
        form.val("detailFeedback", {
                "publisher": data.publisher,
                "content": data.content,
            }
        );
        if (data.isTop == 1) {
            $("input[type='checkbox'][name='isTop']").attr("checked", true);
        }

        data.isShow === 0 ? $("input[type='radio'][name='openness2'][value='0']").attr("checked", true) :
            $("input[type='radio'][name='openness2'][value='1']").attr("checked", true);
        form.render();
    }


// 表格初始化
    function initTable() {
        tableIns = lovexian.table.init({
            // 渲染哪个表格
            elem: $('#actionInfoTable'),
            id: 'actionInfoTable',
            url: proPath + 'admin/noticeInfo/list?noticeType=0',
            type: 'GET',
            // toolbar: ' true', //开启工具栏，此处显示默认图标，可以自定义模板，详见文档
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'publisher', title: '用户', minWidth: 120, align: 'left'},
                {field: 'content', title: '反馈内容', minWidth: 200, align: 'left'},

                {field: 'publishTime', title: '反馈时间', minWidth: 200, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 120, align: 'left', fixed: 'right'}
            ]],
        });
    }

//  监听每一行的工具条
    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;

        if (layEvent === 'detail') {
            vieworgInfo(data);

        }
        if (layEvent === 'del') {
            lovexian.modal.confirm('删除用户反馈', '确定删除该反馈信息吗？', function () {
                lovexian.del(proPath + 'admin/noticeInfo/deleteById?id=' + obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除反馈成功');
                    $query.click();
                });
            });
        }

    });


    /**
     * 查看详情
     * @param data
     */
    function vieworgInfo(data) {
        var width = $(window).width() - $("#my-side").width()+ 'px';
        var height = $(window).height() - $("#my-header").height() + 'px';
        layer.open({
            title: "查看反馈",
            type: 1,
            skin: "layui-layer-admin-page",
            offset: 'rb',
            area: [width, height],
            content: $('#detailFeedback'),
            shade: false,
            resize: false,
            anim: 2,
            zIndex: layer.zIndex,
            success: function (layero, index) {
                $(".publisher").attr("disabled",true);
                $(".content").attr("disabled",true);
                $(".publicTime").attr("disabled",true);
                setFormData(data);
            },
            end: function (layero, index) {
                $("#detailFeedback").css("display","none");
            },
        })
    }
    function deleteActions(agentIds) {
        lovexian.del(proPath + 'admin/noticeInfo/batchDelete/' + agentIds, null, function () {

            lovexian.alert.success('删除通知成功');
            $query.click();
        });
    }

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        if (ifr_document) {
            var ifr_title = $(ifr_document).find(".article-title .title");
            ifr_title.html("这是一个反馈");
            //设置反馈者
            var author_str = data.publisher;
            var ifr_author = $(ifr_document).find(".article-top .article-time");
            ifr_author.html(author_str);
            //设置反馈时间
            var publishTime = data.publishTime;
            var ifr_time = $(ifr_document).find(".article-top .article-yue");
            ifr_time.html(publishTime);
            //反馈内容
            var content_str = data.content;
            var ifr_content = $(ifr_document).find(".article-content");
            ifr_content.html(content_str);


        }
    }


    /*取消按钮*/
    $('#cancelBtn').click(function () {
        layer.closeAll();

    })

    function getQueryParams() {
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
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
    exports('feed/feedback', {});
});