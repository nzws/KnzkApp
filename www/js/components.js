var showPopover = function(target, id) {
    document
        .getElementById(id)
        .show(target);
};

var hidePopover = function(id) {
    document
        .getElementById(id)
        .hide();
};

window.fn = {};

window.fn.open = function() {
    var menu = document.getElementById('splitter-menu');
    menu.open();
    account_list();
    reset_nav();
};

function reset_nav() {
    var list = document.getElementById("music-form");
    var menu = document.getElementById("menu-list");
    var account_list = document.getElementById("account-list");
    list.style.display = "none";
    account_list.style.display = "none";
    menu.style.display = "block";
}

function load(page) {
    if (page != "home.html") {
        try {old_TL_ws.close();} catch(e) {console.log("ws_close_error");}
    }
    loadNav(page, null, true);
}

function loadNav(page, mode, splitter, splitter_next) {
    var option;
    if (mode === "up") option = {animation:"lift"};
    else option = {animation:"slide"};

    if (splitter) {
        var menu = document.getElementById('splitter-menu');
        if (splitter_next) {
            document.querySelector('#navigator').bringPageTop(page, option).then(menu.close.bind(menu));
        } else {
            document.querySelector('#navigator').resetToPage(page, {animation:"none"}).then(menu.close.bind(menu));
        }
    } else {
        document.querySelector('#navigator').bringPageTop(page, option);
    }
}

function BackTab(mode) {
    var option;
    if (mode === "down") option = {animation:"lift"};
    else option = {animation:"slide"};

    document.querySelector('#navigator').popPage(option);
}

function displayTime(mode, time) {
    if (mode == 'new') {
        return new Date(time).toTwitterRelativeTime('ja');
    } else {
        var i = 0;
        var list = document.getElementsByClassName("date");
        while (list[i]) {
            list[i].innerHTML = displayTime('new', list[i].dataset.time);
            i++;
        }
    }
}

function opendial() {
    if (localStorage.getItem('knzk_dial') == 'toot') {
        loadNav('post.html', 'up');
    } else if (localStorage.getItem('knzk_dial') == 'alert') {
        openTL('alert_nav');
    } else if (localStorage.getItem('knzk_dial') == 'reload') {
        showTL(null, "dial");
    }
}

function showtoast(id) {
    document.getElementById(id).show();
    setTimeout(function () { //3秒くらい
        document.getElementById(id).hide();
    }, 2000);
}

function t_text(text) {
    var i = 0, emoji = "", replacetext = "";

    if (localStorage.getItem('knzk_joke') == 1) {
        text = text.replace(/。/g , "、それと便座カバー。");
        text = text.replace(/toot/g , "awoo");
        text = text.replace(/TOOT/g , "AWOO");
        text = text.replace(/(神崎|おにいさん)/g , "<span style='color: red'>$1</span>");
        text = text.replace(/(NCLS|ニコラス|あんのたん)/g , "<span class='fav-active'>$1</span>");
        text = text.replace(/(ごちうさ|ご注文はうさぎですか？)/g , "あぁ^～心がぴょんぴょんするんじゃぁ^～");
        text = text.replace(/35億/g , "5000兆円");
        text = text.replace(/がっこうぐらし/g , "【窓割れてね？】");
        text = text.replace(/(ニート|無職)/g , "【部屋に閉じこもって生きていればそれでいいの？】");
    }

    text = text.replace(/5,?000\s*兆円/g , "<img src=\"https://knzk.me/emoji/5000tyoen.svg\" style=\"height: 1.8em;\"/>");
    text = text.replace(/:nicoru(-?\d+):/g , "<img src=\"https://knzk.me/emoji/nicoru.svg\" style=\"height: 1.5em; transform: rotate($1deg)\"/>");
    text = text.replace(/:nicoru:/g , "<img src=\"https://knzk.me/emoji/nicoru.svg\" style=\"height: 1.5em;\"/>");
    text = text.replace(/バジリスク\s*タイム/g , "<img src=\"https://knzk.me/emoji/basilisktime.png\" height=\"40\"/>");
    text = text.replace(/熱盛/g , "<img src=\"https://knzk.me/emoji/atumori.svg\" style=\"height: 2.5em\"/>");
    text = text.replace(/欲しい！/g , "<img src=\"https://knzk.me/emoji/hosii.png\" height=\"30\"/>");

    while (emoji_num_a[i]) {
        emoji = ":" + emoji_num_a[i] + ":";

        replacetext = "<img draggable=\"false\" class=\"emojione\" src=\""+emoji_list[emoji_num_a[i]]+"\" />";
        text = text.replace(new RegExp(emoji,"g"),replacetext);
        i++;
    }

    text = emojione.toImage(text);
    //twemoji.parse(text);
    return text;
}

function show(id) {
    document.getElementById(id).show();
}

function hide(id) {
    document.getElementById(id).hide();
}

function change_conf(name, id, sel) {
    if (sel) {
        var type = document.getElementById(id).value;
        localStorage.setItem(name, type);
    } else {
        var mode = document.getElementById(id).checked;
        if (ons.platform.isIOS()) {
            if (mode == true) {
                localStorage.setItem(name, 0);
            } else {
                localStorage.setItem(name, 1);
            }
        } else {
            if (mode == true) {
                localStorage.setItem(name, 1);
            } else {
                localStorage.setItem(name, 0);
            }
        }
    }
    showtoast('ok_conf');
}