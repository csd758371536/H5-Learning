;
(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var dpr = 0;
    var scale = 0;
    var tid;
    var flexible = lib.flexible || (lib.flexible = {});

    if (metaEl) {
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);
        if (match) {
            scale = parseFloat(match[1]);
            dpr = parseInt(1 / scale);
        }
    } else if (flexibleEl) {
        var content = flexibleEl.getAttribute('content');
        if (content) {
            var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
            var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
            if (initialDpr) {
                dpr = parseFloat(initialDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
            if (maximumDpr) {
                dpr = parseFloat(maximumDpr[1]);
                scale = parseFloat((1 / dpr).toFixed(2));
            }
        }
    }

    if (!dpr && !scale) {
        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;
        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)) {
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;
    }

    // 字体的大小不推荐用rem作为单位。
    // 所以对于字体的设置，仍旧使用px作为单位，并配合用data-dpr属性来区分不同dpr下的的大小。
    // 设计稿通常使用iphone6作为标准，宽度一般为750px，dpr为2，量一下font-size，这样就知道dpr为1的设备了
    /*div {
        width: 1rem; 
        height: 0.4rem;
        font-size: 12px; // 默认写上dpr为1的fontSize
    }

    [data-dpr="2"] div {
        font-size: 24px;
    }

    [data-dpr="3"] div {
        font-size: 36px;
    }*/

    // @mixin font-dpr ($font-size) {
    //     font-size: $font-size / 2;
    //     [data-dpr=2] & {
    //         font-size: $font-size;
    //     }
    //     [data-dpr=3] $ {
    //         font-size: $font-size * 3 / 2;
    //     }
    // }

    // // 引用
    // h1 {
    //     @include font-dpr([dpr为2时候的值])
    // }

    // 处理安卓的情况
    // if (!dpr && !scale) {
    //     //devicePixelRatio这个属性是可以获取到设备的dpr
    //     var devicePixelRatio = win.devicePixelRatio;
    //     //判断dpr是否为整数
    //     var isRegularDpr = devicePixelRatio.toString().match(/^[1-9]\d*$/g);
    //     if (isRegularDpr) {
    //     // 对于是整数的dpr，对dpr进行操作
    //      if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
    //         dpr = 3;
    //     } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
    //         dpr = 2;
    //     } else {
    //         dpr = 1;
    //     }
    // } else {
    //     // 对于其他的dpr，人采用dpr为1的方案
    //     dpr = 1;
    //     }
    //     scale = 1 / dpr;
    // }

    docEl.setAttribute('data-dpr', dpr);
    if (!metaEl) {
        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    // 插件计算的方案
    function refreshRem(){
        var width = docEl.getBoundingClientRect().width;
        if (width / dpr > 540) {
            width = 540 * dpr;
        }
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
        flexible.rem = win.rem = rem;
    }

    // css计算的方案
    // function refreshRem() {
    //     var width = docEl.getBoundingClientRect().width;
    //     // 适配平板
    //     if (width / dpr > 750) {
    //         width = 750 * dpr;
    //     }
    //     var rem = 100 * (width / 750);
    //     docEl.style.fontSize = rem + 'px';
    //     flexible.rem = win.rem = rem;
    // }

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 300);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }


    refreshRem();

    flexible.dpr = win.dpr = dpr;
    flexible.refreshRem = refreshRem;
    flexible.rem2px = function(d) {
        var val = parseFloat(d) * this.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    };
    flexible.px2rem = function(d) {
        var val = parseFloat(d) / this.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    };
})(window, window['lib'] || (window['lib'] = {}));