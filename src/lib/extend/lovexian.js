layui.define(['admin','view','jquery','table','baseSetting','loadBar','notice','form'], function (exports) {
    var admin = layui.admin;
    var form = layui.form;
    var notice = layui.notice;
    var loadBar = layui.loadBar;
    var setter = layui.setter;
    var response = setter.response;
    var statusCode = response.statusCode;
    var proPath = layui.baseSetting.LoveXianConfig.proApi;
    var videoPath = layui.baseSetting.LoveXianConfig.videoPath;
    var layuiTable = layui.table;
    var view = layui.view;
    var element = layui.element;
    var $ = layui.jquery;
    var layer = layui.layer;

    var socket1;
    var socket2;

    var self = {};
    var windowWidth = $(window).width();

    // 初始化配置，同一样式只需要配置一次，非必须初始化，有默认配置
    notice.options = {
        closeButton:true,//显示关闭按钮
        debug:false,//启用debug
        positionClass:"toast-top-right",//弹出的位置,
        showDuration:"300",//显示的时间
        hideDuration:"1000",//消失的时间
        timeOut:"0",//停留的时间,0则不自动关闭
        extendedTimeOut:"1000",//控制时间
        showEasing:"swing",//显示时的动画缓冲方式
        hideEasing:"linear",//消失时的动画缓冲方式
        iconClass: 'toast-info', // 自定义图标，有内置，如不需要则传空 支持layui内置图标/自定义iconfont类名
        onclick: null, // 点击关闭回调
    };

    self.route = layui.router();
    self.view = view;
    self.api = layui.api;
    self.routeLeaveFunc = null;

    self.routeLeave = function (callback) {
        this.routeLeaveFunc = callback
    };

    self.prev = function (n) {
        if (n === undefined) n = -1;
        window.history.go(n)
    };

    self.isUrl = function (str) {
        return /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/.test(str)
    };

    self.validateLength = function (elem, maxLen, message) {
        console.log($(elem));
        let content = $(elem).val();
        if(content.length > maxLen){
            layer.tips(message,elem, {tips: [1, 'rgba(204,28,12,0.93)'],tipsMore: true,time:5000})
            return 1;
        }
        return 0;
    };

    self.helper = {};

    self.helper.getHtml = function(path) {
        var html = "";
        $.ajax({
            url : path,
            type :'GET',
            async : false,
            dataType :'html',
            success : function(data) {
                html = data;
            },
            error: function(xhr, status, error) {

            },
        });
        var htmlElem = $('<div>' + html + '</div>');
        return htmlElem.html();
    };
    self.modal = {};



    self.modal.base = function (msg, params) {
        params = params || {};
        params.titleIcoColor = params.titleIcoColor || '#5a8bff';
        params.titleIco = params.titleIco || 'exclaimination';
        params.title = params.title || [
            '<i class="layui-icon layui-icon-' +
            params.titleIco +
            '" style="font-size:12px;background:' +
            params.titleIcoColor +
            ';display:inline-block;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-radius:50%;margin-right:12px;"></i>' +
            params.titleValue,
            'background:#fff;border:none;font-weight:bold;font-size:16px;color:#08132b;padding-top:10px;height:36px;line-height:46px;padding-bottom:0;'
        ];
        params = $.extend(
            {
                skin: 'layui-layer-admin-modal ',
                area: [windowWidth <= 750 ? '60%' : '400px'],
                closeBtn: 0,
                shadeClose: false
            },
            params
        );
        layer.alert(msg, params);
    };

    // ----------------- 弹窗类 --------------------- //
    self.alert = {};
    function alertParams(msg, params) {
        params.time = 2000;
        params.shade = 0;
        params.btn = null;
        params.title = [
            '<i class="layui-icon layui-icon-' +
            params.titleIco +
            '" style="font-size:12px;background:' +
            params.titleIcoColor +
            ';display:inline-block;font-weight:600;position:relative;top:-2px;height:21px;line-height:21px;text-align:center;width:21px;color:#fff;border-radius:50%;margin-right:12px;"></i>' +
            (msg || '请填写提示信息'),
            'background:#fff;border:none;font-weight:500;font-size:14px;color:#08132b;margin-bottom:-50px;padding:16px;height:60px;line-height:14px;padding-bottom:0;'
        ];
        // params.offset = '40px';
        params.area = [windowWidth <= 750 ? '80%' : '400px'];
    }


    self.alert.success = function (msg, params) {
        params = params || {};
        params.titleIco = 'ok';
        params.titleIcoColor = '#30d180';
        alertParams(msg, params);
        self.modal.base('', params);
    };


    self.alert.warn = function (msg, params) {
        params = params || {};
        params.titleIco = 'exclaimination';
        params.titleIcoColor = '#ffc107';
        alertParams(msg, params);
        self.modal.base('', params);
    };


    self.alert.error = function (msg, params) {
        params = params || {};
        params.titleIco = 'close';
        params.titleIcoColor = '#ff5652';
        alertParams(msg, params);
        self.modal.base('', params);
    };


    self.alert.info = function (msg, params) {
        params = params || {};
        params.titleIco = 'infomation';
        params.titleIcoColor = '#2db7f5';
        alertParams(msg, params);
        self.modal.base('', params);
    };

    // ----------------- 模态框类 --------------------- //
    self.modal.confirm = function (title, msg, yes, no, params) {
        params = params || {};
        params.titleIco = 'exclaimination';
        params.titleIcoColor = '#ffc107';
        params.titleValue = title;
        params.shadeClose = false;
        params = $.extend({
            btn: ['确定', '取消']
            , yes: function (index, layero) {
                yes && (yes)();
                layer.close(index);
            }
            , btn2: function (index, layero) {
                no && (no)();
            }
        }, params);
        self.modal.base(msg, params);
    };

    self.modal.info = function (title, msg, yes, params) {
        params = params || {};
        params.titleIco = 'infomation';
        params.titleIcoColor = '#2db7f5';
        params.titleValue = title;
        params.shadeClose = false;
        params = $.extend({
            btn: ['确定']
            , yes: function (index, layero) {
                yes && (yes)();
                layer.close(index);
            }
        }, params);
        self.modal.base(msg, params);
    };

    self.modal.warn = function (title, msg, yes, params) {
        params = params || {};
        params.titleIco = 'exclaimination';
        params.titleIcoColor = '#ffc107';
        params.titleValue = title;
        params.shadeClose = false;
        params = $.extend({
            btn: ['确定']
            , yes: function (index, layero) {
                yes && (yes)();
                layer.close(index);
            }
        }, params);
        self.modal.base(msg, params);
    };

    self.modal.success = function (title, msg, yes, params) {
        params = params || {};
        params.titleIco = 'ok';
        params.titleIcoColor = '#30d180';
        params.titleValue = title;
        params.shadeClose = false;
        params = $.extend({
            btn: ['确定']
            , yes: function (index, layero) {
                yes && (yes)();
                layer.close(index);
            }
        }, params);
        self.modal.base(msg, params);
    };

    self.modal.error = function (title, msg, yes, params) {
        params = params || {};
        params.titleIco = 'close';
        params.titleIcoColor = '#ff5652';
        params.titleValue = title;
        params.shadeClose = false;
        params = $.extend({
            btn: ['确定']
            , yes: function (index, layero) {
                yes && (yes)();
                layer.close(index);
            }
        }, params);
        self.modal.base(msg, params);
    };


    // 数据表封装
    self.table = {};
    self.table.init = function (params) {
        var defaultSetting = {
            cellMinWidth: 80,
            page: true,
            skin: 'line',
            limit: 10,
            limits: [5, 10, 20, 30, 40, 100],
            autoSort: false,
            request: {
                pageName: 'pageNum',
                limitName: 'pageSize'
            },
            parseData: function (res) {
                // console.log(res);
                return {
                    "code": res.code === 200 ? 0 : res.code,
                    "count": res.data.total,
                    "data": res.data.rows
                }
            }
        };
        return layuiTable.render(
            $.extend({}, defaultSetting, params)
        );
    };

    // ajax get请求
    self.get = function (url,params, success) {
        var urlHash = window.location.hash;
        if (urlHash.indexOf('/monitor/redisInfo') == -1) {
            var index = layer.load(1, {
                shade: [0.5,'#000'], //0.1透明度的背景
                time: 2000
            });
        }
        admin.req({
            url: url //实际使用请改成服务端真实接口
            ,type : 'GET'
            ,data: params
            ,done: function(res){
                layer.close(index);
                resolveResponse(res, success);
            },
            error:function(error){
                if (urlHash.indexOf('/monitor/redisInfo') == -1) {
                    layer.close(index);
                }
                layer.close(index);
            }
        });
    };

    self.del = function (url,params, success) {
        var index = layer.load(1, {
            shade: [0.5,'#000'], //0.1透明度的背景
            time: 2000
        });
        admin.req({
            url: url //实际使用请改成服务端真实接口
            ,type : 'DELETE'
            ,data: params
            ,done: function(res){
                layer.close(index);
                resolveResponse(res, success);
            },
            error:function(error){
                layer.close(index);
            }
        });
    };

    self.flushUser = function() {
        admin.req({
            url: proPath+'/system/admin/'+layui.data(layui.setter.tableName)[layui.setter.USERNAME].username //实际使用请改成服务端真实接口
            ,type : 'GET'
            ,error:function(err){
                // layer.msg(err.responseJSON.message, {
                //     offset: '15px'
                //     ,icon: 2
                // });
            }
            ,done: function(res){
                // console.log(res.data.user);
                layui.data(setter.tableName, {
                    key: setter.USERNAME
                    ,value: res.data
                });
            }
        });
    }

    self.validateLoginStatus = function(res){
        if( res.code == statusCode.logout){
            self.modal.confirm('登录状态', '登录状态已失效，请退出系统重新登录', function () {
                layer.msg('即将退出...', {
                    time: 2000
                }, function(){
                    layer.close(index);
                    layui.admin.exit();
                });
            }, function () {

            });
        }
        if(res.code == statusCode.elselogin){
            self.modal.confirm('登录状态', '由于您的账号在其他地方登录了！此会话已失效', function () {
                layer.msg('即将退出...', {
                    time: 2000
                }, function(){
                    layer.close(index);
                    layui.admin.exit();
                });
            }, function () {

            });
        }
    }

    // ajax post请求
    self.post = function (url, params, success) {
        var index = layer.load(1, {
            shade: [0.5,'#000'], //0.1透明度的背景
            time: 2000
        });
        admin.req({
            url: url//实际使用请改成服务端真实接口
            ,type : 'POST'
            ,data: params
            ,done: function(res){
                layer.close(index);
                resolveResponse(res, success);
            },
            error:function(error){
                layer.close(index);
            }
        });
    };

    self.put = function (url, params, success) {
        var index = layer.load(1, {
            shade: [0.5,'#000'], //0.1透明度的背景
            time: 2000
        });
        admin.req({
            url: url//实际使用请改成服务端真实接口
            ,type : 'PUT'
            ,data: params
            ,done: function(res){
                layer.close(index);
                resolveResponse(res, success);
            },
            error:function(error){
                layer.close(index);
            }
        });
    };

    self.popup = function (url,title,data,done,end) {
        var width = $(window).width() - $("#my-side").width()+'px';
        var id = url.replace(new RegExp("/","gm"),"-");
        admin.popup({
            id: 'LAY-'+id,
            area:[width,'100%'],
            shadeClose:false,
            shade:0,
            resize:false,
            zIndex:19891014,
            offset:'rb',
            title: title,
            success: function(){
                view(this.id).render(url, data).then(function(){
                    //视图文件请求完毕，视图内容渲染前的回调
                }).done(function(){
                    //视图文件请求完毕和内容渲染完毕的回调
                    done();
                    form.render();
                });
            },
            end:function () {
                end();
            }
        });
    }

    //文章预览：365页面使用
    self.preview = function(url,success){
        var index = layer.load(1, {
            shade: [0.5,'#000'], //0.1透明度的背景
            time: 2000
        });
        admin.req({
            url: url
            ,type : 'GET'
            ,done: function(res){
                layer.close(index);
                resolveResponse(res, success);
            },
            error:function(error){
                layer.close(index);
            }
        });
    }

    // 文件下载
    self.download = function (url,params, fileName) {
        loadBar.start();
        url += '?' + parseParams(params);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader("Authentication",layui.data(setter.tableName)[setter.TOKENNAME]);
        xhr.responseType = "blob";
        xhr.onload = function () {
            if (this.status === 200) {
                loadBar.finish();
                var fileType = this.response.type;
                var blob = this.response;
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function (e) {
                    if ('msSaveOrOpenBlob' in navigator) { // IE，Edge
                        var base64file = e.target.result + '';
                        window.navigator.msSaveOrOpenBlob(createFile(base64file.replace('data:' + fileType + ';base64,', ''), fileType), fileName);
                    } else { // chrome，firefox
                        var link = document.createElement('a');
                        link.style.display = 'none';
                        link.href = e.target.result;
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();
                        $(link).remove();
                    }
                }
            } else {
                loadBar.error();
                self.alert.error('下载失败');
            }
        };
        xhr.send();
    };

    // 判断 a种的属性是否 b都有，并且弱相等
    self.nativeEqual = function (old, now) {
        var oldProps = Object.getOwnPropertyNames(old);
        var nowProps = Object.getOwnPropertyNames(now);
        for (var i = 0; i < nowProps.length; i++) {
            var propName = nowProps[i];
            if (!compare(old[propName], now[propName])) {
                console.log(propName);
                return false;
            }
        }
        return true;
    };

    function resolveResponse(r, f) {
        if (r.code === 200) {
            f(r) && (f)();
        } else if (r.code === 1001) {
            self.modal.info('登录失效', '登录已失效，请重新登录', function () {
                window.location.href = ctx + 'login';
            });
        } else if (r.code === 403) {
            self.alert.warn('对不起，您暂无该操作权限');
        } else {
            self.alert.error(r.message ? r.message : '操作失败');
        }
    }

    function compare(a, b) {
        if (a === '' && b === null) {
            return true;
        } else if (a === null && b === '') {
            return true;
        } else {
            return a == b;
        }
    }

    function parseParams(param, key, encode) {
        if (param == null) return '';
        var arr = [];
        var t = typeof (param);
        if (t === 'string' || t === 'number' || t === 'boolean') {
            arr.push(key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param));
        } else {
            for (var i in param) {
                var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                arr.push(parseParams(param[i], k, encode));
            }
        }
        return arr.join("&");
    }

    // 解析 BASE64文件内容 for IE，Edge
    function createFile(urlData, fileType) {
        var bytes = window.atob(urlData),
            n = bytes.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bytes.charCodeAt(n);
        }
        return new Blob([u8arr], {type: fileType});
    }

    self.uploadBigFileProgerssBar = function (progressbar,sceneId) {
        var socket;
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            console.log("您的浏览器支持WebSocket");
            //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
            socket = new WebSocket((proPath+"/websocket/" + layui.data(setter.cid)[setter.cid]+(sceneId!=null?sceneId:"")).replace("http", "ws"));
            //打开事件
            socket.onopen = function () {
                console.log("Socket 已打开");
                //socket.send("这是来自客户端的消息" + location.href + new Date());
            };
            //获得消息事件
            socket.onmessage = function (msg) {
                if(msg.data >=0&&msg.data<=100){
                    $("#progress").removeClass("layui-hide");
                    $(".uploadNewVideo").addClass("layui-btn-danger");
                    $(".uploadNewVideo").addClass(" layui-btn-disabled");
                    $(".uploadNewVideo").attr("disabled","disabled");
                    $(".uploadNewVideo").html("上传文件中，稍等");
                }
                //发现消息进入
                if (msg.data >= 10) {
                    if(msg.data >= 100){
                        $("#progress").addClass("layui-hide");
                        $(".uploadNewVideo").removeClass("layui-btn-danger");
                        $(".uploadNewVideo").addClass("layui-btn-normal");
                        $(".uploadNewVideo").removeClass("layui-btn-disabled");
                        $(".uploadNewVideo").removeAttr("disabled");
                        $(".uploadNewVideo").html("上传新文件");
                        self.alert.success("视频上传成功，进行编码处理中...");
                    }
                    element.progress(progressbar, msg.data + "%");
                }
            };
            //关闭事件
            socket.onclose = function () {
                console.log("Socket已关闭");
            };
            //发生了错误事件
            socket.onerror = function () {
                console.log("Socket发生了错误");
                //此时可以尝试刷新页面
            }
            // 离开页面时，关闭socket
            admin.on('hash('+layui.router().href+')', function (router) {
                socket.close();
            });
        }
        return socket;
    }

    self.websocketUtil = function () {
        console.log("全局websocket1")
        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            // console.log("您的浏览器支持WebSocket");
            //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
            socket1 = new WebSocket((proPath+"/websocket/" + layui.data(setter.cid)[setter.cid]).replace("http", "ws"));
            //打开事件
            socket1.onopen = function () {
                // console.log("Socket1 已打开");
                // var search = layui.router().search;
                // location.hash = search.redirect ? decodeURIComponent(search.redirect) : '/';
            };
            //获得消息事件
            socket1.onmessage = function (msg) {
                //发现消息进入
                var data = msg.data;
                if(data.indexOf("连接成功")!=-1){
                    console.log(data);
                    return;
                }
                let obj = JSON.parse(data);
                // console.log(obj);
                if(obj.type == '400'){
                    notice.error(obj.message);
                }
                if(obj.type == '200'){
                    notice.success(obj.message);
                }
                if(obj.type == '100'){
                    notice.warning(obj.message);
                }
                if(obj.type == '300'){
                    notice.info(obj.message);
                }
            };
            //关闭事件
            socket1.onclose = function () {
                console.log("Socket1已关闭");
            };
            //发生了错误事件
            socket1.onerror = function () {
                console.log("Socket1发生了错误");
                //此时可以尝试刷新页面
            };
        }
        return socket1;
    }


    self.websocketUtil2Video = function () {
        console.log("全局websocket2")

        if (typeof (WebSocket) == "undefined") {
            console.log("您的浏览器不支持WebSocket");
        } else {
            //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
            socket2 = new WebSocket((videoPath+"/videowebsocket/" + layui.data(setter.cid)[setter.cid]).replace("http", "ws"));
            //打开事件
            socket2.onopen = function () {
                // console.log("Socket2 已打开");
                //socket.send("这是来自客户端的消息" + location.href + new Date());
            };
            //获得消息事件
            socket2.onmessage = function (msg) {
                //发现消息进入
                var data = msg.data;
                if(data.indexOf("连接成功")!=-1){
                    console.log(data);
                    return;
                }
                let obj = JSON.parse(data);
                // console.log(obj);
                if(obj.type == '400'){
                    notice.error(obj.message);
                    var scene = $('#state'+obj.id);
                    if(scene != undefined ){
                        scene.attr("src","../../../LoveXianAdmin/src/images/fail.png");
                        let btn = $('#image'+obj.id);
                        if(btn.find("button:first") == undefined){
                            btn.after('<button type="button" style="margin-top: 5px;margin-left: 10px;" onclick="retryDecode('+(obj.id).toString()+')" class="layui-btn layui-btn-sm layui-btn-radius layui-btn-danger">转码重试</button>')
                        }
                    }
                }
                if(obj.type == '200'){
                    notice.success(obj.message);
                    var scene = $('#state'+obj.id);
                    if(scene != undefined ){
                        scene.attr("src","../../../../LoveXianAdmin/src/images/finish.png");
                    }
                }
                if(obj.type == '100'){
                    notice.warning(obj.message);
                }
                if(obj.type == '300'){
                    notice.info(obj.message);
                }
            };
            //关闭事件
            socket2.onclose = function () {
                // console.log("Socket2已关闭");
            };
            //发生了错误事件
            socket2.onerror = function () {
                // console.log("Socket2发生了错误");
                //此时可以尝试刷新页面
            };
            // // 离开系统时，关闭socket
            admin.on('hash('+layui.router().href+')', function (router) {
                if(layui.router().href == '/user/login'){
                    socket2.close();
                    socket1.close();
                }
            });
        }
        return socket2;
    }

    exports('lovexian', self)
});