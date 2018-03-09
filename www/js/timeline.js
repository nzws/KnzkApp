function reset_alert() {
    hide('clear-alert');
    fetch("https://"+inst+"/api/v1/notifications/clear", {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            sendLog("Error/noti_clear", response);
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
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            if (more_load) more_load.className = "invisible";
            return response.json();
        } else {
            sendLog("Error/noti", response);
            showtoast('cannot-load');
            if (reload) reload();
            return false;
        }
    }).then(function(json) {
        if (json[i]) {
            displayTime('update');
            if (more_load) {
                reshtml = document.getElementById("alert_main").innerHTML;
            }
            while (json[i]) {
                alert_new_id = json[0]['id'];
                if (!json[i]['account']['display_name']) json[i]['account']['display_name'] = json[i]['account']['username'];

                if (json[i]['type'] === "follow") {
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
                        alert_text = "<ons-icon icon=\"fa-star\" class='fav-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + json[i]['account']['display_name'] + "</b>さんがお気に入りに登録しました (<span data-time='"+json[i]['created_at']+"' class='date'>" +displayTime('new', json[i]['created_at'])+ "</span>)";
                    }
                    if (json[i]["type"] === "reblog") {
                        alert_text = "<ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + json[i]['account']['display_name'] + "</b>さんがブーストしました (<span data-time='"+json[i]['created_at']+"' class='date'>" +displayTime('new', json[i]['created_at'])+ "</span>)";
                    }

                    reshtml += toot_card(json[i]['status'], "full", alert_text, null, "alert");
                }
                alert_text = "";
                i++;
            }
            if (reload) { //追加読み込み
                reshtml += document.getElementById("alert_main").innerHTML;
            }
            if (more_load || !reload) { //TL初回
                if (i !== 0) alert_old_id = json[i-1]['id'];
                reshtml += "<button class='button button--large--quiet' onclick='showAlert(null,this)'>もっと読み込む...</button>";
            }
            document.getElementById("alert_main").innerHTML = reshtml;
        }
        if (reload) reload();
        return true;
    });
}

function openTL(mode) {
    if (mode === "alert") {
        load("alert.html");
        showAlert();
        setTimeout(function () {
            initph("alert");
        }, 200);
    } else if (mode === "alert_nav") {
        loadNav("alert.html");
        showAlert();
        setTimeout(function () {
            document.getElementById("alert_button").innerHTML = "<ons-toolbar-button onclick=\"BackTab()\" class=\"toolbar-button\">\n" +
                "                    <ons-icon icon=\"fa-chevron-left\" class=\"ons-icon fa-chevron-left fa\"></ons-icon>\n" +
                "                    戻る\n" +
                "                </ons-toolbar-button>";
            initph("alert");
            if (getConfig(1, 'alert-back') == '1') {
                $("#alert-speed_dial").removeClass("invisible");
            }
        }, 200);
    } else {
        try {TL_websocket.close();} catch(e) {console.log("ws_close_error");}
        load("home.html");
        now_TL = "local";
        showTL(null, null, null, true);
        setTimeout(function () {
            var dial = getConfig(1, 'dial'), icon;
            if (dial && dial != "change") {
                $("#dial_main").removeClass("invisible");
                if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell"; if (dial === "reload") icon = "fa-refresh";
                document.getElementById("dial-icon").className = "ons-icon fa "+icon;
            } else if (dial) {
                $("#dial_TL").removeClass("invisible");
            }
        }, 200);
    }
}

/**
 * 自分でもわけわからなくなってるのでいつか書き直す
 * @param mode タイムラインの種類 home=ホーム, local=ローカルTL, public=連合TL
 * @param reload 引っ張って更新を終了させる変数を入れる
 * @param more_load もっと読み込むのボタンオブジェクト (thisでぶち込む)
 * @param clear_load 一旦破棄してやり直すときtrue
 */
