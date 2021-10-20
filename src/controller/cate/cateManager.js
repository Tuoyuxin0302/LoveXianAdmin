layui.define(['element', 'dropdown', 'baseSetting', 'admin', 'formSelects', 'view', 'validate', 'baseSetting', 'lovexian', 'jquery', 'laydate', 'form', 'table', 'treeSelect', 'laytpl'], function (exports) {
    var $ = layui.jquery,
        admin = layui.admin,
        adminView=layui.view,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-cate'),
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
    //对cateTab进行初始化渲染
    element.render('tab', 'cateTab');
    element.on('tab(cateTab)', function (data) {
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
    element.tabChange('cateTab', 1);
    dropdown.render({
        elem: $view.find('.action-more'),
        click: function (name, elem, event) {
            var checkStatus = table.checkStatus('actionInfoTable');
            if (name === 'add') {
                addActionInfo();
            }
            if (name === 'delete') {
                if (!checkStatus.data.length) {
                    lovexian.alert.warn('请选择需要删除的美食');
                } else {
                    lovexian.modal.confirm('删除美食', '确定删除该篇美食？', function () {
                        var cateIds = [];
                        layui.each(checkStatus.data, function (key, item) {
                            cateIds.push(item.id)
                        });
                        deleteActions(cateIds.join(','));
                    });
                }
            }

        },
        options: [{
            name: 'add',
            title: '新增美食',
            perms: 'actionInfo:add'
        }, {
            name: 'delete',
            title: '批量删除',
            perms: 'actionInfo:delete'
        }]
    });

    function addActionInfo(data, isEdit) {
        lovexian.popup("cate/cateAdd", isEdit ? "编辑文章" : "添加文章", $.extend(data, {isEdit: isEdit}), function () {
                if (isEdit) {
                    //编辑文章的回显操作
                    form.val('cateContent', {
                        'cateTitle': data.cateTitle,
                        'cateSubtitle': data.cateSubtitle,
                        'cateAbstract': data.cateAbstract
                    });
                    data.isTop == 0 ? $('input[name="isTop"]').attr('checked', null) : "";
                    $("input[name='isShow'][value=" + data.isShow + "]").prop("checked", true);
                    $('.thumbImg').attr("src", data.headImage);
                }
                layui.use('cate/cateAdd', layui.factory('cate/cateAdd'));
            },
            function () {
                $query.click();
            });
    }


    function initTable() {

        tableIns = lovexian.table.init({
            // 渲染哪个表格
            elem: $('#actionInfoTable'),
            id: 'actionInfoTable',
            url: proPath + 'admin/cateInfo/list?languageType=1',
            type: 'GET',
            headers: {
                Authentication: layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'cateTitle', title: '美食标题', minWidth: 200, align: 'left'},
                {
                    field: 'headImage', title: '缩略图', event: 'showImage', templet: function (d) {
                        return '<div ><img src="' + d.headImage + '" alt="" width="90px" height="70px"></a></div>';
                    },
                    width: 150, align: 'left'
                },

                {field: 'creatorName', title: '发布人', maxWidth: 80, align: 'left'},
                {title: '审核状态', templet: '#check-state', width: 100, align: 'center'},
                {title: '展示状态', templet: '#show-flag', width:100,align: 'center'},
                {title: '置顶状态', templet: '#top-flag', align: 'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true, align: 'center'},
                {title: '操作', toolbar: '#action-option', minWidth: 140, align: 'center'}
            ]],
        });

    }


//  绑定点击事件
    table.on('tool(actionInfoTable)', function (obj) {
        var data = obj.data,

            layEvent = obj.event;
        if (obj.event === 'showImage') {
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
            lovexian.modal.confirm('删除美食信息', '确定删除该美食吗？', function () {
                lovexian.del(proPath + '/admin/cateInfo/deleteById?id=' + obj.data.id, null, function () {
                    console.log("success");
                    lovexian.alert.success('删除美食成功');
                    $query.click();
                });
            });
        }
        if (layEvent === 'edit') {
            layui.data('editCate', {key: 'editId', value: '1'});
            layui.data('cateData', {key: 'data', value: data});
            if (obj.data.checkState == 0) {
                layer.msg("未通过审核前不能编辑！！", {time: 2000, icon: 5, shift: 6}, function () {
                }); //弹出时间，图标，特效
                return;
            }
            //编辑也跳转到cateAdd，根据类型判断是添加还是编辑
            addActionInfo(obj.data, true);
        }

        //上传美食视频开始
        if (layEvent === 'video') {
            let cateId = obj.data.id;
            var width = $(window).width() - $("#my-side").width()+'px';
            var height = $(window).height() - $("#my-header").height()+'px';
            var socket;
            admin.popup({
                id: 'LAY-theme-culture-cateVideos',
                area:[width,height],
                shadeClose:false,
                shade:0,
                title: '美食视频',
                success: function(){
                    adminView(this.id).render('cate/cateVideos', {
                        cateId: obj.data.id,
                    }).then(function(){
                        //视图文件请求完毕，视图内容渲染前的回调
                    }).done(function(){
                        //视图文件请求完毕和内容渲染完毕的回调
                        layui.use('cate/cateVideos', layui.factory('cate/cateVideos'));
                        socket = lovexian.uploadBigFileProgerssBar('progressBar',$('#cateId').val());
                    });
                },
                end: function () {
                    console.log("弹出层关闭了");
                    socket.close();
                }
            });
        }//上传美食视频结束
    });


    form.on('switch(switchShow)', function (data) {

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
        lovexian.post(proPath + 'admin/cateInfo/saveOrUpdate', data, function (res) {

            lovexian.alert.success(message);
        });
    });

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
        lovexian.post(proPath + 'admin/cateInfo/showOrTop', data, function () {

            lovexian.alert.success(message);

        });

    });


    function deleteActions(cateIds) {
        lovexian.del(proPath + 'admin/cateInfo/BatchDelete/' + cateIds, null, function () {
            lovexian.alert.success('删除美食成功');
            $query.click();
        });
    }

    function showContent(data) {
        var ifr_document = document.getElementById("preview-html").contentWindow.document;
        lovexian.preview(proPath+'/admin/cateInfo/preview/'+data.id,function (res) {
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
        var createTimeFrom = '',
            createTimeTo = '',
            createTime = $searchForm.find('input[name="createTime"]').val();
        //alert(createTime);
        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }

        return {
            cateTitle: $searchForm.find('input[name="actTitle"]').val().trim(),
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
    exports('cate/cateManager', {});
});