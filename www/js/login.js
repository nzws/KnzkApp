function login_open(domain) {
  var os_name, uri = "knzkapp://login/token";
  if (platform === "ios") {
    os_name = "iOS";
  } else if (platform === "android") {
    os_name = "Android";
  } else {
    os_name = "DeskTop";
    uri = "urn:ietf:wg:oauth:2.0:oob";
  }
  Fetch("https://" + domain + "/api/v1/apps", {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      scopes: 'read write follow',
      client_name: 'KnzkApp for ' + os_name,
      redirect_uris: uri,
      website: 'https://github.com/knzkdev/knzkapp'
    })
  }).then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      sendLog("Error/CreateApp", response.json);
      throw new Error();
    }
  }).then(function (json) {
    var inst_domain_tmp = domain.toLowerCase();
    localStorage.setItem('knzkapp_tmp_domain', inst_domain_tmp);
    localStorage.setItem('knzkapp_tmp_cid', json["client_id"]);
    localStorage.setItem('knzkapp_tmp_scr', json["client_secret"]);
    var url = 'https://' + inst_domain_tmp + '/oauth/authorize?response_type=code&redirect_uri=' + uri + '&scope=read write follow&client_id=' + json["client_id"];
    if (platform === "ios") {
      openURL(url);
    } else {
      window.open(url, "_system");
    }
    if (os_name === "PC") {
      ons.notification.prompt('認証コードを入力してください<br>(空欄でキャンセル)', {title: 'ログイン'}).then(function (code) {
        if (code) {
          login_callback(code);
        }
      });
    }
  }).catch(function (error) {
    console.log(error);
    show('cannot-connect-sv-login');
    hide('now_loading');
  });
}

function login_open_c(domain) {
  if (domain) {
    ons.notification.confirm('OKを押してインスタンスの利用規約に同意したものとします。', {title: 'ログイン'}).then(function (e) {
      if (e === 1) {
        login_open(domain);
      }
    });
  }
}

function login_callback(code) {
  var uri = "knzkapp://login/token";
  if (platform === "ios") {
    SafariViewController.isAvailable(function (available) {
      if (available) {
        SafariViewController.hide(function () {
          console.log('hide SVC success');
        }, function () {
          console.log('hide SVC failed');
        });
      }
    });
  } else if (platform !== "android") {
    uri = "urn:ietf:wg:oauth:2.0:oob";
  }
  Fetch("https://" + localStorage.getItem('knzkapp_tmp_domain') + "/oauth/token", {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({
      client_id: localStorage.getItem('knzkapp_tmp_cid'),
      client_secret: localStorage.getItem('knzkapp_tmp_scr'),
      grant_type: 'authorization_code',
      redirect_uri: uri,
      code: code
    })
  }).then(function (response) {
    if (response.ok) {
      if (localStorage.getItem('knzkapp_now_mastodon_username')) account_change();
    } else {
      sendLog("Error/oauth_token", response.json);
    }
    return response.json();
  }).then(function (json) {
    setTimeout(function () {
      if (json.access_token) {
        localStorage.setItem('knzkapp_now_mastodon_token', json.access_token);
        localStorage.setItem('knzkapp_now_mastodon_domain', localStorage.getItem('knzkapp_tmp_domain'));
        inst = localStorage.getItem('knzkapp_tmp_domain');

        Fetch("https://" + inst + "/api/v1/accounts/verify_credentials", {
          headers: {'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')}
        }).then(function (response) {
          if (response.ok) {
            return response.json();
          } else {
            sendLog("Error/loginjs_verify_credentials", response.json);
            throw new Error();
          }
        }).then(function (json_acct) {
          if (localStorage.getItem("knzkapp_account_list") == undefined) localStorage.setItem('knzkapp_account_list', JSON.stringify([]));
          localStorage.setItem('knzkapp_now_mastodon_username', json_acct.acct);
          localStorage.setItem('knzkapp_now_mastodon_id', json_acct.id);
          window.location.reload();
        }).catch(function (error) {
          showtoast('cannot-connect-sv');
          console.log(error);
          hide('now_loading');
        });
      } else {
        hide('now_loading');
        ons.notification.alert(json.error, {title: 'ログイン中にエラーが発生しました。'});
      }
    }, 500);
  }).catch(function (error) {
    showtoast('cannot-connect-sv');
    console.log(error);
    hide('now_loading');
  });
}

