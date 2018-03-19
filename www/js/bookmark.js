function LoadBookmark() {
    var reshtml = "", json = loadBookmark()[inst];
    loadNav('olist_nav.html');
    reshtml += "<div class=\"toot\">\n" +
        "      ブックマークはKnzkApp独自の機能で、データが端末内に保管されます。<br>ブックマークはインスタンスごとに区別されます。\n" +
        "    </div>";
    if (json[0]) {
        renderBookmark(reshtml, json, 0);
    } else {
        setTimeout(function () {
            document.getElementById("olist_nav_title").innerHTML = "ブックマーク";
            document.getElementById("olist_nav_main").innerHTML = reshtml;
        }, 1000);
    }
}

function renderBookmark(reshtml, json_bookmark, i) {
    fetch("https://"+inst+"//api/v1/statuses/"+json_bookmark[i], {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            sendLog("Error/show_bookmark", response.json);
            showtoast('cannot-pros');
        }
    }).then(function(json) {
        reshtml += toot_card(json, "full", null);
        if (!json_bookmark[i+1]) {
            document.getElementById("olist_nav_title").innerHTML = "ブックマーク";
            document.getElementById("olist_nav_main").innerHTML = reshtml;
            document.getElementById("olist_right").innerHTML = "<ons-toolbar-button onclick=\"clearBookmark()\" class=\"toolbar-button\">\n" +
                "<ons-icon icon='fa-trash' class=\"ons-icon fa-trash fa\"></ons-icon>\n" +
                "</ons-toolbar-button>";
        } else { //次ある
            renderBookmark(reshtml, json_bookmark, i+1);
        }
    });
}

function initBookmark() {
    var bookmark = JSON.parse(localStorage.getItem("knzkapp_bookmark"));
    if (bookmark == undefined) {
        localStorage.setItem('knzkapp_bookmark', JSON.stringify({}));
        bookmark = JSON.parse(localStorage.getItem("knzkapp_bookmark"));
    }
    if (!bookmark[inst]) {
        bookmark[inst] = [];
        localStorage.setItem('knzkapp_bookmark', JSON.stringify(bookmark));
    }
}

function changeBookmark(id) {
    var json = loadBookmark();
    if (checkBookmark(id)) { //削除
        json[inst].splice(json[inst].indexOf(id), 1);
    } else { //追加
        json[inst].unshift(""+id);
    }
    saveBookmark(json);
}

function checkBookmark(id) { //ブックマークされて無ければfalse
    var json = loadBookmark();
    return json[inst].indexOf(""+id) !== -1;
}

function loadBookmark() {
    return JSON.parse(localStorage.getItem("knzkapp_bookmark"));
}

function saveBookmark(json) {
    localStorage.setItem('knzkapp_bookmark', JSON.stringify(json));
    showtoast('ok_conf_2');
}

function clearBookmark() {
    ons.notification.confirm('本当に削除しますか？<br>※'+inst+'のアカウントのブックマークが対象です。', {title: 'ブックマーク全削除'}).then(function (e) {
        if (e === 1) {
            var bookmark = loadBookmark();
            bookmark[inst] = [];
            saveBookmark(bookmark);
            BackTab();
        }
    });
}