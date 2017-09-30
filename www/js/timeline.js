function reset_alert() {
    hide('clear-alert');
    fetch("https://"+inst+"/api/v1/notifications/clear", {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        showtoast('ok-clear-alert');
        showAlert();
        alert_old_id = 0;
        alert_new_id = 0;
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}

function showAlert(reload, more_load) {
    var get = "", reshtml = "", i = 0, alert_text = "", e = 0;
    if (reload) {
        get = "?since_id="+alert_new_id;
    }
    if (more_load) {
        more_load.value = "読み込み中...";
        more_load.disabled = true;
        get = "?max_id="+alert_old_id;
    }
    fetch("https://"+inst+"/api/v1/notifications"+get, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-load');
            if (reload) reload();
            return false;
        }
    }).then(function(json) {
        if (json[i]) {
            displayTime('update');
            if (more_load) {
                more_load.className = "button button--large--quiet invisible";
                reshtml = document.getElementById("alert_main").innerHTML;
            }
            while (json[i]) {
                alert_new_id = json[0]['id'];

                if (json[i]['type'] === "follow") {
                    if (!json[i]['account']['display_name']) json[i]['account']['display_name'] = json[i]['account']['username'];
                    alert_text = "<p class='alert_text'>";
                    alert_text += "<ons-icon icon=\"fa-user-plus\" class='boost-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + json[i]['account']['display_name'] + "</b>さんにフォローされました";
                    alert_text += "</p>";
                    reshtml += "<div class=\"toot\">\n" +
                        alert_text +
                        "                    <div class=\"row\">\n" +
                        "                        <div class=\"col-xs-2\">\n" +
                        "                            <p><img src=\"" + json[i]['account']['avatar'] + "\" class=\"icon-img\" onclick='show_account(" + json[i]['account']['id'] + ")'/></p>\n" +
                        "                        </div>\n" +
                        "                        <div class=\"col-xs-9 toot-card-right\">\n" +
                        "                            <div class=\"toot-group\">\n" +
                        "                                <span onclick='show_account(" + json[i]['account']['id'] + ")'><b>" + json[i]['account']['display_name'] + "</b> <small>@" + json[i]['account']['acct'] + "</small></span>\n" +
                        "                            </div>\n" +
                        "                        </div>\n" +
                        "                    </div>\n" +
                        "            </div>";
                } else {
                    if (json[i]["type"] === "favourite") {
                        alert_text = "<ons-icon icon=\"fa-bell\" class='fav-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + json[i]['account']['display_name'] + "</b>さんがお気に入りに登録しました";
                    }
                    if (json[i]["type"] === "reblog") {
                        alert_text = "<ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + json[i]['account']['display_name'] + "</b>さんがブーストしました";
                    }

                    reshtml += toot_card(json[i]['status'], null, alert_text);
                }
                alert_text = "";
                i++;
            }
            if (reload) { //追加読み込み
                reshtml += document.getElementById("alert_main").innerHTML;
            }
            if (more_load || !reload) { //TL初回
                alert_old_id = json[i-1]['id'];
                reshtml += "<button class='button button--large--quiet' onclick='showAlert(null,this)'>もっと読み込む...</button>";
            }
            document.getElementById("alert_main").innerHTML = reshtml;
        }
        if (reload) reload();
        initph();
        return true;
    });
}

/**
 * 自分でもわけわからなくなってるのでいつか書き直す
 * @param mode タイムラインの種類 home=ホーム, local=ローカルTL, public=連合TL
 * @param reload 引っ張って更新を終了させる変数を入れる
 * @param more_load もっと読み込むのボタンオブジェクト (thisでぶち込む)
 * @param clear_load 一旦破棄してやり直すときtrue
 * @param change_TL TLを変更する時true
 */
