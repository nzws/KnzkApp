function login_open(domain) {
    var os_name;
    if (ons.platform.isIOS()) {
        os_name = "for iOS";
    } else if (ons.platform.isAndroid()) {
        os_name = "for Android";
    } else {
        os_name = "(Test)";
    }
    fetch("https://"+domain+"/api/v1/apps", {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            scopes: 'read write follow',
            client_name: 'KnzkApp '+os_name,
            redirect_uris: 'knzkapp://login/token',
            website: 'https://knzkdev.net/knzkapp/'
        })
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        inst_domain = domain;
        inst_login_cid = json["client_id"];
        inst_login_scr = json["client_secret"];
        var url = 'https://'+domain+'/oauth/authorize?response_type=code&redirect_uri=knzkapp://login/token&scope=read+write+follow&client_id='+inst_login_cid;
        if (ons.platform.isIOS()) {
            openURL(url);
        } else {
            window.open(url, "_system");
        }
    }).catch(function(error) {
        console.log(error);
        show('cannot-connect-sv-login');
        hide('now_loading');
    });
}

function login_open_c(domain) {
    if (domain) {
        ons.notification.confirm('外部インスタンスログインは、一部機能が使用できません。(ノンサポートとなります）<br><br>OKを押して各インスタンスの利用規約に同意したものとします。', {title: '注意！'}).then(function (e) {
            if (e === 1) {
                login_open(domain);
            }
        });
    }
}

function login_callback(code) {
    if (ons.platform.isIOS()) {
        SafariViewController.isAvailable(function (available) {
            if (available) {
                SafariViewController.hide(function () {
                    console.log('hide SVC success');
                }, function () {
                    console.log('hide SVC failed');
                });
            }
        });
    }
    fetch("https://"+inst_domain+"/oauth/token", {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({
            scope: 'read write follow',
            client_id: inst_login_cid,
            client_secret: inst_login_scr,
            grant_type: 'authorization_code',
            redirect_uri: 'knzkapp://login/token',
            code: code
        })
    }).then(function(response) {
        if(response.ok) {
            if (localStorage.getItem('knzk_username')) account_change();
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        localStorage.setItem('knzk_account_token',json.access_token);
        localStorage.setItem('knzk_login_domain',inst_domain);
        inst = inst_domain;

        fetch("https://"+inst_domain+"/api/v1/accounts/verify_credentials", {
            headers: {'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')}
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error();
            }
        }).then(function(json_acct) {
            if (localStorage.getItem("knzk_account_list") == undefined) localStorage.setItem('knzk_account_list', JSON.stringify([]));
            localStorage.setItem('knzk_username',json_acct.acct);
            localStorage.setItem('knzk_userid',json_acct.id);
            hide('now_loading');
            init();
            showtoast('loggedin_dialog');
        }).catch(function(error) {
            show('cannot-connect-sv');
            Seterrorlog('error-log-sv', error);
            console.log(error);
            hide('now_loading');
        });
    }).catch(function(error) {
        show('cannot-connect-sv');
        Seterrorlog('error-log-sv', error);
        console.log(error);
        hide('now_loading');
    });
}
function debug_login() {
    show('now_loading');
    var inst_domain = document.getElementById("login_debug_domain").value;
    var token = document.getElementById("login_debug_token").value;


    fetch("https://"+inst_domain+"/api/v1/accounts/verify_credentials", {
        headers: {'Authorization': 'Bearer '+token}
    }).then(function(response) {
        if(response.ok) {
            if (localStorage.getItem('knzk_username')) account_change();
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (localStorage.getItem("knzk_account_list") == undefined) localStorage.setItem('knzk_account_list', JSON.stringify([]));
        localStorage.setItem('knzk_account_token', token);
        localStorage.setItem('knzk_login_domain', inst_domain);
        localStorage.setItem('knzk_username', json.acct);
        localStorage.setItem('knzk_userid', json.id);

        hide('now_loading');
        init();
        showtoast('loggedin_dialog');
    }).catch(function(error) {
        show('cannot-connect-sv');
        Seterrorlog('error-log-sv', error);
        console.log(error);
        hide('now_loading');
    });
}

function logout() {
    hide('logout_dialog');
    localStorage.removeItem('knzk_account_token');
    localStorage.removeItem('knzk_username');
    localStorage.removeItem('knzk_userid');
    localStorage.removeItem('knzk_login_domain');
    //localStorage.clear(); //設定は消さない
    init();
    showtoast('loggedout_dialog');
}

function account_change_list() {
    var music = document.getElementById("music-form");
    var menu = document.getElementById("menu-list");
    var account_list = document.getElementById("account-list");
    if (account_list.style.display === "none") {
        account_list.style.display = "block";
        menu.style.display = "none";
        music.style.display = "none";
    } else {
        account_list.style.display = "none";
        music.style.display = "none";
        menu.style.display = "block";
    }
}

function account_change(id) {
    var list = JSON.parse(localStorage.getItem("knzk_account_list"));

    var now = {
        "username": localStorage.getItem('knzk_username'),
        "userid": localStorage.getItem('knzk_userid'),
        "login_token": localStorage.getItem('knzk_account_token'),
        "login_domain": localStorage.getItem('knzk_login_domain')
    };
    localStorage.removeItem('knzk_account_token');
    localStorage.removeItem('knzk_username');
    localStorage.removeItem('knzk_userid');
    localStorage.removeItem('knzk_login_domain');

    if (id) {
        var nid = parseInt(id);
        var next_account = list[nid];
        list.splice(nid, 1);
        localStorage.setItem('knzk_account_token', next_account["login_token"]);
        localStorage.setItem('knzk_username', next_account["username"]);
        localStorage.setItem('knzk_userid', next_account["userid"]);
        localStorage.setItem('knzk_login_domain', next_account["login_domain"]);
    }

    list.unshift(now);
    localStorage.setItem('knzk_account_list', JSON.stringify(list));

    if (id) {
        init();
        document.getElementById('splitter-menu').close();
    }
}

function account_del(id) {
    ons.notification.confirm('アプリからこのアカウントを削除してもよろしいですか？', {title: 'アカウントの削除'}).then(function (e) {
        if (e === 1) {
            var list = JSON.parse(localStorage.getItem("knzk_account_list"));
            var nid = parseInt(id);
            list.splice(nid, 1);
            localStorage.setItem('knzk_account_list', JSON.stringify(list));
            document.getElementById('splitter-menu').close();
            showtoast("del_ok");
        }
    });
}

function account_list() {
    var list = JSON.parse(localStorage.getItem("knzk_account_list"));
    var reshtml = "", i = 0;
    while (list[i]) {
        reshtml += "<ons-list-item>\n" +
            "      <div class=\"center\" onclick='account_change(\""+i+"\")'>\n" +
            "        <span class=\"list-item__title\">@"+list[i]["username"]+"@"+list[i]["login_domain"]+"</span>\n" +
            "      </div>\n" +
            "      <div class=\"right\" onclick='account_del(\""+i+"\")'>\n" +
            "        <span class=\"list-item__title\"><i class=\"list-item__icon list-item--chevron__icon ons-icon fa-trash fa fa-fw\"></i></span>\n" +
            "      </div>\n" +
            "    </ons-list-item>";
        i++;
    }
    document.getElementById("account-list-other").innerHTML = reshtml;
}

function open_addaccount() {
    var menu = document.getElementById('splitter-menu');
    $.when(
        document.querySelector('#navigator').bringPageTop("login.html", {animation: "slide"}).then(menu.close.bind(menu))
    ).done(function () {
        if (!ons.isWebView()) $("#login_debug").removeClass("invisible");
    });
}
