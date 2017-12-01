function openDoodle(simple) {
    if (simple) image_mode = "_simple"; else image_mode = "";
    document.getElementById("navigator").removeAttribute("swipeable");
    if (localStorage.getItem('knzk_swipe_menu') == 1) document.getElementById("splitter-menu").removeAttribute("swipeable");
    $.when(
        document.querySelector('#navigator').bringPageTop("doodle.html", {animation: "lift"})
    ).done(function () {
        sketcher = atrament('#mySketcher', window.innerWidth, window.innerHeight-50);
        sketcher.smoothing = false;
        sketcher.adaptiveStroke = false;
        doodle_mode = "draw";
        doodle_old_color = "#000000";
        var canvas = document.getElementById('mySketcher');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
}

function Doodle_reset() {
    ons.notification.confirm('お絵かきが破棄されますがよろしいですか？', {title: 'リセット'}).then(function (e) {
        if (e === 1) {
            sketcher.clear();
            hidePopover('doodle_popover');

            var canvas = document.getElementById('mySketcher');
            var ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });
}

function closeDoodle(force) {
    if (force) {
        document.getElementById("navigator").setAttribute("swipeable", "");
        if (localStorage.getItem('knzk_swipe_menu') == 1) document.getElementById("splitter-menu").setAttribute('swipeable', '1');
        BackTab('down');
    } else {
        ons.notification.confirm('お絵かきが破棄されますがよろしいですか？', {title: 'お絵かきを閉じる'}).then(function (e) {
            if (e === 1) {
                document.getElementById("navigator").setAttribute("swipeable", "");
                if (localStorage.getItem('knzk_swipe_menu') == 1) document.getElementById("splitter-menu").setAttribute('swipeable', '1');
                BackTab('down');
            }
        });
    }
}

function dataURLtoFile(dataURI) {
    var binary = atob(dataURI.split(',')[1]), array = [];
    for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
    return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

function Doodle_upload() {
    ons.notification.confirm('よろしいですか？', {title: 'アップロード'}).then(function (e) {
        if (e === 1) {
            closeDoodle(true);
            var dataUrl = sketcher.toImage();
            up_file_suc(null, dataURLtoFile(dataUrl));
        }
    });
}

function Doodle_config(id) {
    var mode = document.getElementById("doodle_"+id).checked;
    if (ons.platform.isIOS()) {
        if (mode == true) {
            Doodle_changeType(id, false);
        } else {
            Doodle_changeType(id, true);
        }
    } else {
        if (mode == true) {
            Doodle_changeType(id, true);
        } else {
            Doodle_changeType(id, false);
        }
    }
}

function Doodle_changeMode() {
    var now = doodle_mode;
    var button = document.getElementById("doodle_pen_bt");
    if (now === "draw") {
        sketcher.color = doodle_old_color;
        button.className = "ons-icon fa-bath fa";
        sketcher.mode = "fill";
        doodle_mode = "fill";
    } else if (now === "fill") {
        button.className = "ons-icon fa-eraser fa";
        sketcher.color = '#ffffff';
        sketcher.mode = "draw";
        doodle_mode = "erase";
    } else {
        sketcher.color = doodle_old_color;
        button.className = "ons-icon fa-pencil fa";
        sketcher.mode = "draw";
        doodle_mode = "draw";
    }
}

function Doodle_changeType(id, mode) {
    if (id === "smooth") {
        sketcher.smoothing = mode;
    } else if (id === "adaptive") {
        sketcher.adaptiveStroke = mode;
    }
}

