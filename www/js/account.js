function show_account(id) {
    loadNav('account.html');
    fetch("https://"+inst+"/api/v1/accounts/"+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
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
        document.getElementById("userpage-name").innerHTML = json.display_name;
        document.getElementById("userpage-title").innerHTML = "@"+json.acct;
        document.getElementById("userpage-acct").innerHTML = "@"+json.acct;
        document.getElementById("userpage-bio").innerHTML = json.note;
        document.getElementById("userpage-icon").src = json.avatar;
        document.getElementById("userpage-bg").setAttribute('style', 'background-image: url(\''+json.header+'\');');
        document.getElementById("userpage-follow").innerHTML = json.following_count;
        document.getElementById("userpage-follower").innerHTML = json.followers_count;
        document.getElementById("userpage-post-count").innerHTML = json.statuses_count;
        showAccountTL(json.id);
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });

    fetch("https://"+inst+"/api/v1/accounts/relationships?id="+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (json[0]["id"] == localStorage.getItem('knzk_userid')) {
            document.getElementById("userpage-follow-button").className = "userpage-button invisible";
        } else {
            if (json[0]["followed_by"] === true) document.getElementById("userpage-follower-badge").className = "userpage-follower";
            if (json[0]["following"] === true) document.getElementById("userpage-follow-button").className = "userpage-button follow-active ons-icon fa-user-times fa";
        }
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
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
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
                i++;
            }

            follow_old_id = json[i-1]['id'];
            reshtml += "<button class='button button--large--quiet' onclick='showFollow(" + id + ", \"" + mode + "\", this)'>もっと読み込む...</button>";
            document.getElementById("show_follow").innerHTML = reshtml;
        }
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}

function follow(id, obj) {
    var url = "";
    if (obj.className === "userpage-button follow-active ons-icon fa-user-times fa") { //フォロー
        url = "/unfollow";
    } else {
        url = "/follow";
    }
    fetch("https://"+inst+"/api/v1/accounts/"+id+url, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (obj.className === "userpage-button follow-active ons-icon fa-user-times fa") {
            obj.className = "userpage-button ons-icon fa-user-plus fa"; //フォロー解除する
        } else {
            obj.className = "userpage-button follow-active ons-icon fa-user-times fa";
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
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                '返信',
                'ミュート(実装中)',
                'ブロック(実装中)',
                {
                    label: 'キャンセル',
                    icon: 'md-close'
                }
            ]
        }).then(function (index) {
            if (index == 0) post_pre("@" + account_page_acct + " ");
        })
    }
}

function post_pre(text) {
    tmp_text_pre = text;
    loadNav('post.html', 'up');
}