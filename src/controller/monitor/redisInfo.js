layui.define(['apexcharts', 'util', 'jquery', 'lovexian','baseSetting'], function (exports) {
    var $ = layui.jquery,
        util = layui.util,
        lovexian = layui.lovexian,
        proPath = layui.baseSetting.LoveXianConfig.proApi,
        setter = layui.setter,
        $view = $('#lovexian-redis-info'),
        $redisInfoTable = $('#redisInfoTable');

    $view.find('a#continue').on('click', function () {
        layer.msg('即将退出...', {
            time: 2000 //2秒关闭（如果不配置，默认是3秒）
        }, function(index){
            layer.close(index);
            layui.admin.exit();
        });
    });

    lovexian.get(proPath+'/system/redis/info',null,function(res) {
        var data = res.data;
        for(var i=0;i<data['length'];i++){
            $redisInfoTable.append(
                '<tr">'+
                '<td>'+data[i].key+'</td>'+
                '<td>'+data[i].description+'</td>'+
                '<td>'+data[i].value+'</td>'+
                '</tr>'
            );
        }
    });

    var minMemory = 1e10;
    var maxMemory = -1e10;
    var currentTime = new Date().getTime();

    var memoryData = [
        {"x": util.toDateString(new Date(currentTime - 1000 * 16), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 14), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 12), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 10), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 8), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 6), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 4), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 2), 'mm:ss'), "y": 0.000}
    ];

    var redisMemoryInterval = getRedisMemoryInterval();

    function getRedisMemoryInterval() {
        // console.log(layui.data(setter.loginStatus)[setter.loginStatus]);
        return setInterval(function () {
            var urlHash = window.location.hash;
            if(layui.data(setter.loginStatus)[setter.loginStatus] == false){
                clearInterval(redisMemoryInterval);
                return;
            }
            if (urlHash.indexOf('/monitor/redisInfo') !== -1) {
                lovexian.get(proPath + '/system/redis/memoryInfo',null, function (r) {
                    var currentMemory = (r.data.used_memory / 102.4).toFixed(3);
                    if (currentMemory < minMemory) {
                        minMemory = currentMemory;
                    }
                    if (currentMemory > maxMemory) {
                        maxMemory = currentMemory;
                    }
                    memoryData.push({
                        "x": util.toDateString(new Date(), 'mm:ss'),
                        "y": currentMemory
                    });
                    if (memoryData.length > 8) {
                        memoryData.shift();
                    }
                    redisMemoryChart.updateSeries([{
                        data: memoryData,
                        yaxis: {
                            min: minMemory,
                            max: maxMemory
                        }
                    }]);
                });
            }
        }, 2e3);
    }

    var redisMemoryChartOptions = {
        chart: {
            height: 320,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            axisTicks: {
                show: false
            },
            axisBorder: {
                show: true,
                color: '#f1f1f1'
            }
        },
        series: [{
            name: '实时内存占用（kb)',
            data: memoryData
        }],
        markers: {
            size: 0
        },
        legend: {
            show: false
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'],
                opacity: 0.2
            },
            borderColor: '#f1f3fa'
        }
    };

    var redisMemoryChart = new ApexCharts(
        document.querySelector("#redisMemoryChart"),
        redisMemoryChartOptions
    );

    redisMemoryChart.render();


    var minKeySize = 1e10;
    var maxKeySize = -1e10;

    var KeySizeData = [
        {"x": util.toDateString(new Date(currentTime - 1000 * 16), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 14), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 12), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 10), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 8), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 6), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 4), 'mm:ss'), "y": 0.000},
        {"x": util.toDateString(new Date(currentTime - 1000 * 2), 'mm:ss'), "y": 0.000}
    ];

    var redisKeySizeInterval = getRedisKeySizeInterval();

    function getRedisKeySizeInterval() {
        // console.log(layui.data(setter.loginStatus)[setter.loginStatus])
        return setInterval(function () {
            if(layui.data(setter.loginStatus)[setter.loginStatus] == false){
                $view.find('a#continue').parents('.lovexian-hide').show();
                return;
            }
            var urlHash = window.location.hash;
            if (urlHash.indexOf('/monitor/redisInfo') !== -1) {
                lovexian.get(proPath + '/system/redis/keysSize',null, function (r) {
                    var currentKeySize = r.data.dbSize;
                    if (currentKeySize < minKeySize) {
                        minKeySize = currentKeySize;
                    }
                    if (currentKeySize > maxKeySize) {
                        maxKeySize = currentKeySize;
                    }
                    KeySizeData.push({
                        "x": util.toDateString(new Date(), 'mm:ss'),
                        "y": currentKeySize
                    });
                    if (KeySizeData.length > 8) {
                        KeySizeData.shift();
                    }
                    redisKeySizeChart.updateSeries([{
                        data: KeySizeData,
                        yaxis: {
                            min: minKeySize,
                            max: maxKeySize
                        }
                    }]);
                });
            }
        }, 2e3);
    }

    var redisKeySizeChartOptions = {
        chart: {
            height: 320,
            type: 'area',
            animations: {
                enabled: true,
                easing: 'linear',
                dynamicAnimation: {
                    speed: 2000
                }
            },
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        colors: ['#775DD0'],
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        series: [{
            name: '实时key个数（个)',
            data: KeySizeData
        }],
        xaxis: {
            axisTicks: {
                show: false
            },
            axisBorder: {
                show: true,
                color: '#f1f1f1'
            }
        },
        markers: {
            size: 0
        },
        legend: {
            show: false
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'],
                opacity: 0.2
            },
            borderColor: '#f1f3fa'
        }
    };

    var redisKeySizeChart = new ApexCharts(
        document.querySelector("#redisKeySizeChart"),
        redisKeySizeChartOptions
    );

    redisKeySizeChart.render();

    lovexian.routeLeave(function (route, nextPath, next) {
        clearInterval(redisMemoryInterval);
        clearInterval(redisKeySizeInterval);
        next();
        $view.find('a#continue').parents('.lovexian-hide').show();
    })

    //对外暴露的接口
    exports('monitor/redisInfo', {});
});