function showTL(mode, reload, more_load, clear_load, change_TL) {
    var tlmode = "", i = 0, reshtml = "", pagetitle = "", e = 0;
    if (!mode) mode = now_TL;
    if (clear_load) {
        toot_new_id = 0;
        toot_old_id = 0;
        more_load = false;
    }
    if (more_load) {
        more_load.value = "読み込み中...";
        more_load.disabled = true;
    }
    if (mode === "home") {
        if (more_load)
            tlmode = "home?max_id="+toot_old_id;
        else
            tlmode = "home?since_id="+toot_new_id;
        pagetitle = "ホーム";
    }else if (mode === "public") {
        if (more_load)
            tlmode = "public?max_id="+toot_old_id;
        else
            tlmode = "public?since_id="+toot_new_id;
        pagetitle = "連合TL";
    } else if (mode === "local") {
        pagetitle = "ローカルTL";
        if (more_load)
            tlmode = "public?local=true&max_id="+toot_old_id;
        else
            tlmode = "public?local=true&since_id="+toot_new_id;
    }
    fetch("https://"+inst+"/api/v1/timelines/"+tlmode, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-load');
            if (reload) reload();
            return false;
        }
    }).then(function(json) {
        if (!more_load && mode == last_load_TL && !clear_load) {
            displayTime('update');
        }
        if (more_load) {
            more_load.className = "button button--large--quiet invisible";
            reshtml = document.getElementById("home_main").innerHTML;
        }

        while (json[i]) {
            toot_new_id = json[0]['id'];
            reshtml += toot_card(json[i], "full", null);
            i++;
        }

        if (!more_load && mode == last_load_TL && !clear_load) { //追加読み込みでない&前回と同じTL
            reshtml += document.getElementById("home_main").innerHTML;
        }
        if (more_load || mode != last_load_TL || clear_load) { //TL初回
            initph();
            toot_old_id = json[i-1]['id'];
            reshtml += "<button class='button button--large--quiet' onclick='showTL(null,null,this)'>もっと読み込む...</button>";
        }
        last_load_TL = mode;
        document.getElementById("home_main").innerHTML = reshtml;
        document.getElementById("TL_name").innerHTML = pagetitle;
        if (reload) reload();
        if (change_TL) hide('now_loading');
        return true;
    });
}

function showAccountTL(id, more_load, media) {
    var i = 0, reshtml = "", get = "", reshtml_pinned = "";
    if (more_load) {
        more_load.value = "読み込み中...";
        more_load.disabled = true;
        if (media)
            get = "?max_id="+account_toot_old_id+"&only_media=true";
        else
            get = "?max_id="+account_toot_old_id;
    } else {
        account_toot_old_id = 0;
        if (media)
            get = "?only_media=true";
    }

    if (!media) {
        fetch("https://"+inst+"/api/v1/accounts/"+id+"/statuses?pinned=true", {
            headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                showtoast('cannot-load');
                return false;
            }
        }).then(function(json) {
            while (json[i]) {
                reshtml_pinned += toot_card(json[i], "full", "<ons-icon icon='fa-thumb-tack'></ons-icon>　固定トゥート");
                i++;
            }
            document.getElementById("account_pinned_toot").innerHTML = reshtml_pinned;
            return true;
        });
    } else {
        //メディア時は固定トゥート表示しない
        document.getElementById("account_pinned_toot").innerHTML = "";
    }
    fetch("https://"+inst+"/api/v1/accounts/"+id+"/statuses"+get, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-load');
            return false;
        }
    }).then(function(json) {
        if (!more_load) {
            displayTime('update');
        }
        if (more_load) {
            more_load.className = "button button--large--quiet invisible";
            reshtml = document.getElementById("account_toot").innerHTML;
        }
        i = 0;
        while (json[i]) {
            reshtml += toot_card(json[i], "full", null);
            i++;
        }

        account_toot_old_id = json[i-1]['id'];
        if (media)
            reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this, true)'>もっと読み込む...</button>";
        else
            reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this)'>もっと読み込む...</button>";

        document.getElementById("account_toot").innerHTML = reshtml;
        return true;
    });
}

function TL_prev() {
    toot_old_id = 0;
    toot_new_id = 0;
    show('now_loading');
    if (now_TL == "local") {
        hide('now_loading');
        return false;
    } else if (now_TL == "home") {
        now_TL = "local";
        showTL(null,null,null,null,true);
    } else if (now_TL == "public") {
        now_TL = "home";
        showTL(null,null,null,null,true);
    }
}

function TL_next() {
    toot_old_id = 0;
    toot_new_id = 0;
    show('now_loading');
    if (now_TL == "local") {
        now_TL = "home";
        showTL(null,null,null,null,true);
    } else if (now_TL == "home") {
        now_TL = "public";
        showTL(null,null,null,null,true);
    } else if (now_TL == "public") {
        hide('now_loading');
        return false;
    }
}