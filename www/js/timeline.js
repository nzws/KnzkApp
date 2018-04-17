function reset_alert() {
  ons.notification.confirm('本当に通知を消去してもよろしいですか？', {title: '通知を消去'}).then(function (e) {
    if (e === 1) {
      Fetch("https://" + inst + "/api/v1/notifications/clear", {
        headers: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
        },
        method: 'POST'
      }).then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          sendLog("Error/noti_clear", response.json);
          throw new Error();
        }
      }).then(function (json) {
        showtoast('ok-clear-alert');
        showAlert();
        alert_old_id = 0;
        alert_new_id = 0;
      }).catch(function (error) {
        showtoast('cannot-pros');
        console.log(error);
      });
    }
  });
}

function showAlert(reload, more_load) {
  var get = "", reshtml = "", i = 0, alert_text = "", e = 0;
  if (reload) {
    get = "?since_id=" + alert_new_id;
  }
  if (more_load) {
    more_load.value = "読み込み中...";
    more_load.disabled = true;
    get = "?max_id=" + alert_old_id;
  }
  Fetch("https://" + inst + "/api/v1/notifications" + get, {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
    },
    method: 'GET'
  }).then(function (response) {
    if (response.ok) {
      if (more_load) more_load.className = "invisible";
      return response.json();
    } else {
      sendLog("Error/noti", response.json);
      showtoast('cannot-load');
      if (reload) reload();
      return false;
    }
  }).then(function (json) {
    if (json[i]) {
      resetLabel();
      displayTime('update');
      if (more_load) {
        reshtml = document.getElementById("alert_main").innerHTML;
      }
      while (json[i]) {
        alert_new_id = json[0]['id'];
        if (!json[i]['account']['display_name']) json[i]['account']['display_name'] = json[i]['account']['username'];

        if (json[i]['type'] === "follow") {
          alert_text = "<div class='alert_text'>";
          alert_text += "<ons-icon icon=\"fa-user-plus\" class='boost-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + escapeHTML(json[i]['account']['display_name']) + "</b>さんにフォローされました (<span data-time='" + json[i]['created_at'] + "' class='date'>" + displayTime('new', json[i]['created_at']) + "</span>)";
          alert_text += "</div>";
          reshtml += "<div class=\"toot\">\n" +
            alert_text +
            "                    <div class='toot_flex'>\n" +
            "                        <div width='50px'>\n" +
            "                            <p><img src=\"" + json[i]['account']['avatar'] + "\" class=\"icon-img\" onclick='show_account(" + json[i]['account']['id'] + ")'/></p>\n" +
            "                        </div>\n" +
            "                        <div class=\"toot-card-right\">\n" +
            "                            <div class=\"toot-group\">\n" +
            "                                <span onclick='show_account(" + json[i]['account']['id'] + ")'><b>" + escapeHTML(json[i]['account']['display_name']) + "</b> <small>@" + json[i]['account']['acct'] + "</small></span>\n" +
            "                            </div>\n" +
            "                        </div>\n" +
            "                    </div>\n" +
            "            </div>";
        } else {
          if (json[i]["type"] === "favourite") {
            alert_text = "<ons-icon icon=\"fa-star\" class='fav-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + escapeHTML(json[i]['account']['display_name']) + "</b>さんがお気に入りしました (<span data-time='" + json[i]['created_at'] + "' class='date'>" + displayTime('new', json[i]['created_at']) + "</span>)";
          }
          if (json[i]["type"] === "reblog") {
            alert_text = "<ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + json[i]['account']['id'] + ")'>" + escapeHTML(json[i]['account']['display_name']) + "</b>さんがブーストしました (<span data-time='" + json[i]['created_at'] + "' class='date'>" + displayTime('new', json[i]['created_at']) + "</span>)";
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
        if (i !== 0) alert_old_id = json[i - 1]['id'];
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
    closeAllws();
    load("home.html");
    setTimeout(function () {
      TL_change(timeline_default_tab);
      now_TL = timeline_config[timeline_default_tab];
      timeline_now_tab = timeline_default_tab;
      document.getElementById('home_title').innerHTML = TLname(timeline_config[timeline_now_tab]);
      showTL(null, null, null, true);

      var dial = getConfig(1, 'dial'), icon;
      if (dial && dial != "change") {
        $("#dial_main").removeClass("invisible");
        if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell";
        if (dial === "reload") icon = "fa-refresh";
        document.getElementById("dial-icon").className = "ons-icon fa " + icon;
      } else if (dial) {
        $("#dial_TL").removeClass("invisible");
        setsd();
      }
      if (getConfig(1, 'swipe_menu') == 1) document.getElementById("tl_tabs").setAttribute("swipeable", "1");
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
  var tlmode = "", i = 0, reshtml = "", ws_mode, n;
  if (!mode) mode = now_TL;
  if (clear_load) {
    closeAllws();
    tl_postdata = {};
    timeline_store_data = {};
    timeline_store_data[inst] = {};
    timeline_store_data[inst][timeline_now_tab] = "";
    home_auto_num = 0;
    toot_new_id = 0;
    toot_old_id = 0;
    more_load = false;
    setTLheadcolor(0);
    try {
      if (last_load_TL) document.querySelector('#TL' + last_load_TL + '_main > .page__content').innerHTML = "";
    } catch (e) {
      console.error(e);
    }
  }
  if (mode === "home") {
    if (more_load)
      tlmode = "home?max_id=" + toot_old_id;
    else
      tlmode = "home?since_id=" + toot_new_id;
    n = true;
  } else if (mode === "public") {
    if (more_load)
      tlmode = "public?max_id=" + toot_old_id;
    else
      tlmode = "public?since_id=" + toot_new_id;
    n = true;
  } else if (mode === "local") {
    if (more_load)
      tlmode = "public?local=true&max_id=" + toot_old_id;
    else
      tlmode = "public?local=true&since_id=" + toot_new_id;
    n = true;
  } else if (mode === "local_media") {
    if (more_load)
      tlmode = "public?local=true&max_id=" + toot_old_id;
    else
      tlmode = "public?limit=40&local=true&since_id=" + toot_new_id;
    n = true;
  } else if (mode === "public_media") {
    if (more_load)
      tlmode = "public?max_id=" + toot_old_id;
    else
      tlmode = "public?limit=40&since_id=" + toot_new_id;
    n = true;
  }
  if (more_load) more_load.className = "invisible";
  if (n) {
    Fetch("https://" + inst + "/api/v1/timelines/" + tlmode, {
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
      },
      method: 'GET'
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog("Error/timeline", response.json);
        showtoast('cannot-load');
        if (reload && reload !== "dial") reload();
        return false;
      }
    }).then(function (json) {
      if (json) {
        if (!more_load && mode == last_load_TL && !clear_load) {
          displayTime('update');
        }
        if (more_load && !getConfig(1, 'chatmode')) {
          reshtml = document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML;
        } else {
          if (getConfig(1, 'realtime') == 1) {
            if (mode === "public" || mode === "public_media")
              ws_mode = "public";
            else if (mode === "local" || mode === "local_media")
              ws_mode = "public:local";
            else
              ws_mode = "user";

            if (!reload && !more_load) {
              var instance_ws = inst, now_tab = timeline_now_tab;
              var ws_url = "wss://" + inst + "/api/v1/streaming/?access_token=" + localStorage.getItem('knzkapp_now_mastodon_token') + "&stream=" + ws_mode;
              if (TL_websocket[now_tab]) {
                try {TL_websocket[now_tab].close();} catch (e) {}
                TL_websocket[now_tab] = null;
              }
              TL_websocket[now_tab] = new WebSocket(ws_url);
              TL_websocket[now_tab].onopen = function () {
                TL_websocket[now_tab].onmessage = function (message) {
                  displayTime('update');
                  var ws_now_url = undefined;
                  try {ws_now_url = TL_websocket[now_tab].url} catch (e) {}
                  if (instance_ws !== inst || timeline_now_tab !== now_tab || ws_now_url !== ws_url) {
                    console.warn("エラー:Websocketが切断されていません");
                    try {TL_websocket[now_tab].close();} catch (e) {}
                    TL_websocket[now_tab] = null;
                  } else {
                    var ws_resdata = JSON.parse(message.data);
                    var ws_reshtml = JSON.parse(ws_resdata.payload);

                    if (ws_resdata.event === "update") {
                      if (ws_reshtml['id']) {
                        if (toot_new_id !== ws_reshtml['id']) {
                          var TLmode = mode === "local_media" || mode === "public_media" ? "media" : "";

                          updateTLtrack();
                          if (home_auto_mode) { //OK
                            home_auto_event = false;
                            if (getConfig(1, 'chatmode'))
                              document.querySelector('#TL' + now_tab + '_main > .page__content').innerHTML = document.querySelector('#TL' + now_tab + '_main > .page__content').innerHTML + timeline_store_data[instance_ws][now_tab] + toot_card(ws_reshtml, "full", null, TLmode);
                            else
                              document.querySelector('#TL' + now_tab + '_main > .page__content').innerHTML = toot_card(ws_reshtml, "full", null, TLmode) + timeline_store_data[instance_ws][now_tab] + document.querySelector('#TL' + now_tab + '_main > .page__content').innerHTML;

                            timeline_store_data[instance_ws][now_tab] = "";
                            home_auto_num = 0;
                            setTLheadcolor(0);
                            if (getConfig(1, 'chatmode')) $(".page__content").scrollTop(99999999999999999999999);
                          } else {
                            if (getConfig(1, 'chatmode'))
                              timeline_store_data[instance_ws][now_tab] += toot_card(ws_reshtml, "full", null, TLmode);
                            else
                              timeline_store_data[instance_ws][now_tab] = toot_card(ws_reshtml, "full", null, TLmode) + timeline_store_data[instance_ws][now_tab];

                            if (!home_auto_event) {
                              home_auto_event = true;
                              home_autoevent();
                            }
                          }

                          if (!home_auto_mode && ((ws_reshtml['media_attachments'][0] && TLmode === "media") || TLmode !== "media")) {
                            home_auto_num++;
                            setTLheadcolor(1);
                          }
                        }
                        toot_new_id = ws_reshtml['id'];
                      }
                    } else if (ws_resdata.event === "delete") {
                      var del_toot = document.getElementById("post_" + ws_resdata.payload);
                      if (del_toot) del_toot.parentNode.removeChild(del_toot);
                    }
                  }
                };

                TL_websocket[now_tab].onclose = function() {
                  console.log("ok:websocket:del");
                }
              };

              TL_websocket[now_tab].onerror = function () {
                console.warn("err");
              }
            }
          }
        }

        if (getConfig(1, 'chatmode')) {
          if (more_load || mode != last_load_TL || clear_load) { //TL初回
            reshtml += "<button class='button button--large--quiet more_load_bt_" + timeline_now_tab + "' onclick='showTL(null,null,this)'>もっと読み込む...</button>";
          }
          json = json.reverse();
        }

        while (json[i]) {
          var TLmode = mode === "local_media" || mode === "public_media" ? "media" : "";
          reshtml += toot_card(json[i], "full", null, TLmode);

          toot_new_id = getConfig(1, 'chatmode') ? json[i]['id'] : json[0]['id'];
          if (getConfig(1, 'chatmode')) toot_old_id = json[0]['id'];
          i++;
        }

        if (more_load && mode == last_load_TL && !clear_load && getConfig(1, 'chatmode')) {
          reshtml += document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML;
        }

        if (!getConfig(1, 'chatmode')) {
          if (!more_load && mode == last_load_TL && !clear_load) { //追加読み込みでない&前回と同じTL
            reshtml += document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML;
          }
          if (more_load || mode != last_load_TL || clear_load) { //TL初回
            if (i !== 0) toot_old_id = json[i - 1]['id'];
            reshtml += "<button class='button button--large--quiet more_load_bt_" + timeline_now_tab + "' onclick='showTL(null,null,this)'>もっと読み込む...</button>";
          }
        }
        last_load_TL = timeline_now_tab;
        document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML = reshtml;
        if (reload && reload !== "dial") reload();
        if (getConfig(1, 'chatmode') && !more_load) $(".page__content").scrollTop(99999999999999999999999);
        return true;
      }
    });
  }
}

function showTagTL(tag, more_load) {
  var i = 0, reshtml = "", get = "";
  if (!tag)
    tag = tag_str;
  else
    tag_str = tag;
  if (more_load) {
    get = "?max_id=" + tag_old_id;
    more_load.value = "読み込み中...";
    more_load.disabled = true;
  } else {
    loadNav('showtag.html');
  }
  Fetch("https://" + inst + "/api/v1/timelines/tag/" + tag + get, {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
    },
    method: 'GET'
  }).then(function (response) {
    if (response.ok) {
      if (more_load) more_load.className = "invisible";
      return response.json();
    } else {
      sendLog("Error/tag", response.json);
      showtoast('cannot-load');
      return false;
    }
  }).then(function (json) {
    if (json) {
      if (more_load) {
        reshtml = document.getElementById("tag_main").innerHTML;
      } else {
        document.getElementById("showtag_title").innerHTML = '#' + decodeURI(tag);
      }

      while (json[i]) {
        reshtml += toot_card(json[i], "full", null);
        i++;
      }

      if (i !== 0) tag_old_id = json[i - 1]['id'];
      reshtml += "<button class='button button--large--quiet' onclick='showTagTL(null,this)'>もっと読み込む...</button>";
      document.getElementById("tag_main").innerHTML = reshtml;
      return true;
    }
  });
}

function showAccountTL(id, more_load, mode = "", reload) {
  var i = 0, reshtml = "", get = "";
  acct_mode = mode;
  if (more_load) {
    more_load.value = "読み込み中...";
    more_load.disabled = true;
    get = "?max_id=" + account_toot_old_id + "&";
  } else {
    account_toot_old_id = 0;
    get = "?";
  }

  if (mode === "media") get += "only_media=true";
  else if (mode === "with_re") get += "exclude_replies=false";
  else if (mode === "pinned") get += "pinned=true";
  else get += "exclude_replies=true";

  if (!more_load) { //読み込みマーク入れる
    i = 0;
    document.getElementById("account_toot").innerHTML = "<div class=\"loading-now\"><ons-progress-circular indeterminate></ons-progress-circular></div>";
  }

  Fetch("https://" + inst + "/api/v1/accounts/" + id + "/statuses" + get, {
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')
    },
    method: 'GET'
  }).then(function (response) {
    if (response.ok) {
      if (more_load) more_load.className = "invisible";
      return response.json();
    } else {
      sendLog("Error/accountTL", response.json);
      showtoast('cannot-load');
      return false;
    }
  }).then(function (json) {
    if (json) {
      if (more_load) {
        reshtml = document.getElementById("account_toot").innerHTML;
        displayTime('update');
      } else {
        var conf = $("[id^='acctTL_mode']");
        while (conf[i]) {
          $(conf[i]).removeClass("acctTL_now");
          i++;
        }
        $("#acctTL_mode_"+mode).addClass("acctTL_now");
      }
      i = 0;
      while (json[i]) {
        reshtml += toot_card(json[i], "full", null);
        i++;
      }
      if (i !== 0) account_toot_old_id = json[i - 1]['id'];
      if (mode)
        reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this, \"" + mode + "\")'>もっと読み込む...</button>";
      else
        reshtml += "<button class='button button--large--quiet' onclick='showAccountTL(account_page_id, this)'>もっと読み込む...</button>";

      document.getElementById("account_toot").innerHTML = reshtml;
      if (reload) reload();
      else if (!more_load) initph("acct");
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

function updateTLtrack() {
  var h = 0;
  if (getConfig(1, 'chatmode')) {
    h = $(".toot").filter(":last").offset().top - window.innerHeight;
    home_auto_mode = h < -10;
  } else {
    h = document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').scrollTop;
    home_auto_mode = h <= 100;
  }
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

function TLname(mode) {
  var locale = {
    "home": "ホーム",
    "local": "ローカル",
    "public": "連合",
    "local_media": "ローカルメディア",
    "public_media": "連合メディア",
    "plus_local": "+ローカル"
  };
  return locale[mode];
}

function initph(mode) {
  var id = "";
  if (mode === "TL") id = 'TL' + timeline_now_tab + '_';
  else if (mode === "alert") id = 'ph-alert';
  else if (mode === "acct") id = 'ph-acct';

  try {
    var ph_alert = document.getElementById(id);
    ph_alert.addEventListener('changestate', function (event) {
      var message = '';

      switch (event.state) {
        case 'initial':
          message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
          break;
        case 'preaction':
          message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
          break;
        case 'action':
          message = '<span class="fa fa-spin"><span class="fa fa-spin"><ons-icon icon="fa-refresh" class="white"></ons-icon></span></span>';
          break;
      }

      ph_alert.innerHTML = message;
    });
  } catch (e) {
    console.log("ERROR_Pull_hook1");
  }
  if (mode === "TL") {
    try {
      ph_alert.onAction = function (done) {
        console.log("reload");
        showAlert(done);
      };
    } catch (e) {
      console.log("ERROR_Pull_hook2");
    }
  } else if (mode === "acct") {
    try {
      ph_alert.onAction = function (done) {
        console.log("reload");
        showAccountTL(account_page_id, null, acct_mode, done);
      };
    } catch (e) {
      console.log("ERROR_Pull_hook3");
    }
  } else {
    try {
      ph_alert.onAction = function (done) {
        console.log("reload");
        showAlert(done);
      };
    } catch (e) {
      console.log("ERROR_Pull_hook3");
    }
  }
}

function initTLConf() {
  var i = 0, reshtml = "", dw = "", up = "", ch = "";

  while (timeline_config[i]) {
    dw = "<ons-button modifier=\"quiet\" class=\"button button--quiet\" onclick='editTLConf(" + i + ",1)'><ons-icon icon=\"fa-angle-down\" class=\"ons-icon fa-angle-down fa\"></ons-icon></ons-button>\n";
    up = "<ons-button modifier=\"quiet\" class=\"button button--quiet\" onclick='editTLConf(" + i + ",0)'><ons-icon icon=\"fa-angle-up\" class=\"ons-icon fa-angle-up fa\"></ons-icon></ons-button>\n";
    ch = "";

    if (i === timeline_config.length - 1) {
      dw = "<ons-button class=\"button button--quiet\" disabled><ons-icon icon=\"fa-angle-down\" class=\"ons-icon fa-angle-down fa\"></ons-icon></ons-button>\n";
    } else if (i === 0) {
      up = "<ons-button class=\"button button--quiet\" disabled><ons-icon icon=\"fa-angle-up\" class=\"ons-icon fa-angle-up fa\"></ons-icon></ons-button>\n";
    }
    if (timeline_default_tab === i) {
      ch = "checked";
    }

    reshtml += "<ons-list-item class=\"list-item\">\n" +
      "<label class=\"left list-item__left\" onclick='editTLConfD(" + i + ")'><ons-radio name=\"tl_default\" input-id=\"tl_default-" + i + "\" " + ch + " class=\"radio-button\">\n" +
      "<input type=\"radio\" class=\"radio-button__input\" id=\"tl_default-" + i + "\" name=\"tl_default\">\n" +
      "<span class=\"radio-button__checkmark\"></span>\n" +
      "</ons-radio></label>\n" +
      "<label for=\"tl_default-" + i + "\" class=\"center list-item__center\">" + TLname(timeline_config[i]) + "</label>\n" +
      "<label class=\"right list-item__right\">\n" +
      up + dw +
      "</label></ons-list-item>";
    i++;
  }
  document.getElementById("tlconf-list").innerHTML = reshtml;
}

function editTLConf(i, mode) {
  if (mode === 1) { //上げる
    timeline_config.splice(i, 2, timeline_config[i + 1], timeline_config[i]);
  } else { //下げる
    timeline_config.splice(i - 1, 2, timeline_config[i], timeline_config[i - 1]);
  }
  localStorage.setItem('knzkapp_conf_mastodon_timeline', JSON.stringify({
    "config": timeline_config,
    "default": timeline_default_tab
  }));
  initTLConf();
}

function editTLConfD(i) {
  console.log("OK");
  timeline_default_tab = i;
  localStorage.setItem('knzkapp_conf_mastodon_timeline', JSON.stringify({
    "config": timeline_config,
    "default": timeline_default_tab
  }));
}

function setsd() {
  var i = 0, icons = {
    "home": "ons-icon fa fa-home",
    "local": "ons-icon fa fa-users",
    "public": "ons-icon fa fa-globe",
    "local_media": "ons-icon fa fa-picture-o",
    "public_media": "ons-icon zmdi zmdi-collection-image-o",
    "plus_local": "+ローカル"
  };
  while (i <= 4) {
    document.getElementById("sd_icon" + i).className = icons[timeline_config[i]];
    i++;
  }
}

function closeAllws() {
  try {
    for (var i = 0; i <= 4; i++) {
      if (TL_websocket[i]) {
        TL_websocket[i].close();
        TL_websocket[i] = null;
      }
    }
    TL_websocket = {};
  } catch (e) {
    console.warn("TL切断失敗:", e);
  }
}
