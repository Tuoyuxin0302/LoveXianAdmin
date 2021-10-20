layui.define(['admin', 'form','baseSetting','lovexian','laytpl'], function (exports) {
    var $ = layui.$,
        form = layui.form,
        lovexian = layui.lovexian,
        $view = $('#lovexian-generator-configure'),
        $trimValue = $view.find('input[name="trimValue"]'),
        $trimValueItem = $trimValue.parents('.layui-form-item')
        ,proPath = layui.baseSetting.LoveXianConfig.proApi
        ,admin = layui.admin
        ,laytpl = layui.laytpl;
    //渲染页面
    var fakerData = ["faker"];
    var getTpl = updateBtnTpl.innerHTML
        , view = document.getElementById('updateBtnContainer');
    laytpl(getTpl).render(fakerData, function (html) {
        view.innerHTML = html;
    });
    var config = null;
    form.render();
    initFormValue();
    form.on("radio(isTrim)", function (data) {
        if (data.value === '1') {
            trimValueItemShow();
        } else {
            trimValueItemHide();
        }
    });

    function initFormValue() {
        admin.req({
            url: proPath+'/generatorConfig' //实际使用请改成服务端真实接口
            ,type : 'GET'
            ,done: function(res){
                //登入成功的提示与跳转
                lovexian.alert.success('获取配置信息成功', {
                    offset: '15px'
                    ,icon: 1
                    ,time: 1000
                });
                config = res.data;
                form.val("generator-configure-form", {
                    "id": config.id,
                    "author": config.author,
                    "basePackage": config.basePackage,
                    "entityPackage": config.entityPackage,
                    "mapperPackage": config.mapperPackage,
                    "mapperXmlPackage": config.mapperXmlPackage,
                    "servicePackage": config.servicePackage,
                    "serviceImplPackage": config.serviceImplPackage,
                    "controllerPackage": config.controllerPackage,
                    "isTrim": config.isTrim,
                    "trimValue": config.trimValue
                });
                if (config.isTrim === '1') {
                    trimValueItemShow();
                } else {
                    trimValueItemHide();
                }
            }
        });



    }

    function trimValueItemShow() {
        $trimValueItem.show();
        // $trimValue = config!=null?config.trimValue:"app_";
    }

    function trimValueItemHide() {
        form.val("generator-configure-form", {
            "trimValue": ''
        });
        $trimValueItem.hide();
    }

    form.on('submit(generator-configure-form-submit)', function (data) {
        if (lovexian.nativeEqual(data.field, config)) {
            lovexian.alert.error('数据未作任何修改！');
            return false;
        }
        lovexian.post(proPath + '/generatorConfig/update', data.field, function (r) {
            lovexian.alert.success('修改成功');
        });
        return false;
    });
    //对外暴露的接口
    exports('develop/configure', {});
});