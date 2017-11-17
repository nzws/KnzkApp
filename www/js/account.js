function show_account(id, navmode) {
    if (navmode) {
        var menu = document.getElementById('splitter-menu');
        document.querySelector('#navigator').bringPageTop('account.html').then(menu.close.bind(menu));
    } else {
        loadNav('account.html');
    }
    fetch("https://"+inst+"/api/v1/accounts/"+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        account_page_id = json.id;
        account_page_acct = json.acct;

        json.note = t_text(json.note);
        if (!json.display_name) json.display_name = json.username;
        document.getElementById("userpage-name").innerHTML = json.display_name;
        document.getElementById("userpage-title").innerHTML = "@"+json.acct;
        document.getElementById("userpage-acct").innerHTML = "@"+json.acct;
        document.getElementById("userpage-bio").innerHTML = json.note;
        document.getElementById("userpage-icon").src = json.avatar;
        document.getElementById("userpage-bg").setAttribute('style', 'background-image: url(\''+json.header+'\');');
        document.getElementById("userpage-follow").innerHTML = json.following_count;
        document.getElementById("userpage-follower").innerHTML = json.followers_count;
        document.getElementById("userpage-post-count").innerHTML = json.statuses_count;
        if (json.locked === true) $("#userpage-lock").removeClass("invisible");
        showAccountTL(json.id);
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });

    fetch("https://"+inst+"/api/v1/accounts/relationships?id="+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        document.getElementById("acct_block").value = json[0]["blocking"];
        document.getElementById("acct_mute").value = json[0]["muting"];


        if (json[0]["followed_by"] === true)
            document.getElementById("userpage-follower-badge").className = "userpage-follower";
        else
            document.getElementById("userpage-follower-badge").className = "invisible";

        if (json[0]["following"] === true)
            document.getElementById("userpage-follow-button").className = "userpage-button follow-active ons-icon fa-user-times fa";
        else
            document.getElementById("userpage-follow-button").className = "userpage-button ons-icon fa-user-plus fa";

        if (json[0]["muting"] === true) {
            document.getElementById("userpage-follow-button").className = "invisible";
            document.getElementById("userpage-mute-badge").className = "userpage-follower";
        } else
            document.getElementById("userpage-mute-badge").className = "invisible";

        if (json[0]["blocking"] === true) {
            document.getElementById("userpage-follow-button").className = "invisible";
            document.getElementById("userpage-block-badge").className = "userpage-follower";
        } else
            document.getElementById("userpage-block-badge").className = "invisible";

        if (json[0]["id"] == localStorage.getItem('knzk_userid')) {
            document.getElementById("userpage-follow-button").className = "invisible";
            document.getElementById("acct_action_bt").className = "invisible";
            document.getElementById("userpage-follower-badge").className = "invisible";
        } else {
            document.getElementById("acct_action_bt").className = "userpage-button ons-icon fa-bars fa";
        }

        if (json[0]["requested"] === true) {
            document.getElementById("userpage-follow-button").className = "userpage-button follow-active ons-icon fa-hourglass fa";
            document.getElementById("userpage-followreq-badge").className = "userpage-follower";
        } else
            document.getElementById("userpage-followreq-badge").className = "invisible";

    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}