function showTL(mode, reload, more_load, clear_load) {
    var tlmode = "", i = 0, reshtml = "", ws_mode, id_main, n;
    if (!mode) mode = now_TL;
    if (clear_load) {
        if (TL_websocket) {
            TL_websocket.close();
            TL_websocket = null;
        }
        home_auto_tmp = "";
        home_auto_num = 0;
        toot_new_id = 0;
        toot_old_id = 0;
        more_load = false;
        setTLheadcolor(0);
        try {
            if (last_load_TL) document.querySelector('#'+last_load_TL+'_main > .page__content').innerHTML = "";
        } catch (e) {
            console.error(e);
        }
    }
    if (mode === "home") {
        id_main = "home_main";
        if (more_load)
            tlmode = "home?max_id="+toot_old_id;
        else
            tlmode = "home?since_id="+toot_new_id;
        n = true;
    } else if (mode === "public") {
        id_main = "public_main";
        if (more_load)
            tlmode = "public?max_id="+toot_old_id;
        else
            tlmode = "public?since_id="+toot_new_id;
        n = true;
    } else if (mode === "local") {
        id_main = "local_main";
        if (more_load)
            tlmode = "public?local=true&max_id="+toot_old_id;
        else
            tlmode = "public?local=true&since_id="+toot_new_id;
        n = true;
    } else if (mode === "local_media") {
        id_main = "local_media_main";
        if (more_load)
            tlmode = "public?local=true&max_id="+toot_old_id;
        else
            tlmode = "public?limit=40&local=true&since_id="+toot_new_id;
        n = true;
    } else if (mode === "public_media") {
        id_main = "public_media_main";
        if (more_load)
            tlmode = "public?max_id="+toot_old_id;
        else
            tlmode = "public?limit=40&since_id="+toot_new_id;
        n = true;
    }
    if (more_load) more_load.className = "invisible";
    if (n) {
        fetch("https://"+inst+"/api/v1/timelines/"+tlmode, {
            headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                sendLog("Error/timeline", response);
                showtoast('cannot-load');
                if (reload && reload !== "dial") reload();
                return false;
            }
        }).then(function(json) {
            if (json) {
                if (!more_load && mode == last_load_TL && !clear_load) {
                    displayTime('update');
                }
                if (more_load) {
                    reshtml = document.querySelector('#'+id_main+' > .page__content').innerHTML;
                } else {
                    if (getConfig(1, 'realtime') == 1) {
                        if (mode === "public" || mode === "public_media")
                            ws_mode = "public";
                        else if (mode === "local" || mode === "local_media")
                            ws_mode = "public:local";
                        else
                            ws_mode = "user";

                        if (!reload && !more_load) {
                            TL_websocket = new WebSocket("wss://"+inst+"/api/v1/streaming/?access_token=" + localStorage.getItem('knzkapp_now_mastodon_token') + "&stream=" + ws_mode);
                            TL_websocket.onmessage = function (message) {
                                displayTime('update');
                                var ws_resdata = JSON.parse(message.data);
                                var ws_reshtml = JSON.parse(ws_resdata.payload);

                                if (ws_resdata.event === "update") {
                                    if (ws_reshtml['id']) {
                                        if (toot_new_id !== ws_reshtml['id']) {
                                            var TLmode = mode === "local_media" || mode === "public_media" ? "media" : "";

                                            var h = document.querySelector('#'+mode+'_main > .page__content').scrollTop;
                                            home_auto_mode = h <= 100;

                                            if (home_auto_mode) { //OK
                                                home_auto_event = false;
                                                document.querySelector('#'+mode+'_main > .page__content').innerHTML = toot_card(ws_reshtml, "full", null, TLmode) + home_auto_tmp + document.querySelector('#'+mode+'_main > .page__content').innerHTML;
                                                home_auto_tmp = "";
                                                home_auto_num = 0;
                                                setTLheadcolor(0);
                                            } else {
                                                home_auto_tmp = toot_card(ws_reshtml, "full", null, TLmode) + home_auto_tmp;
                                                if (!home_auto_event) {
                                                    home_auto_event = true;
                                                    home_autoevent();
                                                }
                                            }


                                            if (!home_auto_mode && (ws_reshtml['media_attachments'][0] && TLmode === "media")) {
                                                home_auto_num++;
                                                setTLheadcolor(1);
                                            }
                                        }
                                        toot_new_id = ws_reshtml['id'];
                                    }
                                } else if (ws_resdata.event === "delete") {
                                    var del_toot = document.getElementById("post_"+ws_resdata.payload);
                                    del_toot.parentNode.removeChild(del_toot);
                                }
                            };
                        }
                    }
                }

                while (json[i]) {
                    var TLmode;
                    if (mode === "local_media" || mode === "public_media") TLmode = "media"; else TLmode = "";
                    toot_new_id = json[0]['id'];
                    reshtml += toot_card(json[i], "full", null, TLmode);
                    i++;
                }

                if (!more_load && mode == last_load_TL && !clear_load) { //追加読み込みでない&前回と同じTL
                    reshtml += document.querySelector('#'+id_main+' > .page__content').innerHTML;
                }
                if (more_load || mode != last_load_TL || clear_load) { //TL初回
                    initph("TL");
                    if (i !== 0) toot_old_id = json[i-1]['id'];
                    reshtml += "<button class='button button--large--quiet more_load_bt_"+now_TL+"' onclick='showTL(null,null,this)'>もっと読み込む...</button>";
                }
                last_load_TL = mode;
                document.querySelector('#'+id_main+' > .page__content').innerHTML = reshtml;
                if (reload && reload !== "dial") reload();
                return true;
            }
        });
    }
}

