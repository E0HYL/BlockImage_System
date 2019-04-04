var menuRight = document.getElementById('cbp-spmenu-s2'),
    showRightPush = document.getElementById('showRightPush'),
    body = document.body;

function seronclick() {
    $(".services").removeClass("nondisplay");
    $(".imgsearch").addClass("nondisplay");
    $(".gallery").addClass("nondisplay");
    $(".single").addClass("nondisplay");
    $(".contact").addClass("nondisplay");
    $(".upload").addClass("nondisplay");
    $("#li4").addClass("active");
    $("#li2").removeClass("active");
    $("#li3").removeClass("active");
    $("#li1").removeClass("active");
    // console.log(this)
    classie.toggle(showRightPush, 'active');
    classie.toggle(body, 'cbp-spmenu-push-toleft');
    classie.toggle(menuRight, 'cbp-spmenu-open');
    disableOther('showRightPush');
    // classie.toggle( showRightPush, 'disabled' );
};

function galonclick() {
    $(".gallery").removeClass("nondisplay");
    $(".imgsearch").addClass("nondisplay");
    $(".services").addClass("nondisplay");
    $(".single").addClass("nondisplay");
    $(".contact").addClass("nondisplay");
    $(".upload").addClass("nondisplay");
    $("#li3").addClass("active");
    $("#li4").removeClass("active");
    $("#li2").removeClass("active");
    $("#li1").removeClass("active");
    // console.log(this)
    classie.toggle(showRightPush, 'active');
    classie.toggle(body, 'cbp-spmenu-push-toleft');
    classie.toggle(menuRight, 'cbp-spmenu-open');
    disableOther('showRightPush');
}

function singleonclick() {
    $(".single").removeClass("nondisplay");
    $(".imgsearch").addClass("nondisplay");
    $(".contact").addClass("nondisplay");
    $(".services").addClass("nondisplay");
    $(".gallery").addClass("nondisplay");
    $(".upload").addClass("nondisplay");
    $("#li2").removeClass("active");
    $("#li4").removeClass("active");
    $("#li3").removeClass("active");
    $("#li1").removeClass("active");
}

function contactonclick() {
    $(".contact").removeClass("nondisplay");
    $(".imgsearch").addClass("nondisplay");
    $(".single").addClass("nondisplay");
    $(".services").addClass("nondisplay");
    $(".gallery").addClass("nondisplay");
    $(".upload").addClass("nondisplay");
    $("#li2").removeClass("active");
    $("#li4").removeClass("active");
    $("#li3").removeClass("active");
    $("#li1").removeClass("active");
}

function uploadonclick() {
    $(".upload").removeClass("nondisplay");
    $(".imgsearch").addClass("nondisplay");
    $(".services").addClass("nondisplay");
    $(".gallery").addClass("nondisplay");
    $(".contact").addClass("nondisplay");
    $(".single").addClass("nondisplay");
    $("#li2").addClass("active");
    $("#li4").removeClass("active");
    $("#li3").removeClass("active");
    $("#li1").removeClass("active");
    // console.log(this)
    classie.toggle(showRightPush, 'active');
    classie.toggle(body, 'cbp-spmenu-push-toleft');
    classie.toggle(menuRight, 'cbp-spmenu-open');
    disableOther('showRightPush');
}
showRightPush.onclick = function() {
    classie.toggle(this, 'active');
    classie.toggle(body, 'cbp-spmenu-push-toleft');
    classie.toggle(menuRight, 'cbp-spmenu-open');
    disableOther('showRightPush');
};

function disableOther(button) {
    if (button !== 'showRightPush') {
        classie.toggle(showRightPush, 'disabled');
    }
}