function showFollow(id, mode, more_load) {
    var url = "", i = 0, reshtml = "";
    loadNav('showfollow.html');
    if (mode === "follow") {
        url = "/following";
    } else {
        url = "/followers";
    }
    if (more_load) {
        more_load.value = "読み込み中...";
        more_load.disabled = true;
        url += "?max_id="+follow_old_id;
    } else {
        follow_old_id = 0;
    }
    fetch("https://"+inst+"/api/v1/accounts/"+id+url, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (more_load) {
            more_load.className = "button button--large--quiet invisible";
            reshtml = document.getElementById("show_follow").innerHTML;
        }

        if (json[0]) {
            if (mode === "follow") {
                document.getElementById("follow-page-title").innerHTML = "フォロー一覧";
            } else {
                document.getElementById("follow-page-title").innerHTML = "フォロワー一覧";
            }
            while (json[i]) {
                if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];

                if (localStorage.getItem('knzk_acct_list_small') == 1) {
                    reshtml += "<div onclick='show_account(" + json[i]['id'] + ")' class=\"toot toot-small\">\n" +
                        "    <img src=\"" + json[i]['avatar'] + "\" class=\"icon-img-small\" align=\"middle\">\n" +
                        "    <span class=\"toot-group toot-card-right\">\n" +
                        "      <b>" + json[i]['display_name'] + "</b> <small>@" + json[i]['acct'] + "</small>\n" +
                        "    </span>\n" +
                        "</div>";
                } else {
                    reshtml += "<div class=\"toot\" onclick='show_account(" + json[i]['id'] + ")'>\n" +
                        "                    <div class=\"row\">\n" +
                        "                        <div class=\"col-xs-2\">\n" +
                        "                            <p><img src=\"" + json[i]['avatar'] + "\" class=\"icon-img\"></p>\n" +
                        "                        </div>\n" +
                        "                        <div class=\"col-xs-9 toot-card-right\">\n" +
                        "                            <div class=\"toot-group\">\n" +
                        "                                <h3><b>" + json[i]['display_name'] + "</b></h3><small>@" + json[i]['acct'] + "</small>\n" +
                        "                            </div>\n" +
                        "                        </div>\n" +
                        "                    </div>\n" +
                        "            </div>";
                }
                i++;
            }

            if (i !== 0) follow_old_id = json[i-1]['id'];
            reshtml += "<button class='button button--large--quiet' onclick='showFollow(\"" + id + "\", \"" + mode + "\", this)'>もっと読み込む...</button>";
            document.getElementById("show_follow").innerHTML = reshtml;
        }
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}

function account_state_action(id, obj, mode) {
    var url = "";
    if (mode === "follow") {
        if (obj.className === "userpage-button follow-active ons-icon fa-user-times fa" || obj.className === "userpage-button follow-active ons-icon fa-hourglass fa") { //フォロー
            url = "/unfollow";
        } else {
            url = "/follow";
        }
    } else if (mode === "mute") {
        if (obj === "true") { //オン→オフ
            url = "/unmute";
        } else {
            url = "/mute";
        }
    } else if (mode === "block") {
        if (obj === "true") { //オン→オフ
            url = "/unblock";
        } else {
            url = "/block";
        }
    }

    fetch("https://"+inst+"/api/v1/accounts/"+id+url, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (mode === "follow") {
            if (json["following"] === true)
                document.getElementById("userpage-follow-button").className = "userpage-button follow-active ons-icon fa-user-times fa";
            else
                document.getElementById("userpage-follow-button").className = "userpage-button ons-icon fa-user-plus fa";

            if (json["requested"] === true) {
                document.getElementById("userpage-follow-button").className = "userpage-button follow-active ons-icon fa-hourglass fa";
                document.getElementById("userpage-followreq-badge").className = "userpage-follower";
            } else
                document.getElementById("userpage-followreq-badge").className = "invisible";
        } else {
            showtoast("ok_conf_2");
        }
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}

function account_action(id) {
    if (localStorage.getItem('knzk_userid') == id) {
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                {
                    label: 'キャンセル',
                    icon: 'md-close'
                }
            ]
        }).then(function (index) {
        })
    } else {
        var mute = document.getElementById("acct_mute").value;
        var block = document.getElementById("acct_block").value;
        var mute_m, block_m, domain;

        domain = account_page_acct.split("@")[1];
        if (!domain) domain = inst;
        if (mute === "true") mute_m = "ミュート解除"; else mute_m = "ミュート";
        if (block === "true") block_m = "ブロック解除"; else block_m = "ブロック";
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                '返信',
                'ブラウザで開く',
                {
                    label: mute_m,
                    modifier: 'destructive'
                },
                {
                    label: block_m,
                    modifier: 'destructive'
                },
                {
                    label: 'キャンセル',
                    icon: 'md-close'
                }
            ]
        }).then(function (index) {
            if (account_page_acct.split("@")[0])
            if (index === 0) post_pre("@" + account_page_acct);
            else if (index === 1) window.open("https://"+domain+"/@"+account_page_acct.split("@")[0], "_system");
            else if (index === 2) account_state_action(id, mute, "mute");
            else if (index === 3) account_state_action(id, block, "block");
        })
    }
}

function show_account_name(username) {
    fetch("https://"+inst+"/api/v1/search?q="+username, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-pros');
            return false;
        }
    }).then(function(json) {
        var user = json['accounts'][0];
        if (user) {
            show_account(user['id']);
        } else {
            showtoast('cannot-pros');
            return false;
        }
    });
}

function post_pre(text) {
    tmp_text_pre = text + " ";
    loadNav('post.html', 'up');
}