function showTagTL(tag, more_load) {
    var i = 0, reshtml = "", get = "";
    if (!tag) tag = tag_str;
    if (more_load) {
        get = "?max_id="+tag_old_id;
        more_load.value = "読み込み中...";
        more_load.disabled = true;
    } else {
        loadNav('showtag.html');
    }
    fetch("https://"+inst+"/api/v1/timelines/tag/"+tag+get, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            if (more_load) more_load.className = "invisible";
            return response.json();
        } else {
            sendLog("Error/tag", response);
            showtoast('cannot-load');
            return false;
        }
    }).then(function(json) {
        if (json) {
            if (more_load) {
                reshtml = document.getElementById("tag_main").innerHTML;
            } else {
                document.getElementById("showtag_title").innerHTML = '#'+ decodeURI(tag);
            }

            while (json[i]) {
                reshtml += toot_card(json[i], "full", null);
                i++;
            }

            if (i !== 0) tag_old_id = json[i-1]['id'];
            reshtml += "<button class='button button--large--quiet' onclick='showTagTL(null,this)'>もっと読み込む...</button>";
            document.getElementById("tag_main").innerHTML = reshtml;
            return true;
        }
    });
}

function showAccountTL(id, more_load, media) {
    var i = 0, ip = 0, reshtml = "", get = "", reshtml_pinned = "";
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
    if (media && !more_load) { //読み込みマーク入れる & ピンを表示しない
        document.getElementById("account_toot").innerHTML = "<div class=\"loading-now\"><ons-progress-circular indeterminate></ons-progress-circular></div>";
        document.getElementById("account_pinned_toot").innerHTML = "";
    }
    fetch("https://"+inst+"/api/v1/accounts/"+id+"/statuses"+get, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            if (more_load) more_load.className = "invisible";
            return response.json();
        } else {
            sendLog("Error/accountTL", response);
            showtoast('cannot-load');
            return false;
        }
    }).then(function(json) {
        if (json) {
            if (!media && !more_load) {
                fetch("https://"+inst+"/api/v1/accounts/"+id+"/statuses?pinned=true", {
                    headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
                    method: 'GET'
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        sendLog("Error/account_pin", response);
                        showtoast('cannot-load');
                    }
                }).then(function(json_pinned) {
                    while (json_pinned[ip]) {
                        reshtml_pinned += toot_card(json_pinned[ip], "full", "<ons-icon icon='fa-thumb-tack'></ons-icon>　固定トゥート", "light");
                        ip++;
                    }
                    if (json != json_pinned) {
                        document.getElementById("account_pinned_toot").innerHTML = reshtml_pinned;
                    }
                });
            }
            if (more_load) {
                reshtml = document.getElementById("account_toot").innerHTML;
                displayTime('update');
            }
            i = 0;
            while (json[i]) {
                reshtml += toot_card(json[i], "full", null);
                i++;
            }
            if (i !== 0) account_toot_old_id = json[i-1]['id'];
            if (media)
                reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this, true)'>もっと読み込む...</button>";
            else
                reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this)'>もっと読み込む...</button>";

            document.getElementById("account_toot").innerHTML = reshtml;
            return true;
        }
    });
}

function TL_prev() {
    var tab = document.getElementById('tl_tabs');
    var index = tab.getActiveTabIndex();
    if (index >= 1) {
        tab.setActiveTab(index - 1);
    }
}

function TL_next() {
    var tab = document.getElementById('tl_tabs');
    var index = tab.getActiveTabIndex();
    if (index !== -1 && index < 4) {
        tab.setActiveTab(index + 1);
    }
}

function TL_change(mode) {
    var tab = document.getElementById('tl_tabs');
    tab.setActiveTab(mode);
}

function scrollTL() {
    $(".page__content").scrollTop(0);
    if (getConfig(1, 'head_reset') == 1) showTL(null, null, null, true);
}

function setTLheadcolor(mode) {
    try {
        var head = document.getElementById("home_title");
        var unread = document.getElementById("home_title_unread");
        if (mode) { //blue
            head.className = "TL_reload";
            unread.innerHTML = home_auto_num;
            unread.className = "notification";
        } else {
            head.className = "";
            unread.className = "notification invisible";
        }
    } catch (e) {
        console.log(e);
    }
}