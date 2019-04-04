﻿function Pop(Html, Type, Callback) {
    var BoxId = id_();
    var PopType = {
        alert: {
            Title: "BlockImage",
            Btn: {
                yes: {
                    vla: "我知道了",
                    ope: function() {
                        if (Callback) {
                            Callback();
                            Close()
                        } else { Close() }
                    }
                }
            }
        },
        confirm: {
            Title: "BlockImage",
            Btn: {
                yes: {
                    vla: "确定",
                    ope: function() {
                        if (Callback) {
                            Callback();
                            Close()
                        } else { Close() }
                    }
                },
                no: { vla: "取消", class: "btn btn-currency", ope: function() { Close() } }
            }
        },
        copy: {
            Title: "BlockImage",
            Btn: {
                yes: {
                    vla: "复制",
                    ope: function() {
                        if (Callback) {
                            Callback();
                            Close()
                        } else { Close() }
                    }
                },
                no: { vla: "取消", class: "btn btn-currency", ope: function() { Close() } }
            }
        }
    };
    var IType = Type ? Type instanceof Object ? Type : PopType[Type] || {} : {};
    var Config = $.extend(true, {
        Title: "来自BlockImage的提示",
        Close: true,
        Animation: "layerFadeIn",
        BoxBg: true,
        BoxDrag: true,
        BoxBgopacity: 0.6,
        ZIndex: 99999,
        Class: false,
        Btn: {
            yes: { vla: "我知道了", class: "btn btn-primary", ope: function() { Close() } },

        }
    }, IType);
    var $Box = $("<div>").addClass("box").addClass(Config.Class);
    var $BoxTitle = $("<div>").addClass("box-title");
    var $BoxClose = $("<i>").html("×");
    var $BoxHtml = $("<div>").addClass("box-content");
    var $BoxBtn = $("<div>").addClass("box-button");
    var $BoxBg = $("<div>").css({
        "position": "fixed",
        "left": 0,
        "top": 0,
        "width": "100%",
        "height": "100%",
        "z-index": Config.ZIndex - 1,
        "background-color": "rgba(0,0,0," + Config.BoxBgopacity + ")",

    }).attr("id", BoxId + "bg");

    Config.Close = Config.Close ? Config.Close : $BoxClose = $("");

    Config.BoxBg = Config.BoxBg ? Config.BoxBg : $BoxBg = $("");

    if ($("style[pop-style]").length <= 0) { $("head").append("<style pop-style=true>" + Style() + "</style>"); }

    if ($("style[pop-animation]").length <= 0) { $("head").append("<style pop-animation=true>" + AnimationStyle() + "</style>"); }

    $("body").append(
        $Box.append($BoxTitle.html(Config.Title). // 标题
            append($BoxClose)). // 关闭按钮
        append($BoxHtml.html(Html)). // 内容
        append($BoxBtn.html(btn_()))).append($BoxBg); // 按钮以及事件

    $Box.css({ "left": ($(window).width() * 0.5) - ($Box.width() * 0.5), "top": ($(window).height() * 0.5) - ($Box.height() * 0.5), "z-index": Config.ZIndex }).
    addClass("showAlert").attr("id", BoxId).attr("data-animation", Config.Animation);

    $BoxClose.click(Close);

    if (Config.BoxDrag) {
        $BoxTitle.mouseover(function() {
            $(this).css("cursor", "move");
        }).mousedown(function(e) {
            var i = true;
            var x = e.pageX - $(this).parent().offset().left;
            var y = e.pageY - $(this).parent().offset().top;
            $(document).mousemove(function(e) {
                if (i) {
                    $Box.offset({ left: e.pageX - x, top: e.pageY - y });
                }
            }).mouseup(function() { i = false; });
        });
    }

    function Close() {
        $("#" + BoxId).removeClass("showAlert");
        $("#" + BoxId).addClass("hideAlert");
        if ($("#" + BoxId + "bg").length > 0) { $("#" + BoxId + "bg").fadeOut(400, function() { $(this).remove() }) }
        setTimeout(function() {
            $("#" + BoxId).remove();
        }, 400);

    }

    function id_() {
        var i = "pop_" + (new Date()).getTime() + parseInt(Math.random() * 100000);
        if ($("#" + i).length > 0) { return id_(); } else { return i; }
    }


    function btn_() {
        var $i = $("<div>");
        var b = Config.Btn;
        if (b.yes) { $i.append($("<button>").addClass(b.yes.class).html(b.yes.vla).click(b.yes.ope)) }
        if (b.no) { $i.append($("<button>").addClass(b.no.class).html(b.no.vla).click(b.no.ope)) }
        if (b.cancel) { $i.append($("<span>").addClass(b.cancel.class).html(b.cancel.vla).click(b.cancel.ope)) }
        if (b.bnt1) { $i.append($("<span>").addClass(b.bnt1.class).html(b.bnt1.vla).click(b.bnt1.ope)) }
        if (b.bnt2) { $i.append($("<span>").addClass(b.bnt2.class).html(b.bnt2.vla).click(b.bnt2.ope)) }
        if (b.bnt3) { $i.append($("<span>").addClass(b.bnt3.class).html(b.bnt3.vla).click(b.bnt3.ope)) }
        if (b.bnt4) { $i.append($("<span>").addClass(b.bnt4.class).html(b.bnt4.vla).click(b.bnt4.ope)) }
        if (b.bnt5) { $i.append($("<span>").addClass(b.bnt5.class).html(b.bnt5.vla).click(b.bnt5.ope)) }
        return $i;
    }
};

