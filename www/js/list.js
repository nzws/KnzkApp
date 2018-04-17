function list(mode, title, more_load, mode_toot, navmode) {
  if (navmode === true) {
    $.when(
      document.querySelector('#navigator').bringPageTop("olist_nav.html", {animation: "slide"})
    ).done(function () {
      list_n(mode, title, more_load, mode_toot, true)
    });
  } else {
    var menu = document.getElementById('splitter-menu');
    $.when(
      document.querySelector('#navigator').resetToPage("olist.html", {animation: "none"}).then(menu.close.bind(menu))
    ).done(function () {
      list_n(mode, title, more_load, mode_toot)
    });
  }
}

function list_n(mode, title, more_load, mode_toot, navmode) {
  var i = 0, reshtml = "", get = "", pin;
  var id_title, id_main;
  if (more_load) {
    get = "?" + list_old_id[0];
    more_load.value = "読み込み中...";
    more_load.disabled = true;
  }
  if (mode === "pin") {
    pin = true;
    mode = "/accounts/" + localStorage.getItem('knzkapp_now_mastodon_id') + "/statuses?pinned=true";
  }
  if (navmode === true) {
    id_title = "olist_nav_title";
    id_main = "olist_nav_main";
  } else {
    id_title = "olist_title";
    id_main = "olist_main";
  }
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 304) {
        var json = JSON.parse(xhr.responseText);
        if (more_load) {
          more_load.className = "button button--large--quiet invisible";
          reshtml = document.getElementById(id_main).innerHTML;
        } else {
          document.getElementById(id_title).innerHTML = title;
        }

        while (json[i]) {
          if (mode_toot === "toot") {
            reshtml += toot_card(json[i], "full", null);
          } else if (mode_toot === "acct") {
            if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];

            reshtml += AccountCard(json[i]);

            if (mode === "follow_requests") {
              reshtml += "<div class=\"toot y-center\" style='padding-left: 0'>\n" +
                "<ons-button style=\"width: 45%\" class='y-center' onclick='followreq(" + json[i]['id'] + ", \"authorize\")'><ons-icon icon='fa-check'></ons-icon></ons-button>\n" +
                "<ons-button style=\"width: 45%\" class='y-center' onclick='followreq(" + json[i]['id'] + ", \"reject\")'><ons-icon icon='fa-times'></ons-icon></ons-button>\n" +
                "</div>";
            }
          } else if (mode_toot === "domain") {
            reshtml += "<div class=\"toot acct-small\"><div class=\"hashtag-card\"><span class=\"toot-group\"><b>" +
              json[i] + "</b></span></div></div>\n";
          }
          i++;
        }
        if (i !== 0 && xhr.getResponseHeader("link").indexOf("max_id") !== -1)
          list_old_id = xhr.getResponseHeader("link").match(/max_id=\d+/);
        else
          list_old_id = "";

        if (pin === true) mode = "pin";
        if (list_old_id !== "")
          reshtml += "<button class='button button--large--quiet' onclick='list_n(\"" + mode + "\", \"" + title + "\", this, \"" + mode_toot + "\", " + navmode + ")'>もっと読み込む...</button>";
        document.getElementById(id_main).innerHTML = reshtml;
        return true;
      } else {
        showtoast('cannot-load');
        return false;
      }
    }
  };
  xhr.open('GET', "https://" + inst + "/api/v1/" + mode + get, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token'));
  xhr.send();
}

function followreq(id, mode) {
  Fetch("https://" + inst + "/api/v1/follow_requests/" + id + "/" + mode, {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
    },
    method: 'POST'
  }).then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      sendLog("Error/followreq", response.json);
      throw new Error();
    }
  }).then(function (json) {
    showtoast("ok_conf_2");
    list_n('follow_requests', 'フォローリクエスト', null, 'acct', true);
  }).catch(function (error) {
    showtoast('cannot-pros');
    console.log(error);
    list_n('follow_requests', 'フォローリクエスト', null, 'acct', true);
  });
}

function LoadrepStatus() {
  var i = 0, reshtml = "", repstatus = [];
  loadNav('olist_nav.html');
  Fetch("https://" + inst + "/api/v1/reports", {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
    },
    method: 'GET'
  }).then(function (response) {
    if (response.ok) {
      return response.json();
    } else {
      sendLog("Error/LoadrepStatus", response.json);
      throw new Error();
    }
  }).then(function (json) {
    json = json.reverse();
    reshtml += "<div class=\"toot\">\n" +
      "      あなたの通報が現在処理されているのか簡易的に確認することができます。\n" +
      "    </div>\n";
    while (json[i]) {
      if (json[i]["action_taken"]) {
        repstatus[0] = "管理者が確認済み";
        repstatus[1] = "check";
      } else {
        repstatus[0] = "処理中";
        repstatus[1] = "question";
      }

      reshtml += "<div class=\"toot acct-small\">\n" +
        "    <div class=\"hashtag-card\">\n" +
        "    <span class=\"toot-group\">\n" +
        "      <b><ons-icon icon='fa-" + repstatus[1] + "'></ons-icon> #" + json[i]['id'] + ": " + repstatus[0] + "</b>\n" +
        "    </span>\n" +
        "    </div>\n" +
        "</div>";
      repstatus = [];
      i++;
    }
    document.getElementById("olist_nav_title").innerHTML = "通報ステータス";
    document.getElementById("olist_nav_main").innerHTML = reshtml;
  }).catch(function (error) {
    showtoast('cannot-pros');
    console.log(error);
  });
}
