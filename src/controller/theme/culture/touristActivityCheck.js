
layui.define(['element','dropdown', 'baseSetting','admin','formSelects', 'view','validate','baseSetting','lovexian','jquery', 'laydate', 'form', 'table', 'treeSelect','laytpl'], function(exports){
    var $ = layui.jquery,
        admin = layui.admin,
        view = layui.view,
        laydate = layui.laydate,
        setter = layui.setter,
        $view = $('#lovexian-touristActivity-check'),
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
    $searchForm = $view.find('form');//获取前台界面name的值
    $query = $view.find('div[name="query"]');
    $reset = $view.find('div[name="reset"]'),

        form.render();

    initTable();
    laydate.render({
        elem: '#createTime',
        range: true,
        trigger: 'click',
        position:'fixed'
    });
    element.tabChange('actionCheckTab',1);

    function initTable() {//初始化界面（下面的表格）
        tableIns = lovexian.table.init({
            elem: $('#touristCheckTable'),
            id: 'touristCheckTable',
            url: proPath + '/admin/sceneCheck/selectCheckByType?languageType=1&actTypeId='+1,//id根据组件而动，初始化表格
            type:'GET',
            headers:{
                Authentication :layui.data(setter.tableName)[setter.TOKENNAME]
            },
            cols: [[
                {type: 'checkbox'},
                {field: 'name', title: '景点名称 ', minWidth: 200,align:'left'},//对应后台idea的字段
                {field: 'creatorName', title: '发布人', minWidth: 200,align:'left'},
                {title: '审核状态', templet: '#check-state',align:'center'},
                {field: 'createTime', title: '创建时间', minWidth: 180, sort: true,align:'center'},
                {title: '操作', toolbar: '#tourist-option', minWidth: 140,align:'center'}
            ]],
        });
    }
    var sceneId;
    var checkId;
    table.on('tool(touristCheckTable)', function (obj) {
        var data = obj.data,
            layEvent = obj.event;
        sceneId=data.sceneId;
        checkId=data.checkId;
        if (layEvent === 'history') {
            lovexian.get(proPath+"/admin/sceneCheck/checkhistory",{"sceneId":data.sceneId},function (res) {
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
            checkActionInfo(data);
        }
    });
    function clearFormData() {
        $(".name").val("");
        $(".longitude").val("");
        $(".latitude").val("");
        $(".locationName").val("");
        $(".hotTime").val("");
        $(".coldTime").val("");
        $(".tickets").val("");
        $(".keywords").val("");
        $(".traffic").val("");
        $(".introduction").val("");
        $(".others").val("");
        $(".thumbnails").attr('src',"");
        //star=0;
    }
    function checkActionInfo(data){
        if(data.checkState!=0){
            layer.msg("只能审核一次哦!", {time:2000, icon:5, shift:6}, function(){
            }); //弹出时间，图标，特效
            return ;
        }
        var width = $(window).width() - $("#my-side").width()+'px';
        var height = $(window).height() - $("#my-header").height()+'px';
        layer.open({
            title : "审核景点信息",
            type : 1,
            skin:"layui-layer-admin-page",
            offset: 'rb',
            area :[width,height],
            content : $('#touristCheckForm'), //具体显示的check
            shade : false,
            resize:false,
            anim: 2,
            success : function(layero,index){
                var name = $('.name');
                var longitude = $('.longitude');
                var latitude = $('.latitude');
                var locationName = $('.locationName');//name用#,class 别名用.
                var hotTime=$('.hotTime');
                var coldTime=$('.coldTime');
                var tickets=$('.tickets');
                var introduction=$('.introduction');
                var traffic=$('.traffic');
                var others=$('.others');
                var webSite = $(".website");
                name.val(data.name);
                longitude.val(data.locationLongitude);
                latitude.val(data.locationLatitude);
                locationName.val(data.locationName);
                hotTime.val(data.hotTime);
                coldTime.val(data.coldTime);
                tickets.val(data.tickets);
                webSite.val(data.webSite);
                introduction.val(data.introduction);
                traffic.val(data.traffic);
                others.val(data.others);
                $(".thumbnails").attr("src",data.thumbnails);
                data.isTop==1? $("input[type='checkbox'][name='isTopCheck']").attr("checked",true):
                    $("input[type='checkbox'][name='isTopCheck']").attr("checked",false);
                data.isShow==0 ? $("input[type='radio'][name='opennessCheck'][value='0']").attr("checked",true):
                    $("input[type='radio'][name='opennessCheck'][value='1']").attr("checked",true);
                form.render();
            },
            end:function () {
                clearFormData();
                $('#touristCheckForm').css("display","none");
            }
        })
    }

    function getQueryParams() {
        var createTimeFrom='',
            createTimeTo='',
            createTime = $searchForm.find('input[name="createTime"]').val();

        if (createTime) {
            createTimeFrom = createTime.split(' - ')[0];
            createTimeTo = createTime.split(' - ')[1];
        }
        return {
            name: $searchForm.find('input[name="name"]').val().trim(),
            createTimeFrom: createTimeFrom,
            createTimeTo: createTimeTo,
            delStatus: $searchForm.find("select[name='status']").val(),
            checkState: $searchForm.find("select[name='check']").val(),
        };
    }
    $query.on('click',function () {
        //QueryData();
        var params = getQueryParams();
        console.log(params);
        tableIns.reload({where: params});
    });

    $reset.on('click',function () {
        initTable();
    });
    /* function filterTime(val){
         if(val < 10){
             return "0" + val;
         }else{
             return val;
         }
     }*/
    form.on("radio(checkState)",function(data){
        if(data.elem.title == "审核拒绝"){
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #checkState").attr("lay-verify","required");
        }else{
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #checkState").removeAttr("lay-verify");
        }
    });
    form.on("submit(checkAct)",function(data){

        var data = {
            refuseReason : $("#refuseReason").val(),  //拒绝理由
            checkState : data.field.checkState,    //审核状态
            sceneId: sceneId,
            checkId: checkId
        };
        if(data.checkState == 2){
            if(data.refuseReason.trim() == ""){
                lovexian.alert.error("必须填写拒绝理由");
                return false;
            }
        }
        lovexian.get(proPath + 'admin/sceneCheck/check',data,function (res) {

            // if(res.status == '200'){
            //     lovexian.modal.confirm('审核', '审核完成，您可以通过手机扫码查看', function () {
            //         layer.open({
            //             type: 1,
            //             title :"手机扫码查看",
            //             skin: 'layui-layer-rim', //加上边框
            //             area: ['190px', '230px'], //宽高
            //             content: '<div id="qrcode-img"></div>',
            //             success : function(layero,index) {
            //                 $('#qrcode-img').empty();
            //                 new QRCode(document.getElementById("qrcode-img"), {
            //                     text: encodeURI(res.static_page),
            //                     width: 180,
            //                     height: 180,
            //                     colorDark : "#000000",
            //                     colorLight : "#ffffff",
            //                     correctLevel : QRCode.CorrectLevel.L
            //                 });
            //                 $('#qrcode-img').fadeIn(500);
            //             },
            //             end:function() {
            //                 var index = parent.layer.getFrameIndex(window.name);
            //                 parent.layer.close(index);
            //             }
            //         });
            //     },function () {
            //         var index = parent.layer.getFrameIndex(window.name);
            //         parent.layer.close(index);
            //     });
            // }else{
                lovexian.alert.success('审核完成');
            layui.index.render();
            layer.closeAll();
                // var index = parent.layer.getFrameIndex(window.name);
                // parent.layer.close(index);
            //}
            return false;
            // $('#lovexian-job').find('#query').click();
        });
        //window.parent.location.reload();
    })
    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
        return false;
    })
    //处理键盘事件 禁止后退键（Backspace）密码或单行、多行文本框除外
    function banBackSpace(e){
        var ev = e || window.event;//获取event对象
        var obj = ev.target || ev.srcElement;//获取事件源

        var t = obj.type || obj.getAttribute('type');//获取事件源类型

        //获取作为判断条件的事件类型
        var vReadOnly = obj.getAttribute('readonly');
        var vEnabled = obj.getAttribute('enabled');
        //处理null值情况
        vReadOnly = (vReadOnly == null) ? false : vReadOnly;
        vEnabled = (vEnabled == null) ? true : vEnabled;

        //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
        //并且readonly属性为true或enabled属性为false的，则退格键失效
        var flag1=(ev.keyCode == 8 && (t=="password" || t=="text" || t=="textarea")
            && (vReadOnly==true || vEnabled!=true))?true:false;

        //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
        var flag2=(ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea")
            ?true:false;

        //判断
        if(flag2){
            return false;
        }
        if(flag1){
            return false;
        }
    }
    //禁止后退键 作用于Firefox、Opera
    document.onkeypress=banBackSpace;
    //禁止后退键 作用于IE、Chrome
    document.onkeydown=banBackSpace;
    $('#cancelBtn').click(function(){
        layer.closeAll();

    })

    //对外暴露的接口
    exports('theme/culture/touristActivityCheck', {});
});