function AnimationStyle() {
    var css = "@charset 'utf-8';@keyframes slideFromTop{0%{top:0}100%{top:50%}}@-webkit-keyframes slideFromTop{0%{top:0}100%{top:50%}}@-moz-keyframes slideFromTop{0%{top:0}100%{top:50%}}@-ms-keyframes slideFromTop{0%{top:0}100%{top:50%}}@-o-keyframes slideFromTop{0%{top:0}100%{top:50%}}@keyframes hideFromTop{0%{top:50%}100%{top:0;opacity:0}}@-webkit-keyframes hideFromTop{0%{top:50%}100%{top:0;opacity:0}}@-moz-keyframes hideFromTop{0%{top:50%}100%{top:0;opacity:0}}@-ms-keyframes hideFromTop{0%{top:50%}100%{top:0;opacity:0;filter:Alpha(opacity=0)}}@-o-keyframes hideFromTop{0%{top:50%}100%{top:0;opacity:0}}@keyframes slideFromBottom{0%{top:80%}100%{top:50%}}@-webkit-keyframes slideFromBottom{0%{top:80%}100%{top:50%}}@-moz-keyframes slideFromBottom{0%{top:80%}100%{top:50%}}@-ms-keyframes slideFromBottom{0%{top:80%}100%{top:50%}}@-o-keyframes slideFromBottom{0%{top:80%}100%{top:50%}}@keyframes hideFromBottom{0%{top:50%}100%{top:80%;opacity:0}}@-webkit-keyframes hideFromBottom{0%{top:50%}100%{top:80%;opacity:0}}@-moz-keyframes hideFromBottom{0%{top:50%}100%{top:80%;opacity:0}}@-ms-keyframes hideFromBottom{0%{top:50%}100%{top:80%;opacity:0;filter:Alpha(opacity=0)}}@-o-keyframes hideFromBottom{0%{top:50%}100%{top:80%;opacity:0}}@keyframes showSweetAlert{0%{transform:scale(.5)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(1)}}@-webkit-keyframes showSweetAlert{0%{-webkit-transform:scale(.5)}45%{-webkit-transform:scale(1.05)}80%{-webkit-transform:scale(.95)}100%{-webkit-transform:scale(1)}}@-moz-keyframes showSweetAlert{0%{-moz-transform:scale(.5)}45%{-moz-transform:scale(1.05)}80%{-moz-transform:scale(.95)}100%{-moz-transform:scale(1)}}@-ms-keyframes showSweetAlert{0%{-ms-transform:scale(.5)}33%{-ms-transform:scale(1.05)}66%{-ms-transform:scale(.95)}100%{-ms-transform:scale(1)}}@-o-keyframes showSweetAlert{0%{-o-transform:scale(.5)}45%{-o-transform:scale(1.05)}80%{-o-transform:scale(.95)}100%{-o-transform:scale(1)}}@keyframes hideSweetAlert{0%{transform:scale(1)}45%{transform:scale(1.05)}80%{transform:scale(.95)}100%{transform:scale(0);opacity:0}}@-webkit-keyframes hideSweetAlert{0%{-webkit-transform:scale(1)}45%{-webkit-transform:scale(1.05)}80%{-webkit-transform:scale(.95)}100%{-webkit-transform:scale(0);opacity:0}}@-moz-keyframes hideSweetAlert{0%{-moz-transform:scale(1)}45%{-moz-transform:scale(1.05)}80%{-moz-transform:scale(.95)}100%{-moz-transform:scale(0);opacity:0}}@-ms-keyframes hideSweetAlert{0%{-ms-transform:scale(1)}45%{-ms-transform:scale(1.05)}80%{-ms-transform:scale(.95)}100%{-ms-transform:scale(0);opacity:0;filter:Alpha(opacity=0)}}@-o-keyframes hideSweetAlert{0%{-o-transform:scale(1)}45%{-o-transform:scale(1.05)}80%{-o-transform:scale(.95)}100%{-o-transform:scale(0);opacity:0}}@keyframes layerFadeIn{0%{opacity:0;transform:scale(.5)}100%{opacity:1;transform:scale(1)}}@-webkit-keyframes layerFadeIn{0%{opacity:0;-webkit-transform:scale(.5)}100%{opacity:1;-webkit-transform:scale(1)}}@-moz-keyframes layerFadeIn{0%{opacity:0;-moz-transform:scale(.5)}100%{opacity:1;-moz-transform:scale(1)}}@-ms-keyframes layerFadeIn{0%{opacity:0;-ms-transform:scale(.5);filter:Alpha(opacity=0)}100%{opacity:1;-ms-transform:scale(1);filter:Alpha(opacity=100)}}@-o-keyframes layerFadeIn{0%{opacity:0;-o-transform:scale(.5)}100%{opacity:1;-o-transform:scale(1)}}@keyframes hideFadeIn{0%{opacity:1;transform:scale(1)}100%{transform:scale(.5);opacity:0}}@-webkit-keyframes hideFadeIn{0%{opacity:1;-webkit-transform:scale(1)}100%{-webkit-transform:scale(.5);opacity:0}}@-moz-keyframes hideFadeIn{0%{opacity:1;-moz-transform:scale(1)}100%{-moz-transform:scale(.5);opacity:0}}@-ms-keyframes hideFadeIn{0%{opacity:1;-ms-transform:scale(1)}100%{-ms-transform:scale(.5);opacity:0;filter:Alpha(opacity=0)}}@-o-keyframes hideFadeIn{0%{opacity:1;-webkit-transform:scale(1)}100%{-webkit-transform:scale(.5);opacity:0}}@keyframes layer-fadeInUpBig{0%{opacity:0;transform:translateY(2000px)}100%{opacity:1;transform:translateY(0)}}@-webkit-keyframes layer-fadeInUpBig{0%{opacity:0;-webkit-transform:translateY(2000px);transform:translateY(2000px)}100%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}}@-moz-keyframes layer-fadeInUpBig{0%{opacity:0;-moz-transform:translateY(2000px);transform:translateY(2000px)}100%{opacity:1;-moz-transform:translateY(0);transform:translateY(0)}}@-ms-keyframes layer-fadeInUpBig{0%{opacity:0;-ms-transform:translateY(2000px);transform:translateY(2000px);filter:Alpha(opacity=0)}100%{opacity:1;-ms-transform:translateY(0);transform:translateY(0);filter:Alpha(opacity=100)}}@-o-keyframes layer-fadeInUpBig{0%{opacity:0;-o-transform:translateY(2000px);transform:translateY(2000px)}100%{opacity:1;-o-transform:translateY(0);transform:translateY(0)}}@keyframes hide-fadeInUpBig{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(2000px)}}@-webkit-keyframes hide-fadeInUpBig{0%{opacity:1;-webkit-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-webkit-transform:translateY(2000px);transform:translateY(2000px)}}@-moz-keyframes hide-fadeInUpBig{0%{opacity:1;-moz-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-moz-transform:translateY(2000px);transform:translateY(2000px)}}@-ms-keyframes hide-fadeInUpBig{0%{opacity:1;-ms-transform:translateY(0);transform:translateY(0);filter:Alpha(opacity=100)}100%{opacity:0;-ms-transform:translateY(2000px);transform:translateY(2000px);filter:Alpha(opacity=0)}}@-o-keyframes hide-fadeInUpBig{0%{opacity:1;-o-transform:translateY(0);transform:translateY(0)}100%{opacity:0;-o-transform:translateY(2000px);transform:translateY(2000px)}}@-webkit-keyframes layer-rollIn{0%{opacity:0;-webkit-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;-webkit-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}}@keyframes layer-rollIn{0%{opacity:0;transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;transform:translateX(0) rotate(0)}}@-moz-keyframes layer-rollIn{0%{opacity:0;-moz-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;-moz-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}}@-ms-keyframes layer-rollIn{0%{opacity:0;-ms-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg);filter:Alpha(opacity=0)}100%{opacity:1;-ms-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0);filter:Alpha(opacity=100)}}@-o-keyframes layer-rollIn{0%{opacity:0;-o-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}100%{opacity:1;-o-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}}@-webkit-keyframes hide-rollIn{0%{opacity:1;-webkit-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}100%{opacity:0;-webkit-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}}@keyframes hide-rollIn{0%{opacity:1;transform:translateX(0) rotate(0)}100%{opacity:0;transform:translateX(-100%) rotate(-120deg)}}@-moz-keyframes hide-rollIn{0%{opacity:1;-moz-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}100%{opacity:0;-moz-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}}@-ms-keyframes hide-rollIn{0%{opacity:1;-ms-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0);filter:Alpha(opacity=100)}100%{opacity:0;-ms-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg);filter:Alpha(opacity=0)}}@-o-keyframes hide-rollIn{0%{opacity:1;-o-transform:translateX(0) rotate(0);transform:translateX(0) rotate(0)}100%{opacity:0;-o-transform:translateX(-100%) rotate(-120deg);transform:translateX(-100%) rotate(-120deg)}}@keyframes layer-fadeIn{0%{opacity:0}100%{opacity:1}}@-webkit-keyframes layer-fadeIn{0%{opacity:0}100%{opacity:1}}@-moz-keyframes layer-fadeIn{0%{opacity:0}100%{opacity:1}}@-o-keyframes layer-fadeIn{0%{opacity:0}100%{opacity:1}}@-ms-keyframes layer-fadeIn{0%{opacity:0;filter:Alpha(opacity=0)}100%{opacity:1;filter:Alpha(opacity=100)}}@keyframes hide-fadeIn{0%{opacity:1}100%{opacity:0}}@-webkit-keyframes hide-fadeIn{0%{opacity:1}100%{opacity:0}}@-moz-keyframes hide-fadeIn{0%{opacity:1}100%{opacity:0}}@-o-keyframes hide-fadeIn{0%{opacity:1}100%{opacity:0}}@-ms-keyframes hide-fadeIn{0%{opacity:1}100%{opacity:0;filter:Alpha(opacity=0)}}@-webkit-keyframes layer-shake{0%,100%{-webkit-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-webkit-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-webkit-transform:translateX(10px);transform:translateX(10px)}}@keyframes layer-shake{0%,100%{transform:translateX(0)}10%,30%,50%,70%,90%{transform:translateX(-10px)}20%,40%,60%,80%{transform:translateX(10px)}}@-moz-keyframes layer-shake{0%,100%{-moz-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-moz-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-moz-transform:translateX(10px);transform:translateX(10px)}}@-ms-keyframes layer-shake{0%,100%{-ms-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-ms-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-ms-transform:translateX(10px);transform:translateX(10px)}}@-o-keyframes layer-shake{0%,100%{-o-transform:translateX(0);transform:translateX(0)}10%,30%,50%,70%,90%{-o-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-o-transform:translateX(10px);transform:translateX(10px)}}@-webkit-keyframes hide-shake{0%,100%{-webkit-transform:translateX(10px);transform:translateX(10px)}10%,30%,50%,70%,90%{-webkit-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-webkit-transform:translateX(0);transform:translateX(0)}100%{opacity:0}}@keyframes hide-shake{0%,100%{transform:translateX(10px)}10%,30%,50%,70%,90%{transform:translateX(-10px)}20%,40%,60%,80%{transform:translateX(0)}100%{opacity:0}}@-moz-keyframes hide-shake{0%,100%{-moz-transform:translateX(10px);transform:translateX(10px)}10%,30%,50%,70%,90%{-moz-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-moz-transform:translateX(0);transform:translateX(0)}100%{opacity:0}}@-ms-keyframes hide-shake{0%,100%{-ms-transform:translateX(10px);transform:translateX(10px)}10%,30%,50%,70%,90%{-ms-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-ms-transform:translateX(0);transform:translateX(0)}100%{opacity:0;filter:Alpha(opacity=0)}}@-o-keyframes hide-shake{0%,100%{-o-transform:translateX(10px);transform:translateX(10px)}10%,30%,50%,70%,90%{-o-transform:translateX(-10px);transform:translateX(-10px)}20%,40%,60%,80%{-o-transform:translateX(0);transform:translateX(0)}100%{opacity:0}}@keyframes layer-spread{0%{transform:scaleX(0);opacity:0}100%{transform:scaleX(1);opacity:1}}@-webkit-keyframes layer-spread{0%{-webkit-transform:scaleX(0);opacity:0}100%{-webkit-transform:scaleX(1);opacity:1}}@-moz-keyframes layer-spread{0%{-moz-transform:scaleX(0);opacity:0}100%{-moz-transform:scaleX(1);opacity:1}}@-o-keyframes layer-spread{0%{-o-transform:scaleX(0);opacity:0}100%{-o-transform:scaleX(1);opacity:1}}@-ms-keyframes layer-spread{0%{-ms-transform:scaleX(0);opacity:0;filter:Alpha(opacity=0)}100%{-ms-transform:scaleX(1);opacity:1;filter:Alpha(opacity=100)}}@keyframes hide-spread{0%{transform:scaleX(1)}50%{transform:scaleX(.5)}100%{transformX:scaleX(0);opacity:0}}@-webkit-keyframes hide-spread{0%{-webkit-transform:scaleX(1)}50%{-webkit-transform:scaleX(.5)}100%{-webkit-transform:scaleX(0);opacity:0}}@-moz-keyframes hide-spread{0%{-moz-transform:scaleX(1)}50%{-moz-transform:scaleX(.5)}100%{-moz-transform:scaleX(0);opacity:0}}@-ms-keyframes hide-spread{0%{-ms-transform:scaleX(1)}50%{-ms-transform:scaleX(.5)}100%{-ms-transform:scaleX(0);opacity:0;filter:Alpha(opacity=0)}}.showAlert[data-animation=layerFadeIn]{animation:layerFadeIn .3s;-webkit-animation:layerFadeIn .3s;-moz-animation:layerFadeIn .3s;-ms-animation:layerFadeIn .3s;-o-animation:layerFadeIn .3s}.showAlert[data-animation=showSweetAlert]{animation:showSweetAlert .3s;-webkit-animation:showSweetAlert .3s;-moz-animation:showSweetAlert .3s;-ms-animation:showSweetAlert .3s;-o-animation:showSweetAlert .3s}.showAlert[data-animation=none]{animation:none;-webkit-animation:none;-moz-animation:none;-ms-animation:none;-o-animation:none}.showAlert[data-animation=slideFromTop]{animation:slideFromTop .3s;-webkit-animation:slideFromTop .3s;-moz-animation:slideFromTop .3s;-ms-animation:slideFromTop .3s;-o-animation:slideFromTop .3s}.showAlert[data-animation=slideFromBottom]{animation:slideFromBottom .2s;-webkit-animation:slideFromBottom .2s;-moz-animation:slideFromBottom .2s;-ms-animation:slideFromBottom .2s;-o-animation:slideFromBottom .2s}.showAlert[data-animation=layer-fadeInUpBig]{animation:layer-fadeInUpBig .2s;-webkit-animation:layer-fadeInUpBig .2s;-moz-animation:layer-fadeInUpBig .2s;-ms-animation:layer-fadeInUpBig .2s;-o-animation:layer-fadeInUpBig .2s}.showAlert[data-animation=layer-rollIn]{animation:layer-rollIn .3s;-webkit-animation:layer-rollIn .3s;-moz-animation:layer-rollIn .3s;-ms-animation:layer-rollIn .3s;-o-animation:layer-rollIn .3s}.showAlert[data-animation=layer-fadeIn]{animation:layer-fadeIn .3s;-webkit-animation:layer-fadeIn .3s;-moz-animation:layer-fadeIn .3s;-ms-animation:layer-fadeIn .3s;-o-animation:layer-fadeIn .3s}.showAlert[data-animation=layer-shake]{animation:layer-shake .3s;-webkit-animation:layer-shake .3s;-moz-animation:layer-shake .3s;-ms-animation:layer-shake .3s;-o-animation:layer-shake .3s}.showAlert[data-animation=layer-spread]{animation:layer-spread .2s;-webkit-animation:layer-spread .2s;-moz-animation:layer-spread .2s;-ms-animation:layer-spread .2s;-o-animation:layer-spread .2s}.hideAlert[data-animation=layer-spread]{animation:hide-spread .5s forwards;-webkit-animation:hide-spread .5s forwards;-moz-animation:hide-spread .5s forwards;-ms-animation:hide-spread .5s forwards;-o-animation:hide-spread .5s forwards}.hideAlert[data-animation=slideFromTop]{animation:hideFromTop .2s forwards;-webkit-animation:hideFromTop .2s forwards;-moz-animation:hideFromTop .2s forwards;-ms-animation:hideFromTop .2s forwards;-o-animation:hideFromTop .2s forwards}.hideAlert[data-animation=slideFromBottom]{animation:hideFromBottom .2s forwards;-webkit-animation:hideFromBottom .2s forwards;-moz-animation:hideFromBottom .2s forwards;-ms-animation:hideFromBottom .2s forwards;-o-animation:hideFromBottom .2s forwards}.hideAlert[data-animation=showSweetAlert]{animation:hideSweetAlert .2s forwards;-webkit-animation:hideSweetAlert .2s forwards;-moz-animation:hideSweetAlert .2s forwards;-ms-animation:hideSweetAlert .2s forwards;-o-animation:hideSweetAlert .2s forwards}.hideAlert[data-animation=layerFadeIn]{animation:hideFadeIn .2s forwards;-webkit-animation:hideFadeIn .2s forwards;-moz-animation:hideFadeIn .2s forwards;-ms-animation:hideFadeIn .2s forwards;-o-animation:hideFadeIn .2s forwards}.hideAlert[data-animation=layer-fadeIn]{animation:hide-fadeIn .2s forwards;-webkit-animation:hide-fadeIn .2s forwards;-moz-animation:hide-fadeIn .2s forwards;-ms-animation:hide-fadeIn .2s forwards;-o-animation:hide-fadeIn .2s forwards}.hideAlert[data-animation=layer-fadeInUpBig]{animation:hide-fadeInUpBig .2s forwards;-webkit-animation:hide-fadeInUpBig .2s forwards;-moz-animation:hide-fadeInUpBig .2s forwards;-ms-animation:hide-fadeInUpBig .2s forwards;-o-animation:hide-fadeInUpBig .2s forwards}.hideAlert[data-animation=layer-rollIn]{animation:hide-rollIn .2s forwards;-webkit-animation:hide-rollIn .2s forwards;-moz-animation:hide-rollIn .2s forwards;-ms-animation:hide-rollIn .2s forwards;-o-animation:hide-rollIn .2s forwards}.hideAlert[data-animation=layer-shake]{animation:hide-shake .2s forwards;-webkit-animation:hide-shake .2s forwards;-moz-animation:hide-shake .2s forwards;-ms-animation:hide-shake .2s forwards;-o-animation:hide-shake .2s forwards}";
    return css;
};

