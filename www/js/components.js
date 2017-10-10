function load(page) {
    document.querySelector('ons-tabbar').setActiveTab(page, {animation:"slide"});
}

function loadNav(page, mode) {
    var option;
    if (mode === "up") option = {animation:"lift"};
     else option = {animation:"slide"};

    document.querySelector('#navigator').bringPageTop(page, option);
}

function BackTab(mode) {
    var option;
    if (mode === "down") option = {animation:"lift"};
    else option = {animation:"slide"};

    document.querySelector('#navigator').popPage(option);
}

function displayTime(mode, time) {
    if (mode == 'new') {
        var now_date = new Date();
        var toot_date = new Date(time);
        var comp_date = new Date(now_date.getTime() - toot_date.getTime());
        var y = comp_date.getFullYear() - 1970;
        var m = comp_date.getMonth() - 1;
        var d = comp_date.getDate() - 1;
        var h = comp_date.getHours() - 9;
        var min = comp_date.getMinutes();
        var s = comp_date.getSeconds();

        if (y > 0) return "" + y + "年前";
        else if (m > 0) return "" + m + "ヶ月前";
        else if (d > 0) return "" + d + "日前";
        else if (h > 0) return "" + h + "時間前";
        else if (min > 0) return "" + min + "分前";
        else if (s > 0) return "" + s + "秒前";
        else return "たった今";
    } else {
        var i = 0;
        var list = document.getElementsByClassName("date");
        while (list[i]) {
            list[i].innerHTML = displayTime('new', list[i].dataset.time);
            i++;
        }
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
    text = text.replace(/5,?000\s*兆円/g , "<img src=\"https://knzk.me/emoji/5000tyoen.svg\" style=\"height: 1.8em;\"/>");
    text = text.replace(/ニコる/g , "<img src=\"https://knzk.me/emoji/nicoru.svg\" style=\"height: 1.5em;\"/>");
    text = text.replace(/バジリスク\s*タイム/g , "<img src=\"https://knzk.me/emoji/basilisktime.png\" height=\"40\"/>");
    text = text.replace(/熱盛/g , "<img src=\"https://knzk.me/emoji/atumori.png\" height=\"51\"/>");
    text = text.replace(/欲しい！/g , "<img src=\"https://knzk.me/emoji/hosii.png\" height=\"30\"/>");

    while (emoji_num_a[i]) {
        emoji = ":" + emoji_num_a[i] + ":";

        replacetext = "<img draggable=\"false\" class=\"emojione\" src=\""+emoji_list[emoji_num_a[i]]+"\" />";
        text = text.replace(new RegExp(emoji,"g"),replacetext);
        i++;
    }

    text = emojione.toImage(text);
    return text;
}

function show(id) {
    document.getElementById(id).show();
}

function hide(id) {
    document.getElementById(id).hide();
}

function change_conf(name, id) {
    var mode = document.getElementById(id).checked;
    if (isios) { //iOS
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
    showtoast('ok_conf');
}