function debug_login() {
  show('now_loading');
  var inst_domain = document.getElementById("login_debug_domain").value;
  var token = document.getElementById("login_debug_token").value;


  Fetch("https://" + inst_domain + "/api/v1/accounts/verify_credentials", {
    headers: {'Authorization': 'Bearer ' + token}
  }).then(function (response) {
    if (response.ok) {
      if (localStorage.getItem('knzkapp_now_mastodon_username')) account_change();
      return response.json();
    } else {
      //デバッガなのでいらない
      throw new Error();
    }
  }).then(function (json) {
    setTimeout(function () {
      if (localStorage.getItem("knzkapp_account_list") == undefined) localStorage.setItem('knzkapp_account_list', JSON.stringify([]));
      localStorage.setItem('knzkapp_now_mastodon_token', token);
      localStorage.setItem('knzkapp_now_mastodon_domain', inst_domain);
      localStorage.setItem('knzkapp_now_mastodon_username', json.acct);
      localStorage.setItem('knzkapp_now_mastodon_id', json.id);

      window.location.reload();
    }, 500);
  }).catch(function (error) {
    showtoast('cannot-connect-sv');
    console.log(error);
    hide('now_loading');
  });
}

function logout() {
  hide('logout_dialog');
  localStorage.removeItem('knzkapp_now_mastodon_token');
  localStorage.removeItem('knzkapp_now_mastodon_username');
  localStorage.removeItem('knzkapp_now_mastodon_id');
  localStorage.removeItem('knzkapp_now_mastodon_domain');
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
  var list = JSON.parse(localStorage.getItem("knzkapp_account_list"));

  var now = {
    "username": localStorage.getItem('knzkapp_now_mastodon_username'),
    "userid": localStorage.getItem('knzkapp_now_mastodon_id'),
    "login_token": localStorage.getItem('knzkapp_now_mastodon_token'),
    "login_domain": localStorage.getItem('knzkapp_now_mastodon_domain')
  };

  if (id) {
    var nid = parseInt(id);
    var next_account = list[nid];
    list.splice(nid, 1);
    Fetch("https://" + next_account["login_domain"] + "/api/v1/accounts/verify_credentials", {
      headers: {'Authorization': 'Bearer ' + next_account["login_token"]}
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog("Error/login_verify_credentials", response.json);
        throw new Error();
      }
    }).then(function (json) {
      localStorage.setItem('knzkapp_now_mastodon_token', next_account["login_token"]);
      localStorage.setItem('knzkapp_now_mastodon_username', next_account["username"]);
      localStorage.setItem('knzkapp_now_mastodon_id', next_account["userid"]);
      localStorage.setItem('knzkapp_now_mastodon_domain', next_account["login_domain"].toLowerCase());

      list.unshift(now);
      localStorage.setItem('knzkapp_account_list', JSON.stringify(list));

      window.location.reload();
    }).catch(function (error) {
      console.log(error);
      showtoast('cannot-connect-API');
    });
  } else {
    list.unshift(now);
    localStorage.setItem('knzkapp_account_list', JSON.stringify(list));
  }
}

function account_del(id) {
  ons.notification.confirm('アプリからこのアカウントを削除してもよろしいですか？', {title: 'アカウントの削除'}).then(function (e) {
    if (e === 1) {
      var list = JSON.parse(localStorage.getItem("knzkapp_account_list"));
      var nid = parseInt(id);
      list.splice(nid, 1);
      localStorage.setItem('knzkapp_account_list', JSON.stringify(list));
      document.getElementById('splitter-menu').close();
      showtoast("del_ok");
    }
  });
}

function account_list() {
  var list = JSON.parse(localStorage.getItem("knzkapp_account_list"));
  var reshtml = "", i = 0;
  while (list[i]) {
    reshtml += "<ons-list-item>\n" +
      "      <div class=\"center\" onclick='account_change(\"" + i + "\")'>\n" +
      "        <span class=\"list-item__title\">@" + list[i]["username"] + "@" + list[i]["login_domain"] + "</span>\n" +
      "      </div>\n" +
      "      <div class=\"right\" onclick='account_del(\"" + i + "\")'>\n" +
      "        <span class=\"list-item__title\"><i class=\"list-item__icon list-item--chevron__icon ons-icon fa-trash fa fa-fw\"></i></span>\n" +
      "      </div>\n" +
      "    </ons-list-item>";
    i++;
  }
  document.getElementById("account-list-other").innerHTML = reshtml;
}

function open_addaccount() {
  var menu = document.getElementById('splitter-menu');
  document.querySelector('#navigator').bringPageTop("login.html", {animation: "slide"}).then(menu.close.bind(menu));
}

function clearAllAccount() {
  ons.notification.confirm('本当に全てのアカウントからログアウトしますか？', {title: '全アカウントをログアウト'}).then(function (e) {
    if (e === 1) {
      ons.notification.confirm('もう一度聞きます。<br>本当に全てのアカウントからログアウトしますか？', {title: '全アカウントをログアウト'}).then(function (e) {
        if (e === 1) {
          localStorage.setItem('knzkapp_account_list', JSON.stringify([]));

          localStorage.removeItem('knzkapp_now_mastodon_token');
          localStorage.removeItem('knzkapp_now_mastodon_username');
          localStorage.removeItem('knzkapp_now_mastodon_id');
          localStorage.removeItem('knzkapp_now_mastodon_domain');
        }
      });
    }
  });
}