function Style() {
    var css = ".box{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;font-family: 'Microsoft YaHei', '微软雅黑', 'Lantinghei SC', 'Open Sans', Arial, 'Hiragino Sans GB', 'STHeiti', 'WenQuanYi Micro Hei', SimSun, sans-serif;background-color:#fff;position:fixed;left:50%;top:50%;min-width:500px;box-shadow:0 5px 15px rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.2);border-radius:6px}.box-title i{position:absolute;right:10px;top:5px;font-size:25px;color:#999;cursor:pointer;font-style:normal}.box-title i:hover{color:#222}.box-title{position:relative;width:100%;padding:15px 0;min-height:10px;border-bottom:1px solid #e5e5e5;text-indent:15px;font-size:18px;font-weight:500;color:#333;box-sizing:border-box}.box-content{min-height:90px;width:100%;padding:10px 15px 25px 15px;font-size:14px;box-sizing:border-box}.box-button{width:100%;padding:13px 15px;border-top:1px solid #e5e5e5;text-align:right;box-sizing:border-box}.box-button span{margin:0 5px}";

    css += ".btn{display:inline-block;padding:6px 12px;margin-bottom:0;font-size:14px;font-weight:400;line-height:1.42857143;text-align:center;white-space:nowrap;vertical-align:middle;text-align:center;cursor:pointer;border-radius:4px;border:1px solid transparent}.btn:hover{filter:alpha(Opacity=80);-moz-opacity:.8;opacity:.8}.btn-primary{color:#fff;background-color:#337ab7;border-color:#2e6da4!important}.btn-primary:hover{filter:alpha(Opacity=100)!important;-moz-opacity:1!important;opacity:1!important;background-color:#286090}.btn-secondary{color:#fff;background-color:#0f9ae0}.btn-remind{color:#fff;background-color:#FFB800}.btn-notice{color:#fff;background-color:#FF5722}.btn-notice:hover{color:#fff!important}.btn-currency{color:#444;background-color:#fff;border:1px #ccc solid}.btn-currency:hover{filter:alpha(Opacity=100)!important;-moz-opacity:1!important;opacity:1!important;background-color:#eaeaea!important;color:#333!important}.btn-disable{border:1px solid #e6e6e6!important;background-color:#FBFBFB!important;color:#C9C9C9;cursor:not-allowed!important;box-shadow:0 0 0 #888!important}.btn-disable:hover{filter:alpha(Opacity=100)!important;-moz-opacity:1!important;opacity:1!important;box-shadow:0 0 0 #888!important}";
    return css;
}