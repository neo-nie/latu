function CommonTools() {
    var _self = this;

    _self.vendor = function() {
        var obj = {
                webkit: "webkitTransform",
                Moz: "MozTransition",
                O: "OTransform"
            },
            style = document.body.style;
        for(key in obj) {
            if(obj[key] in style) {
                return [key, "-" + key.toLowerCase() + "-"];
            }
        }
    }();

    //陀螺仪支持检测
    _self.supportsOrientationChange = window.onorientationchange === null ? true : false;
    _self.orientationEventName = _self.supportsOrientationChange ? 'orientationchange' : 'resize';

    //touch事件支持检测
    _self.isTouch = 'ontouchstart' in window;
    _self.startEvent = "touchstart";
    _self.moveEvent = "touchmove";
    _self.endEvent = "touchend";
    if(!_self.isTouch) {
        _self.startEvent = "mousedown";
        _self.moveEvent = "mousemove";
        _self.endEvent = "mouseup";
    }

    //IOS检测
    _self.isMobileSafari = navigator.userAgent.match(/(ipad|iphone|ipod).*mobile.*Safari/i);

    _self.css = {
        translate3d: function(elem, x, y, z) {
            var str = "translate3d(" + x + "," + y + "," + z + ")";
            elem.style.WebkitTransform = str;
            elem.style.MozTransform = str;
            elem.style.OTransform = "translate(" + x + "," + y + ")"; //Opera 12.5- unsupported 3D
            elem.style.transform = str;
            return elem;
        },

        transitionOld: function(elem, cssProperty, duration, funStr, delay) {
            var str = cssProperty + " " + duration + "s " + funStr + " " + delay + "s ",
                time = (duration + delay) * 1000;
            elem.style.WebkitTransition = "-webkit-" + str;
            elem.style.MozTransition = "-moz-" + str;
            elem.style.OTransition = "-o-" + str;
            elem.style.transition = str;
            setTimeout(function() {
                elem.style.WebkitTransition = "";
                elem.style.MozTransition = "";
                elem.style.OTransition = "";
                elem.style.transition = "";
            }, time)
        },

        //设置transform css方法
        transform: function(elem, str) {
            elem.style[_self.vendor[0] + "Transform"] = str;
            return elem;
        },

        //设置transition css方法
        transition: function(elem) {
            var str = "";
            if(arguments.length > 1) {
                str = [].slice.call(arguments, 1).join(",");
            }
            elem.style[_self.vendor[0] + "Transition"] = str;
            return elem;
        }
    };

    _self.fn = {
        client: function(e, path) {
            var str = "client" + path;
            if(_self.isTouch) {
                _self.client = function(e, path) {
                    var str = "client" + path;
                    return e.targetTouches[0][str];
                }
                return e.targetTouches[0][str];
            } else {
                _self.client = function(e, path) {
                    var str = "client" + path;
                    return e[str];
                }
                return e[str];
            }
        },

        removeElement: function(elem) {
            return elem.parentNode != null ? elem.parentNode.removeChild(elem) : false;
        },

        addClass: function(elem, name){
            var cls = elem.className,
                classList = [];
            name = name.split(/\s+/g);
            for(var i = 0, l = name.length; i < l; i++) {
                if (cls.indexOf(name[i]) == -1) {
                    classList.push(name[i]);
                }
            }
            classList.length && (elem.className += (cls ? " " : "") + classList.join(" "))
            return elem;
        },

        removeClass: function(elem, name){
            if (name === undefined) {
                elem.className = '';
                return elem;
            }
            var classList = elem.className;
            name = name.split(/\s+/g);
            for(var i = 0, l = name.length; i < l; i++) {
                var regx = new RegExp('(^|\\s)' + name[i] + '(\\s|$)');
                classList = classList.replace(regx, " ");
            }
            elem.className = classList.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
            return elem;
        },

        tipBox: function(url) {
            var num = parseInt(localStorage.getItem("isFirst"));
            num = isNaN(num) ? 0 : num;
            if(_self.isMobileSafari && num < 3) {
                var tipBoxDom = document.createElement("div"),
                    img = document.createElement("img");
                tipBoxDom.className = "tipBox";
                tipBoxDom.appendChild(img);
                tipBoxDom.onclick = function() {
                    _self.transition(tipBoxDom, "opacity", 0.5, "ease", 0);
                    tipBoxDom.style.opacity = 0;
                    setTimeout(function() {
                        tipBoxDom.parentNode.removeChild(tipBoxDom);
                        localStorage.setItem("isFirst", ++num);
                    }, 500)
                }
                img.src = url;
                img.onload = function() {
                    document.body.appendChild(tipBoxDom);
                }
            }
        },

        LS: {
            createLS: function(table) {
                if(localStorage[table]) {
                    console.log("已存在");
                    return;
                }
                if(arguments[1]) {
                    localStorage[table] = JSON.stringify(arguments[1]);
                } else {
                    localStorage[table] = "";
                }
            },
            selectLS: function(str, table) {
                var data = localStorage[table];
                if(!data) {
                    console.warn("[selectLS]: localStorage[\"" + table + "\"] is undefined!");
                    return [[], []];
                }

                data = JSON.parse(data);

                var result = [[], []],
                    i = 0,
                    num = 0;
                if(str === "*") {
                    result[0] = data;
                    for(i = 0; i < data.length; i++) {
                        result[1].push(i);
                    }
                    return result;
                }
                var arr = str.split(","),
                    index = "",
                    value = "",
                    r1 = [],
                    r2 = [];
                for(i = 0; i < arr.length; i++) {
                    var j = 0;
                    index = arr[i].split("=")[0];
                    value = arr[i].split("=")[1];
                    if(i == 0) {
                        for(j = 0; j < data.length; j++) {
                            if(data[j][index] == value) {
                                r1.push(j);
                            }
                        }
                    } else {
                        for(j = 0; j < r1.length; j++) {
                            num = r1[j];
                            if(data[num][index] == value) {
                                r2.push(num);
                            }
                        }
                        r1 = r2;
                        r2 = [];
                    }
                }
                for(i = 0; i < r1.length; i++) {
                    num = r1[i];
                    result[0].push(data[num]);
                }
                result[1] = r1;
                return result;
            },
            deleteLS: function(str, table) {
                var data = localStorage[table];
                if(!data) {
                    console.warn("[deleteLS]: localStorage[\"" + table + "\"] is undefined!");
                    return;
                }

                data = JSON.parse(localStorage[table]);

                if(str === "*") {
                    localStorage.removeItem(table);
                    return;
                }

                var result = this.selectLS(str, table);
                for(var i = 0; i < result[1].length; i++) {
                    var num = result[1][i] - i;
                    data.splice(num, 1);
                }
                localStorage[table] = JSON.stringify(data);
            },
            insertLS: function(obj, table) {
                var data = JSON.parse(localStorage[table]);
                if(obj.push) {
                    for(var i = 0, length = obj.length; i < length; i++) {
                        data.push(obj[i]);
                    }
                } else {
                    data.push(obj);
                }
                localStorage[table] = JSON.stringify(data);
            },
            updateLS: function(str1, str2, table) {
                var data = JSON.parse(localStorage[table]),
                    result = this.selectLS(str2, table);
                if(result[1].length > 1) {
                    console.log("匹配结果大于1");
                    return;
                }
                var arr = str1.split(","),
                    key = result[1][0],
                    index = "",
                    value = "";
                for(var i = 0; i < arr.length; i++) {
                    index = arr[i].split("=")[0];
                    value = arr[i].split("=")[1];
                    data[key][index] = value;
                }
                localStorage[table] = JSON.stringify(data);
            }
        }
    }

    _self.ajax = {
        getJSONP: function(url, success, error) {
            var random = Math.random()*1E20,
                callbackName = "callbackJSONP" + random,
                script = document.createElement("script");
            window[callbackName] = function(data) {
                window.valueJSONP = data;
                delete window[callbackName];
            }
            script.className = "jsonp_" + random;
            script.src = url + (url.match(/\?$|\&$/) ? "" : "&") + "callback=window." + callbackName + "&__=" + random;
            document.body.appendChild(script);
            script.onload = function() {
                success(window.valueJSONP);
                script.parentNode.removeChild(script);
                delete window.valueJSONP;
            };
            script.onerror = function() {
                error();
            }
        },

        put: function(url) {
            var img = new Image();
            img.src = url + "&__=" + Math.random() * 1E20;
        }
    };

    _self.extend = function(target){
        [].slice.call(arguments, 1).forEach(function(source) {
            for (key in source)
                if (source[key] !== undefined)
                    target[key] = source[key]
        });
        return target;
    };

}

window.commonTools = new CommonTools();

