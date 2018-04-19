function startWatching() {
  try {
    if (Notification_ws) {
      try {Notification_ws.close()} catch (e) {}
      Notification_ws = null;
    }
    if (!getConfig(1, 'no_unread_label')) {
      Notification_ws = new WebSocket("wss://" + inst + "/api/v1/streaming/?access_token=" + localStorage.getItem('knzkapp_now_mastodon_token') + "&stream=user");
      Notification_ws.onopen = function () {
        Notification_ws.onmessage = function (message) {
          var ws_resdata = JSON.parse(message.data);

          if (ws_resdata.event === "notification") {
            Notification_num++;
            var noti = $(".noti_unread");
            noti.removeClass("invisible");
            noti.html(Notification_num);
          }
        };
      };
    }
  } catch (e) {}
}

function resetLabel() {
  var noti = $(".noti_unread");
  noti.addClass("invisible");
  Notification_num = 0
}

function changeNotification(force) {
  var config = LoadNotificationConfig();
  if (FCM_token) {
    var conf = $("[id^='noti-mute-']"), i = 0;
    if (conf[0]) {
      while (conf[i]) {
        config["option"]["notification"]["all"][conf[i].id.replace("noti-mute-", "")] = conf[i].checked;
        i++;
      }
      SetNotificationConfig("option",config["option"]);
    }
    if (!config["is_running"] && force) {
      if (conf[0]) showtoast("ok_conf");
      return;
    }
    var is_unregister = "";
    if (config["is_running"] && !force) {
      is_unregister = "un";
    }
    config["option"]["notification"]["user"] = getConfig(5, "notification");
    var formdata = {
      'server_key': push_default_serverKey,
      'instance_url': inst,
      'access_token': localStorage.getItem('knzkapp_now_mastodon_token'),
      'device_token': FCM_token,
      'option': JSON.stringify(config["option"]),
      'language': "ja",
      'username': localStorage.getItem('knzkapp_now_mastodon_username'),
      'app_name': version
    };
    var body = "";
    for (var key in formdata) {
      body += key + "=" + encodeURIComponent(formdata[key]) + "&"
    }
    body += "d="+(new Date()).getTime();
    Fetch("https://" + config["server"] + "/"+is_unregister+"register", {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Accept': 'application/json'
      },
      method: 'POST',
      body: body
    }).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog("Error/registerNotification", response.json);
        throw new Error();
      }
    }).then(function (json) {
      SetNotificationConfig("is_running", is_unregister ? 0 : 1);
      if (conf[0]) showtoast("ok_conf");
    }).catch(function (error) {
      document.getElementById("noti-mode").checked = !!is_unregister;
      showtoast('cannot-pros');
      console.log(error);
    });
  } else {
    ons.notification.alert('FCMトークンの受信に失敗しました。<br>開発者にご連絡ください。', {title: 'エラー'});
    document.getElementById("noti-mode").checked = !!is_unregister;
  }
}

function addKeyWord() {
  ons.notification.prompt('検知させるワードを入力してください<br>(空欄でキャンセル)', {title: 'キーワード検知'}).then(function (repcom) {
    if (repcom) {
      var config = LoadNotificationConfig()["option"];
      config["keyword"].unshift(repcom);
      SetNotificationConfig("option",config);
      renderKeyWordList();
    }
  });
}

function renderKeyWordList() {
  var config = LoadNotificationConfig();
  var reshtml = "", i = 0;
  while (config["option"]["keyword"][i]) {
    reshtml += "<ons-list-item>" +
      "<div class=\"center\"><span class=\"list-item__title\">" + config["option"]["keyword"][i] + "</span></div>" +
      " <div class=\"right\" onclick='KeyWord_del(\"" + i + "\")'><span class=\"list-item__title\"><i class=\"list-item__icon list-item--chevron__icon ons-icon fa-trash fa fa-fw\"></i></span></div>\n" +
      "</ons-list-item>\n";
    i++;
  }
  document.getElementById("keyword_list").innerHTML = reshtml;
}

function KeyWord_del(id) {
  var config = LoadNotificationConfig()["option"],
    nid = parseInt(id);
  config["keyword"].splice(nid, 1);
  SetNotificationConfig("option",config);
  showtoast("del_ok");
  renderKeyWordList();
}

function LoadNotificationConfig() {
  var name = localStorage.getItem('knzkapp_now_mastodon_username')+"@"+inst;
  return getConfig(4, name);
}

function SetNotificationConfig(n, data) {
  var name = localStorage.getItem('knzkapp_now_mastodon_username')+"@"+inst;
  var config = getConfig(4, name);
  config[n] = data;
  setConfig(4, name, config);
}

function setNotificationServer() {
  var name = localStorage.getItem('knzkapp_now_mastodon_username')+"@"+inst;
  var config = LoadNotificationConfig();
  if (!config) config = {"option": {"notification": {"all": {}, "user": {}}, "keyword": []}, "server": "", "is_change": 0, "is_running": 0};
  if (!config["server"]) {
    Fetch(push_default_centerURL, {method: 'GET'}).then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog("Error/setNotificationServer", response.json);
        throw new Error();
      }
    }).then(function (json) {
      if (json[0]) {
        config["server"] = json[0];
        setConfig(4, name, config);
      } else {
        ons.notification.alert('通知サーバーが見つかりませんでした。<br>開発者にご連絡ください。', {title: 'エラー'});
      }
    }).catch(function (error) {
      showtoast('cannot-pros');
      console.log(error);
    });
  }
}