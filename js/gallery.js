(function() {
    var translate3d = commonTools.css.translate3d,
        transform = commonTools.css.transform,
        transition = commonTools.css.transition,
        client = commonTools.fn.client,
        vendor = commonTools.vendor,
        getJSONP = commonTools.ajax.getJSONP,
        put = commonTools.ajax.put,
        ls = commonTools.fn.LS,
        urls = {
            love:   "http://ent.3g.cn/api/photoapplove.ashx?",
            detail: "http://ent.3g.cn/api/photoappdetail.ashx?",
            stat:   "http://latu.3g.cn/photoappstat.php?",
            datauc:  "http://wxapi.3g.cn/latu/data?"
        };

    //set storage
    var storage = window.localStorage;  //uc for 3ggo
    if (!storage.getItem("ucnum")){
        storage.setItem("ucnum",0);
        storage.setItem("setnum",storage.getItem("ucnum"));
    }
    var ucnum = storage.getItem("ucnum");
    ucnum++;
    storage.setItem("ucnum",ucnum);
    var setnum = storage.getItem("setnum"),ifallow,ucLink,ucImgLink,ucId;
    if((ucnum - setnum)%2 == 0 && ucnum != 0 && navigator.userAgent.match(/Android/i)){ // && navigator.userAgent.match(/Android/i)
        ifallow = 1;
        getJSONP(urls.datauc, getsDetail,getsFail);
    }else{
        ifallow = 0;
    };
    function getsDetail (data) {
        ucLink = data.link;
        ucImgLink = data.image_url;
        ucId = data.id;
        var extendImg = document.getElementById('extendImg');
        if(extendImg){
            var extendImg_a = extendImg.getElementsByTagName('a')[0];
            extendImg_a.id = ucId;
            extendImg_a.href = ucLink;
            extendImg_a.getElementsByTagName('img')[0].src = ucImgLink;
        }
    }
    function getsFail () {
        ifallow = 0;
    }


            
    window.ls = ls;
    var _t = "lt_",
        iName = ls.itemName = {   //localStorage的对象名
            loved: _t + "loved"
        };

    function SliderImg(o) {
        var _self = this;
        var config = {
            warpper: null,
            ul: null,
            header: null,
            headerTitle: null,
            loveBtn: null,
            backBtn: null,
            footer: null,
            footerTitle: null,
            cid: 0,
            pid: 0
        }

        _self.init = function(obj) {
            commonTools.extend(config, obj);
            config.cid = _self.hash()[0];
            config.pid = _self.hash()[1]
            config.headerTitle = config.header.querySelector("h1");
            config.loveBtn = config.header.querySelector(".loveBtn");
            config.backBtn = config.header.querySelector(".backBtn");
            config.footerTitle = config.footer.querySelector("h1");
            config.warpper.style.height = window.screen.availHeight + 200 + 'px';

            if(!localStorage[iName.loved]) {
                ls.createLS(iName.loved, []);
            }

            config.footer.querySelector(".zoomIn").onclick = function() {
                _self.zoomImg();
            }

            config.backBtn.onclick = function() {
                commonTools.fn.addClass(config.backBtn, "click");
                setTimeout(function() {
                    commonTools.fn.removeClass(config.backBtn, "click");
                    location.replace("index.html");
                    //history.back();
                },100);
            };

            config.loveBtn.onclick = function() {
                if(this.className.indexOf("loved") > -1) {
                    commonTools.fn.removeClass(this, "loved");
                    var num = +config.loveBtn.innerHTML,
                        index = config.footerTitle.querySelector("span").innerHTML - 1;
                    config.loveBtn.innerHTML = num - 1;
                    _self.updateLoveData(index, 0);
                } else {
                    commonTools.fn.addClass(this, "loved");
                    var index = config.footerTitle.querySelector("span").innerHTML - 1;
                    // 加心
                    put(urls.love + "cid=" + config.cid + "&pid=" + config.pid + "&num=" + index);
                    var data = ls.selectLS("pid=" + config.pid, iName.loved)[0];
                    if(!data.length) {
                        var arr = [],
                            len = config.ul.querySelectorAll("li").length;
                        for(var i = 0; i < len; i++) {
                            arr.push(0);
                        }
                        ls.insertLS({
                            pid: config.pid,
                            num: arr
                        }, iName.loved);

                    }
                    var num = +config.loveBtn.innerHTML;
                    config.loveBtn.innerHTML = num + 1;
                    _self.updateLoveData(index, 1);
                }
            }

            _self.orientationEvent();
            setTimeout(function () {
                window.scrollTo(0, 1);
                setTimeout(function () {
                    console.log()
                    getJSONP(urls.detail + "cid=" + config.cid +  "&pid=" + _self.hash()[1], _self.replaceGallery);
                }, 200);
            }, 100);

            delete _self.init;
        }

        commonTools.extend(_self, {
            hash: function() {
                var arr = location.hash.slice(1).split("/");
                return arr;
            },

            orientationEvent: function() {
                var first = null; //避免触发两次onresize
                //Android下UC浏览器对orientationchange的支持不理想
                //IOS下onresize事件触发诡异！
                window.addEventListener(commonTools.orientationEventName, function() {
                    if(first == null) {
                        first = setTimeout(function() {
                            config.warpper.style.height = window.screen.availHeight + 'px';
                            window.scrollTo(0, 1);
                            config.warpper.style.height = window.innerHeight + 'px';
                            var originalImg = document.querySelector(".originalImg");
                            if(originalImg) {
                                originalImg.parentNode.removeChild(originalImg);
                                _self.zoomImg();
                            }
                            first = null;
                        }, 500);
                    }
                }, false);
            },

            //串并行加载图片
            loadImg: function(elem, pic, love) {
                var i = 0,
                    len = pic.length,
                    str = "";
                for(i = 0; i < len; i++) {
                    str += '<li><img style="display:none;" onload="this.style.cssText = \'\'" src="img/load_fail_1.png?v=201303130000" /></li>';
                }
                if(ifallow == 1){  //能够整除，添加广告
                    if(ucLink){
                        str +="<li id='extendImg'><a class=\"returnid\" target=\"_blank\" id=\""+ucId+"\" href=\""+ucLink+"\"><img src=\""+ucImgLink+"\" /></a></li>"
                    }else{
                        str +="<li id='extendImg'><a class=\"returnid\" target=\"_blank\" id=\"-1\" href=\"javascript:void 0;\"><img src='img/load_fail_1.png?v=201303130000' /></a></li>"
                    }
                }
                elem.innerHTML = str;

                var imgs = elem.querySelectorAll("img");
                i = 0;
                loadImg = function() {
                    if(i >= len) return;
                    var img = new Image();
                    //imgs[i].src = arr[i];
                    var timeout = function(i) {
                        var num = i;
                        return setTimeout(function() {
                            img.onload = function() {
                                clearTimeout(timeout);
                                imgs[num].src = pic[num];
                                //this.style.cssText = "";
                                //this.parentNode.childNodes[0].data = "";
                            };
                            loadImg();
                        }, 3000);
                    }(i);
                    img.onload = function(i) {
                        var num = i;
                        return function() {
                            clearTimeout(timeout);
                            imgs[num].src = pic[num];
                            //this.style.cssText = "";
                            //this.parentNode.childNodes[0].data = "";
                            loadImg();
                        }
                    }(i);
                    img.src = pic[i];
                    i++;
                };
                loadImg();
            },

            //记录加心
            updateLoveData: function(index, value) {
                var data = ls.selectLS("pid=" + _self.hash()[1], iName.loved)[0];
                ls.deleteLS("pid=" + _self.hash()[1], iName.loved);
                var arr = data[0].num;
                arr[config.footerTitle.querySelector("span").innerHTML - 1] = value;
                ls.insertLS({
                    pid: _self.hash()[1],
                    num: arr
                }, iName.loved);
            },

            //检查加心记录
            checkLoveImg: function() {
                var arr = [],
                    data = ls.selectLS("pid=" + _self.hash()[1], iName.loved)[0],
                    index = config.footerTitle.querySelector("span").innerHTML - 1;
                if(!data.length) return;
                arr = data[0].num;
                if(arr[index] == 1) {
                    commonTools.fn.addClass(config.loveBtn, "loved");
                } else {
                    commonTools.fn.removeClass(config.loveBtn, "loved");
                }
            },

            //加载图集
            replaceGallery: function(data) {
                if(!data.pic) {
                    return false;
                }
                var warpper = config.warpper,
                    ul = config.ul = document.createElement("ul"),
                    header = config.header,
                    headerTitle = config.headerTitle,
                    footer = config.footer,
                    footerTitle = config.footerTitle,
                    loveBtn = config.loveBtn,
                    pic = data.pic,
                    subtitle = data.subtitle,
                    love = data.love,
                    size = pic.length,
                    str = "";

                document.title = data.title;
                warpper.querySelector(".picContent").appendChild(ul);
                headerTitle.innerHTML = data.title;
                footerTitle.innerHTML = subtitle[0] + '(<span>1</span>/'+ size +')';
                loveBtn.innerHTML = love[0];
                warpper.style.height = window.innerHeight + 'px';
                if(ifallow == 1){  //能够整除，添加广告
                    ul.style.width = 100 * (size+1) + "%";
                }else{
                    ul.style.width = 100 * size + "%";
                }
                //图集数量大于6张，则使用串并行加载方式
                if(pic.length > 6) {
                    _self.loadImg(ul, pic);
                } else {
                    for(var i = 0; i < size; i++) {
                        str += '<li><img src="img/load_fail_1.png?v=201303130000" style="display:none;" ' +
                            'onload=\"this.style.cssText=\'\';var img=new Image(),_self=this,src=\'' +
                            pic[i] + '\';img.src=src;img.onload=function(){_self.src = src;img=undefined;}\"' +
                            ' /></li>';
                    }
                    if(ifallow == 1){  //能够整除，添加广告
                        if(ucLink){
                            str +="<li id='extendImg'><a class=\"returnid\" target=\"_blank\" id=\""+ucId+"\" href=\""+ucLink+"\"><img src=\""+ucImgLink+"\" /></a></li>"
                        }else{
                            str +="<li id='extendImg'><a class=\"returnid\" target=\"_blank\" id=\"-1\" href=\"javascript:void 0;\"><img src='img/load_fail_1.png?v=201303130000' /></a></li>"
                        }
                    }
                    ul.innerHTML = str;
                }

                if(ifallow == 1){  //返回广告id
                    document.querySelector(".returnid").onclick = function() {
                        put(urls.datauc + "id=" + ucId);
                    }
                }

                config.loveBtn.style.display = "block";
                _self.checkLoveImg();

                var slider = _self.slider({
                    header: header,
                    footer: footer,
                    footerTitle: footerTitle,
                    loveBtn: loveBtn,
                    size: size,
                    subtitle: subtitle,
                    love: love,
                    prevNewsID: data.PrevNewsID,
                    nextNewsID: data.NextNewsID,

                });

                //绑定触摸事件
                ul.addEventListener(commonTools.startEvent, slider.start, false);
                ul.addEventListener(commonTools.moveEvent, slider.move, false);
                ul.addEventListener(commonTools.endEvent, slider.end, false);

                header.style.display = 'block';
                footer.style.display = 'block';

            },

            slider: function(obj) {
                var header = obj.header,
                    footer = obj.footer,
                    footerTitle = obj.footerTitle,
                    loveBtn = obj.loveBtn,
                    size = obj.size,
                    subtitle = obj.subtitle,
                    love = obj.love,
                    prevNewsID = obj.prevNewsID,
                    nextNewsID = obj.nextNewsID,

                    cur = 0,
                    length = ifallow == 1?size+1:size,
                    x = 0,
                    y = 0,
                    startX = 0,
                    startY = 0,
                    dx = 0,
                    dy = 0,
                    isBegin = false,
                    isMove = false,
                    percent = 100 / length,
                    width = document.documentElement.clientWidth,
                    slideDistance = 20,//width / 4,
                    nowTouchTime, lastTouchTime, interval;

                return {
                    start: function (e) {
                        if(!commonTools.isTouch) {
                            e.preventDefault();
                        }
                        isBegin = true;
                        x = y = 0;
                        nowTouchTime = Date.now();
                        interval = nowTouchTime - lastTouchTime;
                        //是否双击
                        if(interval > 0 && interval < 250
                        && Math.abs(client(e, "X") - startX) < 50
                        && Math.abs(client(e, "Y") - startY) < 50) {
                            _self.zoomImg();
                        }
                        lastTouchTime = nowTouchTime;
                        startX = client(e, "X");
                        startY = client(e, "Y");
                    },
                    move: function (e) {
                        e.preventDefault();
                        if (!isBegin) {
                            return;
                        }
                        isMove = true;
                        var tempX, tempY;
                        tempX = client(e, "X");
                        tempY = client(e, "Y");
                        dx = tempX - startX;
                        dy = tempY - startY;
                        startX = tempX;
                        startY = tempY;
                        x += dx;
                        y += dy;
                        //translate3d(this, ((x / width  - cur) * percent) + '%', 0, 0);
                        transform(this, "translate3d(" + (x / width  - cur) * percent + "%, 0, 0)");
                    },
                    end: function (e) {
                        if(isBegin && !isMove) {
                            //点击隐藏上下两栏
                            if (header.style.display == 'none') {
                                header.style.display = 'block';
                                footer.style.display = 'block';
                            } else {
                                header.style.display = 'none';
                                footer.style.display = 'none';
                            }
                            document.querySelector(".returnid").parentNode.onclick = function() {  //av的时候，底部始终不显示 
                                footer.style.display = 'none';
                            }
                        } else if(isBegin && isMove) {
                            e.preventDefault();
                            var that = this;
                            //commonTools.fn.addClass(this, 'transition');
                            transition(this, vendor[1] + "Transform, 0.3s linear");
                            if (x > slideDistance) {
                                if(cur === 0) {
                                    if(prevNewsID != 0) {
                                        location.replace("#" + config.cid + "/" + prevNewsID);
                                        document.querySelector(".picContent").innerHTML = "";
                                        location.reload();
                                        //document.querySelector(".picContent").innerHTML = "";
                                        //getJSONP("http://ent.3g.cn/api/PhotoAppdetail.ashx?cid=" + config.cid + "&pid=" + prevNewsID, _self.replaceGallery);
                                    }
                                } else {
                                    cur--;
                                }
                                //统计浏览
                                put(urls.stat);
                            } else if (x < -slideDistance) {
                                if(cur === length - 1) {  
                                    if(nextNewsID != 0) {  
                                        location.replace("#" + config.cid + "/" + nextNewsID);
                                        document.querySelector(".picContent").innerHTML = "";
                                        location.reload();
                                        //document.querySelector(".picContent").innerHTML = "";
                                        //getJSONP("http://ent.3g.cn/api/PhotoAppdetail.ashx?cid=" + config.cid + "&pid=" + nextNewsID, _self.replaceGallery);
                                    }
                                } else {
                                    cur++;
                                }
                                //统计浏览
                                put(urls.stat);
                            }
                            //translate3d(this, (-cur * percent) + '%', 0, 0);
                            transform(this, "translate3d(" + -cur * percent + "%, 0, 0)");

                            loveBtn.innerHTML = love[cur];
                            if(ifallow == 1){
                                footerTitle.innerHTML = subtitle[cur] + '(<span>' + (cur + 1) + '</span>/'+ (length-1) +')';
                                if((cur + 1) == length){
                                    config.headerTitle.innerHTML = "";
                                    config.loveBtn.style.display = "none";
                                    footer.style.display = "none";
                                }
                            }else{
                                footerTitle.innerHTML = subtitle[cur] + '(<span>' + (cur + 1) + '</span>/'+ length +')';
                            }
                            _self.checkLoveImg();
                            setTimeout(function () {
                                //commonTools.fn.removeClass(that, 'transition');
                                transition(that, "");
                            }, 300);
                        }
                            isBegin = false;
                            isMove = false;
                    }
                };
            },

            zoomImg : function() {
                var originalImg = document.querySelector(".originalImg"),
                    img = null,
                    zoomOut = null,
                    winH = window.innerHeight,
                    winW = window.innerWidth,
                    isBegin = false,
                    isMove = false,
                    imgX = 0, imgY = 0, //图片位置
                    dX = 0, dY = 0, //触摸移动距离
                    sX = 0, sY = 0, //触摸起点
                    oX1 = 0, oY1 = 0, oX2 = 0, oY2 = 0; //边界值
                
                config.warpper.style.opacity = 0;
                originalImg = document.createElement("div");
                originalImg.className = "originalImg";
                originalImg.innerHTML = '<img /><div class="zoom zoomOut"></div>';
                img = originalImg.querySelector("img");
                zoomOut = originalImg.querySelector(".zoomOut");
                img.src = document.querySelectorAll(".picContent li img")[config.footer.querySelector("footer span").innerHTML - 1].src;
                zoomOut.onclick = function() {
                    config.warpper.style.opacity = 1;
                    document.body.removeChild(originalImg);
                }
                originalImg.style.cssText = "height:" + winH +"px; width:" + winW +"px;";
                document.body.appendChild(originalImg);

                //图片位置相关初始化
                function imgInit() {
                    var imgH = img.clientHeight,
                        imgW = img.clientWidth;
                    imgX = (winW - imgW) / 2;
                    imgY = (winH - imgH) / 2;
                    if(imgX > 0) {
                        oX1 = imgX;
                        oX2 = imgX;
                    } else {
                        oX1 = 0;
                        oX2 = winW - imgW;
                    }
                    if(imgY > 0) {
                        oY1 = imgY;
                        oY2 = imgY;
                    } else {
                        oY1 = 0;
                        oY2 = winH - imgH;
                    }
                    //translate3d(img, imgX + "px", imgY + "px", 0);
                    transform(img, "translate3d(" + imgX + "px, " + imgY + "px, 0)");
                }

                //图片边界监控
                function imgAlignment() {
                    if(imgX > oX1) {
                        imgX = oX1;
                    } else if(imgX < oX2) {
                        imgX = oX2;
                    }
                    if(imgY > oY1) {
                        imgY = oY1;
                    } else if(imgY < oY2) {
                        imgY = oY2;
                    }
                    //transition(img, "transform", 0.3, "ease", 0);
                    //translate3d(img, imgX + "px", imgY + "px", 0);
                    transition(img, vendor[1] + "Transform, 0.3s linear");
                    transform(img, "translate3d(" + imgX + "px, " + imgY + "px, 0)");
                    setTimeout(function() {
                        transition(img, "");
                    }, 300);
                }

                function touchEvent(elem) {
                    var nowTouchTime, lastTouchTime, interval;

                    elem.addEventListener(commonTools.startEvent, function(e) {
                        e.preventDefault();
                        isBegin = true;
                        nowTouchTime = Date.now();
                        interval = nowTouchTime - lastTouchTime;
                        //是否双击
                        if(interval > 0 && interval < 250
                        && Math.abs(client(e, "X") - sX) < 50
                        && Math.abs(client(e, "Y") - sY) < 50) {
                            config.warpper.style.opacity = 1;
                            document.body.removeChild(originalImg);
                        }
                        lastTouchTime = nowTouchTime;
                        sX = client(e, "X");
                        sY = client(e, "Y");
                    }, false);

                    elem.addEventListener(commonTools.moveEvent, function(e) {
                        e.preventDefault();
                        if (!isBegin) {
                            return;
                        }
                        isMove = true;
                        dX = client(e, "X") - sX;
                        dY = client(e, "Y") - sY;
                        imgX += dX;
                        imgY += dY;
                        //translate3d(elem, imgX + "px", imgY + "px", 0);
                        transform(img, "translate3d(" + imgX + "px, " + imgY + "px, 0)");
                        sX = client(e, "X");
                        sY = client(e, "Y");
                    }, false);

                    elem.addEventListener(commonTools.endEvent, function(e) {
                        e.preventDefault();
                        if (!isBegin || !isMove) {
                            isBegin = false;
                            isMove = false;
                            return;
                        }
                        imgAlignment();
                        isBegin = false;
                        isMove = false;
                    }, false);
                }
                imgInit();
                touchEvent(img);
            }

        });

        _self.init(o);
    }

    var s = new SliderImg({
        warpper: document.querySelector(".warpper"),
        header: document.querySelector("header"),
        footer: document.querySelector("footer")
    });
})();