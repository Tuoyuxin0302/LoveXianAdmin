var canGetCookie = 0;//是否支持存储Cookie 0 不支持 1 支持

var CodeVal = 0;
Code();
function Code() {
    if(canGetCookie == 1){
        createCode("AdminCode");
        var AdminCode = getCookieValue("AdminCode");
        showCheck(AdminCode);
    }else{
        showCheck(createCode(""));
    }
}
function showCheck(a) {
    CodeVal = a;
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.font = "80px 'Hiragino Sans GB'";
    ctx.fillStyle = "#E8DFE8";
    ctx.fillText(a, 0, 100);
}
$(document).keypress(function (e) {
    // 回车键事件
    if (e.which == 13) {
        $('input[type="button"]').click();
    }
});
//粒子背景特效
$('body').particleground({
    dotColor: '#E8DFE8',
    lineColor: '#1b3273'
});
$('input[name="pwd"]').focus(function () {
    $(this).attr('type', 'password');
});
$('input[type="text"]').focus(function () {
    $(this).prev().animate({ 'opacity': '1' }, 200);
});
$('input[type="text"],input[type="password"]').blur(function () {
    $(this).prev().animate({ 'opacity': '.5' }, 200);
});
$('input[name="login"],input[name="pwd"]').keyup(function () {
    var Len = $(this).val().length;
    if (!$(this).val() == '' && Len >= 5) {
        $(this).next().animate({
            'opacity': '1',
            'right': '30'
        }, 200);
    } else {
        $(this).next().animate({
            'opacity': '0',
            'right': '20'
        }, 200);
    }
});

layui.use(['layer','admin', 'form', 'user','baseSetting'], function () {
    var $ = layui.$
        ,setter = layui.setter
        ,admin = layui.admin
        ,form = layui.form
        ,router = layui.router()
        ,search = router.search
        ,proPath = layui.baseSetting.LoveXianConfig.proApi;
    //非空验证
    $('input[type="button"]').click(function () {
        var login = $('.username').val();
        var pwd = $('.passwordNumder').val();
        var code = $('.ValidateNum').val();
        if (login == '') {
            ErroAlert('请输入您的账号');
            return false;
        } else if (pwd == '') {

            ErroAlert('请输入密码');
            return false;
        } else if (code == '' || code.length != 4) {
            ErroAlert('输入验证码');
            return false;

        } else {
            if(code.toUpperCase() != CodeVal.toUpperCase()){
                ErroAlert("验证码错误！");
                return false;
            }
            //认证中..
            fullWebScreen();

            $('.login').addClass('test'); //倾斜特效
            setTimeout(function () {
                $('.login').addClass('testtwo'); //平移特效
            }, 300);
            setTimeout(function () {
                $('.authent').show().animate({ right: -320 }, {
                    easing: 'easeOutQuint',
                    duration: 600,
                    queue: false
                });
                $('.authent').animate({ opacity: 1 }, {
                    duration: 200,
                    queue: false
                }).addClass('visible');
            }, 500);


            //登陆
            var JsonData = { username: login, password: pwd};

            admin.req({
                url: proPath+'/system/login/login' //实际使用请改成服务端真实接口
                ,type : 'POST'
                ,data: JsonData
                ,error:function(err){

                }
                ,done: function(res){
                    if(res.status == "ok"){
                        //请求成功后，写入 access_token
                        layui.data(setter.tableName, {
                            key: setter.request.tokenName
                            ,value: res.data.token
                        });
                        layui.data(setter.tableName, {
                            key: setter.USERNAME
                            ,value: res.data.user
                        });
                        layui.data(setter.tableName,{
                            key: setter.PERMISSION
                            ,value: res.data.permissions
                        });
                        layui.data(setter.tableName,{
                            key: setter.ROLE
                            ,value: res.data.roles
                        });

                        layui.data(setter.loginStatus,{
                            key: setter.loginStatus
                            ,value: true
                        });
                    }
                    //认证完成
                    setTimeout(function () {
                        $('.authent').show().animate({ right: 90 }, {
                            easing: 'easeOutQuint',
                            duration: 600,
                            queue: false
                        });
                        $('.authent').animate({ opacity: 0 }, {
                            duration: 200,
                            queue: false
                        }).addClass('visible');
                        $('.login').removeClass('testtwo'); //平移特效
                    }, 2000);
                    setTimeout(function () {
                        $('.authent').hide();
                        $('.login').removeClass('test');
                        //登录成功
                        if(res.status == "ok"){
                            $('.login div').fadeOut(100);
                            $('.success').fadeIn(1000);
                            $('.success span').html(res.message+",马上跳转~");
                            $('#headImage').attr('src', '../src/style/images/avatar/'+layui.data(layui.setter.tableName)[layui.setter.USERNAME].avatar);
                        }else{
                             ErroAlert(res.message);
                        }
                    }, 2400);
                    if(res.status == "ok"){
                        setTimeout(function(){
                            location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/';
                        },4000);
                    }
                }
            });
        }
        return false;
    })
});
var fullWebScreen = function () {
    elem = document.body;
    if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.requestFullScreen) {
        elem.requestFullscreen();
    } else {
        //浏览器不支持全屏API或已被禁用
    }
}
