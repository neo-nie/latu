(function() {
    var translate3d = commonTools.css.translate3d,
        transition = commonTools.css.transition,
        transform = commonTools.css.transform,
        vendor = commonTools.vendor,
        client = commonTools.fn.client,
        getJSONP = commonTools.ajax.getJSONP,
        put = commonTools.ajax.put,
        ls = commonTools.fn.LS,
        urls = {
            nav:    "http://ent.3g.cn/api/photoappnav.ashx?",
            list:   "http://ent.3g.cn/api/photoapplist.ashx?",
            search: "http://ent.3g.cn/api/PhotoAppSearch.ashx?",
            data:   "http://a.3g.cn/wse/getchd.php?ids=1307,1308&",
            uclink: "http://xuan.3g.cn/goto.php?"
        };

    // 获取location的hash，以数组返回
    function getHash(separator) {
        var s = separator ? separator : "/";
        return location.hash.slice(1).split(s);
    }

    // 处理 profit 数据
    function profit(){
        var toplink,topimgsrc;
        getJSONP(urls.data, getsDetail,getsFail);
        function getsDetail(data){
            if(data.state != "0"){
                toplink = data.topprofit[0].link;
                topimgsrc = data.topprofit[0].imgsrc;
                document.querySelector("#topLink").href = toplink;
                document.querySelector("#topImg").src = topimgsrc;
            }else{
                getsFail();
            }
        };
        function getsFail(){
            /*var topprofit = document.querySelector(".topprofit"),
            header = document.querySelector("header");
            topprofit.style.display = "none";
            header.style.paddingTop = 0;*/
        };
    }
    profit();

    // echoTime
    function echoTime(str, date) {

        var d = date || new Date();

        function fillZero(num) {
            return  num < 10 ? "0" + num : num;
        }

        return str.replace(/\$y/g, d.getFullYear())         // e.g. 2013
            .replace(/\$m/g, fillZero(d.getMonth() + 1))    // e.g. 01-12
            .replace(/\$d/g, fillZero(d.getDate()))     // e.g. 01-31
            .replace(/\$h/g, fillZero(d.getHours()))    // e.g. 00-23
            .replace(/\$i/g, fillZero(d.getMinutes()))  // e.g. 00-59
            .replace(/\$s/g, fillZero(d.getSeconds()))  // e.g. 00-59
            .replace(/\$u/g, d.getMilliseconds())
            .replace(/\$\//g, "$");
    }

    // 加载状态控制器
    var loadStatus = document.getElementsByClassName("loadStatus")[0];
    function loadStatusController(statusCode) {
        switch (statusCode) {
            case 0:
                loadStatus.innerHTML = "";
                loadStatus.style.display = "";
                break;

            case 100:
                loadStatus.innerHTML = '<div class="circle"></div>正在加载美女辣图...';
                loadStatus.style.display = "block";
                break;

            case 200:
                loadStatus.innerHTML = "加载成功";
                loadStatus.style.display = "";
                break;

            case 201:
                loadStatus.innerHTML = "没有找到相关词条内容 &gt;_&lt;";
                loadStatus.style.display = "block";
                break;

            case 404:
                loadStatus.innerHTML = "加载失败";
                loadStatus.style.display = "block";
                break;

            default :
                break;
        }
    }

    //初始化Nav导航
    function initNav(data) {
        var nav = document.querySelector("nav"),
            ul = document.querySelector("nav ul"),
            leftMore = document.querySelector(".leftMore"),
            rightMore = document.querySelector(".rightMore"),
            navUlWidth = 0,
            lis = ul.children,
            length = data.length,
            str = "",
            isBegin = false,
            isMove = false,
            isWait = false;

        //地址hash处理
        var cidHash = getHash()[0],
            navIndex = 0; //当前栏目位置

        for(var i = 0; i < length; i++) {
            if(data[i].cid === parseInt(cidHash)) {
                str += '<li><a class="cur" data-cid="' + data[i].cid + '">' + data[i].cname + '</a></li>';
                navIndex = i;
            } else {
                str += '<li><a data-cid="' + data[i].cid + '">' + data[i].cname + '</a></li>';
            }
        }

        ul.innerHTML = str;

        //初始化导航条的长度
        for(var i = lis.length; i--; ) {
            navUlWidth += lis[i].scrollWidth;
        }
        ul.style.width = navUlWidth + "px";

        var navIndexTranslateX = -(lis[navIndex].scrollWidth * (navIndex + 1) - nav.clientWidth);
        //console.log(navIndex, -(lis[navIndex].scrollWidth * (navIndex + 1) - nav.clientWidth)+ "px");
        navIndexTranslateX < 0 ? translate3d(ul, navIndexTranslateX + "px", 0, 0) : navIndexTranslateX = 0;

        if(navUlWidth > nav.clientWidth) {
            navIndexTranslateX < 0 && (leftMore.style.display = "block");
            -navIndexTranslateX + nav.clientWidth < navUlWidth && (rightMore.style.display = "block");
        } else {
            ul.style.margin = "0 auto";
        }

        //绑定事件
        (function slideEvent() {
            var marginLeft, ulWidth, startX,
                nowX = navIndexTranslateX, //当前位置
                dX = 0, //触摸移动距离
                sX = 0; //触摸起点

            ul.addEventListener(commonTools.startEvent, function(e) {
                e.preventDefault();
                isBegin = true;
                sX = client(e, "X");
            }, false);

            ul.addEventListener(commonTools.moveEvent, function(e) {
                e.preventDefault();
                if (!isBegin) {
                    return;
                }
                isMove = true;
                dX = client(e, "X") - sX;
                nowX += dX;
                if(nowX >= 0) {
                    nowX = 0;
                    translate3d(ul, nowX + "px", 0, 0);
                    leftMore.style.display = "";
                    return;
                }else if(nowX < nav.clientWidth - navUlWidth) {
                    nowX = nav.clientWidth - navUlWidth;
                    translate3d(ul, nowX + "px", 0, 0);
                    rightMore.style.display = "";
                    return;
                }
                else {
                    leftMore.style.display = "block";
                    rightMore.style.display = "block";
                    translate3d(ul, nowX + "px", 0, 0);
                }
                sX = client(e, "X");
            }, false);

            ul.addEventListener(commonTools.endEvent, function(e) {
                e.preventDefault();
                if(isBegin && !isMove) {
                    if(e.target.tagName == "A" && e.target.className != "cur" && !isWait ) {
                        isWait = true;
                        var cur = this.querySelector(".cur");
                        cur && (cur.className = "");
                        e.target.className = "cur";
                        location.replace("#" + e.target.getAttribute("data-cid"));
                        var cols = document.querySelectorAll(".col");
                        w.stopWaterfall();
                        setTimeout(function() {
                            for(var i = cols.length; i--; ) {
                                cols[i].innerHTML = "";
                            }
                            w.init({
                                page: 1,
                                breakLoading: false
                            });
                        }, 100);
                        setTimeout(function() {
                            isWait = false;
                        }, 1000);
                    }
                }
                isBegin = false;
                isMove = false;
            }, false);
        })();
    }

    function MobileWaterfall() {
        var _self = this,
            config = {
                cols: document.querySelectorAll(".col"),
                loading: document.querySelector(".loading"),
                fail: document.querySelector(".fail"),
                turnPage: document.querySelector(".turnPage"),
                heightArr: [0, 0, 0],
                newDiv: null,
                page:1, //当前页数
                pageSum: 1, //总页数 = partSum/times
                partSum: 1, //总份数 = 图集数量/每次加载图数
                times: 4, //每页读取次数
                index: 0, //当前读取次数
                breakLoading: false  //是否中断加载
            };

        _self.init = function(obj) {
            commonTools.extend(config, obj);
            var divElem = document.createElement("div");
                divElem.className = "imgFrame";
            config.newDiv = divElem;
            config.heightArr = [0,0,0];
            config.index = 0;
            config.turnPage.style.display = "";
            _self.waterfall();
            _self.resizeEvent();
        }

        commonTools.extend(_self, {
            minIndex: function(arr) {
                var min = Math.min.apply({}, arr);
                for(var j = 0, arrLength = arr.length; j < arrLength; j++) {
                    if(min == arr[j]) {
                        return j;
                    }
                }
            },
            /*url: function(cid, index, times){
                for(var i = 0; i < times; i++) {
                    var str = "url/" + cid + "/" + (config.page-1) * times + 1 +  + ".txt";
                    index++;
                    return str;
                }
            },*/
            imgQueueLoad: function(i, imgArr, cid) {
                //递归出口
                if(i == imgArr.length) {
                    //config.loading.style.display = "";
                    loadStatusController(200);
                    imgArr.length && _self.scrollEvent();
                    return;
                }

                var divClone = config.newDiv.cloneNode(),
                    index = _self.minIndex(config.heightArr),
                    data = imgArr[i],
                    imgElem = null;

                divClone.innerHTML = '<a data-pid="' + data.id + '"><img /><span class="' +
                    (cid == -2 ? "loveNum" : "imgNum") + '">'+ data.num +'</span></a>';
                imgElem = divClone.querySelector("img");

                //加载时间超过10s，默认为加载失败 TODO 后端需输出图片宽/高
                var timeout = setTimeout(function() {
                    imgElem.src = "img/load_fail_0.png?v=201303130000";
                }, 10 * 1000);
                imgElem.onload = function() {
                    clearTimeout(timeout);
                    config.cols[index].appendChild(divClone);
                    //console.log("00");
                    config.heightArr[index] += divClone.offsetHeight;
                    if(config.breakLoading) {
                        //递归出口
                        loadStatusController(0);
                        return;
                    }
                    _self.imgQueueLoad(++i, imgArr, cid);
                };
                imgElem.onerror = function() {
                    imgElem.src = "img/load_fail_0.png?v=201303130000";
                };
                imgElem.src = data.pic;
                //console.log("0")
            },
            waterfall: function(){
                if(config.index < config.times) {
                    //config.loading.style.display = "block";
                    loadStatusController(100);
                    var hash = getHash(),
                        cid = hash[0],
                        url = hash.length > 1 ? urls.search + "p=" + encodeURIComponent(searchKey.value) : urls.list,
                        part = (config.page - 1) * config.times + config.index + 1;

                    url += (url.match(/\?$|\&$/) ? "" : "&") + "cid=" + cid + "&part=" + part + "&num=15";
                    if(config.index == 0 || part <= config.partSum) {
                        getJSONP(url, function(data) {
                            var i = 0;
                            config.partSum = data.parts;
                            config.pageSum = Math.ceil(data.parts / config.times);
                            document.querySelector(".pageNum span").innerHTML = config.page + "/" + config.pageSum;
                            if(data.img.length === 0) {
                                hash.length > 1 ? loadStatusController(201) : loadStatusController(404);
                            } else {
                                _self.imgQueueLoad(i, data.img, cid);
                            }
                        }, function() {
                            loadStatusController(404);
                        });
                        config.index++;
                    } else {
                        //config.loading.style.display = "";
                        loadStatusController(200)
                        _self.showTurnPage();
                    }
                }else {
                    _self.showTurnPage();
                }
            },
            stopWaterfall: function() {
                config.breakLoading = true;
            },
            resizeEvent: function() {
                var first = null; //避免触发两次onresize
                window.onresize = function() {
                    if(first == null) {
                        first = setTimeout(function() {
                            for(i = config.heightArr.length; i--; ) {
                                var lastChild = config.cols[i].lastElementChild
                                config.heightArr[i] = lastChild.offsetTop + lastChild.offsetHeight;
                            }
                            first = null;
                        }, 100);
                    }
                }
            },
            scrollEvent: function() {
                window.onscroll = function() {
                    if(window.scrollY >= Math.min.apply({}, config.heightArr) - window.innerHeight) {
                        window.onscroll = null;
                        _self.waterfall();
                    }
                }
            },
            showTurnPage: function() {
                var previous = config.turnPage.querySelector("#previous"),
                    next = config.turnPage.querySelector("#next");
                previous.style.color = "";
                next.style.color = "";
                if(config.page == 1) {
                    previous.style.color = "#222";
                }
                if(config.page == config.pageSum) {
                    next.style.color = "#222";
                }
                config.turnPage.style.display = "block";
            },
            turnPageEvent: function() {
                config.turnPage.addEventListener("click", function(e) {
                    if(e.target.id == "previous") {
                        if(config.page == 1) {
                            //console.log("已经是第一页了");
                            return;
                        }
                        this.style.display = "none";
                        for(var i = config.cols.length; i--; ) {
                            config.cols[i].innerHTML = "";
                        }
                        w.init({
                            page: --config.page
                        });
                    }
                    if(e.target.id == "next") {
                        if(config.page == config.pageSum) {
                            //console.log("已经是最后页了");
                            return;
                        }
                        this.style.display = "none";
                        for(var i = config.cols.length; i--; ) {
                            config.cols[i].innerHTML = "";
                        }
                        w.init({
                            page: ++config.page
                        });
                    }
                }, false);
            }
        });
        _self.turnPageEvent()
    }

    var w = new MobileWaterfall();

    function init() {

        var searchBtn = document.querySelector("#searchBtn"),
            searchBar = document.querySelector("#searchBar"),
            searchKey = document.querySelector("#searchKey"),
            refresh = document.querySelector(".refresh"),
            imgWall = document.querySelector(".imgWall");

        function searchStatus(keyword) {
            var hashArr = getHash();
            commonTools.fn.addClass(searchBtn, "cur");
            searchBar.style.display = "block";
            refresh.style.display = "none";
            searchKey.value = decodeURIComponent(keyword);
        }

        function browseStatus() {
            commonTools.fn.removeClass(searchBtn, "cur");
            searchBar.style.display = "none";
            refresh.style.display = "";
            searchKey.value = "";
        }

        //搜索按钮点击事件
        searchBtn.onclick = function() {
            if(searchBtn.className.indexOf("cur") > -1) {
                commonTools.fn.removeClass(searchBtn, "cur");
                searchBar.style.display = "";
                location.replace("#" + getHash()[0]);
                w.stopWaterfall();
                setTimeout(function() {
                    var cols = document.querySelectorAll(".col");
                    for(var i = cols.length; i--; ) {
                        cols[i].innerHTML = "";
                    }
                    w.init({
                        page: 1,
                        breakLoading: false
                    });
                }, 100);
            } else {
                commonTools.fn.addClass(searchBtn, "cur");
                searchBar.style.display = "block";
            }
        }

        //搜索栏请求事件
        searchBar.onsubmit = function(e) {
            e.preventDefault();
            location.replace("#" + getHash()[0] + "/" + encodeURIComponent(searchKey.value));
            //TODO 搜索接口获取数据
            w.stopWaterfall();
            setTimeout(function() {
                var cols = document.querySelectorAll(".col");
                for(var i = cols.length; i--; ) {
                    cols[i].innerHTML = "";
                }
                w.init({
                    page: 1,
                    breakLoading: false
                });
            }, 100);
        };

        //换一波点击事件
        refresh.onclick = function() {
            var refreshIcon = this.querySelector(".refreshIcon"),
                cols = document.querySelectorAll(".col"),
                pageArr = document.querySelector(".turnPage .pageNum span").innerHTML.split("/"),
                pageCur = pageArr[0];

            transition(refreshIcon, vendor[1] + "transform 2s ease");
            transform(refreshIcon, "rotate(3600deg)");
            setTimeout(function() {
                transition(refreshIcon, "");
                transform(refreshIcon, "");
            }, 2000);

            while(pageCur == pageArr[0]) {
                pageCur = Math.floor(Math.random() * pageArr[1]) + 1;
            }
            w.stopWaterfall();
            setTimeout(function() {
                for(var i = cols.length; i--; ) {
                    cols[i].innerHTML = "";
                }
                w.init({
                    page: pageCur,
                    breakLoading: false
                });
            }, 100);
        };


        //图片墙 图片点击事件监听
        imgWall.addEventListener("click", function (e) {
            if(e.target.tagName == "IMG") {
                var hashArr = getHash(),
                    cid = hashArr.length > 0 ? hashArr[0] : 0,
                    pid = e.target.parentNode.getAttribute("data-pid");
                e.target.style.opacity = "0.8";
                setTimeout(function() {
                    e.target.style.opacity = "";
                    location.href = "gallery.html#" + cid + "/" + pid;
                },100);
            }
        }, false);

        // 初始化hash
        var hashArr = getHash();
        hashArr[0] === "" && (location.hash = 206);
        hashArr.length > 1 && searchStatus(hashArr[1]);

        window.onhashchange = function() {
            var hashArr = getHash();
            hashArr.length > 1 ? searchStatus(hashArr[1]) : browseStatus();
        };

        //加载分类
        var latuInit = localStorage["latu_init"];
        if(!latuInit || parseInt(latuInit) < parseInt(echoTime("$y$m$d"))) {
            getJSONP(urls.nav, function(data) {
                localStorage["latu_init"] = echoTime("$y$m$d");
                localStorage["latu_navData"] = JSON.stringify(data);
                initNav(data);
                w.init({
                    page: 1
                });
            }, function() {
                loadStatusController(404);
            });
        } else {
            var data = JSON.parse(localStorage["latu_navData"]);
            initNav(data);
            w.init({
                page: 1
            });
        }

    }

    init();
    //set storage
    var storage = window.localStorage;
    if (!storage.getItem("ucnum")){
        storage.setItem("ucnum",0);
        storage.setItem("setnum",storage.getItem("ucnum"));
    }
    //顶部320*60
    /*function profitTop(){
        var topprofit = document.querySelector(".topprofit"),
        header = document.querySelector("header"),
        storage = window.localStorage;

        if(/MQQBrowser\/([\d.]+)/.test(window.navigator.userAgent)){
            topprofit.style.display = "none";
            header.style.paddingTop = "0px";
            return;
        }

        if(storage.getItem("settime")){
            var settime = storage.getItem("settime"),
                gettime = new Date(),
                now = gettime.getTime();
            if( now - settime >= 4*60*60*1000 ){
                topprofit.style.display = "block";
                header.style.paddingTop = 65 + "px";
            }else{
                topprofit.style.display = "none";
                header.style.paddingTop = 0;
            }
        }else{
            //topprofit.style.display = "block";
            header.style.paddingTop = 65 + "px";
        }
        document.querySelector("#profit_close").onclick = function(){
            topprofit.style.display = "none";
            header.style.paddingTop = 0;
            var gettime = new Date(),
                    now = gettime.getTime();
            storage.setItem("settime",now);
        }
    }
    profitTop(); */

    //添加到UC
    ;(function () {
        if(/(?:UC|UCBrowser)[ /]([\d.]+)?/.test(navigator.userAgent) && /Android\s+([\d.]+)/.test(navigator.userAgent)){
            var ucDesktop = document.querySelector(".ucDesktop"),
                    uciframe = document.querySelector(".ucbox"),
                    timestring = new Date();
            var iframeElem = document.createElement("iframe");
            iframeElem.id = "uciframe";
            iframeElem.src = "http://app.uc.cn/appstore/AppCenter/frame?uc_param_str=nieidnutssvebipfcp&api_ver=2.0&id=1103";
            uciframe.appendChild(iframeElem);
            ucDesktop.onclick = function(){
                //put(urls.uclink + "cin=-7774& =" + timestring.getTime());
                uciframe.style.display = "block";
            };
            window.addEventListener('message', function(e) {
                var msg = e.data.message,
                    type = e.data.type;
                // 当message为空时，为首次触发message事件，并且网站没有添加到书签
                if (msg.length === 0) {
                    ucDesktop.style.display = "block";
                }

                // 顺利添加后，返回的type值为1
                if (type === 1) {
                    ucDesktop.style.display = "none";
                    //put(urls.uclink + "cin=-7775& =" + timestring.getTime());
                }
                uciframe.style.display = "none";
            }, false);
        }
    })();

})();