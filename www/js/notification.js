function startWatching() {
  try {
    if (Notification_ws) {
      try {
        Notification_ws.close();
      } catch (e) {}
      Notification_ws = null;
    }
    if (!getConfig(1, 'no_unread_label')) {
      Notification_ws = new WebSocket(
        'wss://' +
          inst +
          '/api/v1/streaming/?access_token=' +
          now_userconf['token'] +
          '&stream=user'
      );
      Notification_ws.onopen = function() {
        Notification_ws.onmessage = function(message) {
          var ws_resdata = JSON.parse(message.data);

          if (ws_resdata.event === 'notification') {
            ws_resdata = JSON.parse(ws_resdata.payload);
            var filter = getConfig(
              5,
              (ws_resdata['account']['acct'].indexOf('@') === -1
                ? ws_resdata['account']['acct'] + '@' + inst
                : ws_resdata['account']['acct']
              ).toLowerCase()
            );
            if (
              !(
                (ws_resdata['type'] === 'favourite' && filter['fav']) ||
                (ws_resdata['type'] === 'reblog' && filter['boost']) ||
                (ws_resdata['type'] === 'mention' && filter['mention'])
              )
            ) {
              Notification_num++;
              var noti = $('.noti_unread');
              noti.removeClass('invisible');
              noti.html(Notification_num);
            }
          }
        };
      };
    }
  } catch (e) {}
}

function resetLabel() {
  var noti = $('.noti_unread');
  noti.addClass('invisible');
  Notification_num = 0;
}

function changeNotification(force) {
  var config = LoadNotificationConfig();
  if (FCM_token) {
    var conf = $("[id^='noti-mute-']"),
      i = 0;
    if (conf[0]) {
      while (conf[i]) {
        config['option']['notification']['all'][conf[i].id.replace('noti-mute-', '')] =
          conf[i].checked;
        i++;
      }
      SetNotificationConfig('option', config['option']);
    }
    if (!config['is_running'] && force) {
      if (conf[0]) showtoast('ok_conf');
      return;
    }
    var is_unregister = '';
    if (config['is_running'] && !force) {
      is_unregister = 'un';
    }
    config['option']['notification']['user'] = getConfig(5, 'notification');
    var formdata = {
      server_key: push_default_serverKey,
      instance_url: inst,
      access_token: now_userconf['token'],
      device_token: FCM_token,
      option: JSON.stringify(config['option']),
      language: 'ja',
      username: now_userconf['username'],
      app_name: version,
    };
    var body = '';
    for (var key in formdata) {
      body += key + '=' + encodeURIComponent(formdata[key]) + '&';
    }
    body += 'd=' + new Date().getTime();
    Fetch('https://' + config['server'] + '/' + is_unregister + 'register', {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        Accept: 'application/json',
      },
      method: 'POST',
      body: body,
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(function(json) {
        SetNotificationConfig('is_running', is_unregister ? 0 : 1);
        if (conf[0]) showtoast('ok_conf');
      })
      .catch(function(error) {
        elemId('noti-mode').checked = !!is_unregister;
        error.text().then(errorMessage => {
          getError('Error/registerNotification', errorMessage);
        });
      });
  } else {
    ons.notification.alert(dialog_i18n('err_fcm_2', 1), {
      title: dialog_i18n('err_fcm_2'),
      modifier: 'material',
      cancelable: true,
    });
    elemId('noti-mode').checked = !!is_unregister;
  }
}

function addKeyWord() {
  ons.notification
    .prompt(dialog_i18n('keyword', 1), {
      title: dialog_i18n('keyword'),
      modifier: 'material',
      cancelable: true,
    })
    .then(function(repcom) {
      if (repcom) {
        if (repcom.length > 30) {
          ons.notification.alert(i18next.t('dialogs_js.keyword_limit'), {
            title: 'Error',
            modifier: 'material',
          });
          return;
        }
        var config = LoadNotificationConfig()['option'];
        config['keyword'].unshift(repcom);
        SetNotificationConfig('option', config);
        renderKeyWordList();
      }
    });
}

function renderKeyWordList() {
  var config = LoadNotificationConfig();
  var reshtml = '',
    i = 0;
  while (config['option']['keyword'][i]) {
    reshtml +=
      "<ons-list-item onclick='KeyWord_del(" +
      i +
      ")'>" +
      '<span class="list-item__title">' +
      escapeHTML(config['option']['keyword'][i]) +
      '</span>' +
      '</ons-list-item>\n';
    i++;
  }
  elemId('keyword_list').innerHTML = reshtml;
}

function KeyWord_del(id) {
  var config = LoadNotificationConfig()['option'],
    nid = parseInt(id);
  config['keyword'].splice(nid, 1);
  SetNotificationConfig('option', config);
  showtoast('del_ok');
  renderKeyWordList();
}

function LoadNotificationConfig() {
  var name = now_userconf['username'] + '@' + inst;
  return getConfig(4, name);
}

function SetNotificationConfig(n, data) {
  var name = now_userconf['username'] + '@' + inst;
  var config = getConfig(4, name);
  config[n] = data;
  setConfig(4, name, config);
}

function setNotificationServer() {
  show('now_loading');
  var name = now_userconf['username'] + '@' + inst;
  var config = LoadNotificationConfig();
  if (!config)
    config = {
      option: { notification: { all: {}, user: {} }, keyword: [] },
      server: '',
      is_change: 0,
      is_running: 0,
    };
  if (!config['server']) {
    Fetch(push_default_centerURL, { method: 'GET' })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(function(json) {
        if (json[0]) {
          config['server'] = json[0];
          setConfig(4, name, config);
          initNotificationPage();
        } else {
          ons.notification.alert(dialog_i18n('err_notification_sv', 1), {
            title: dialog_i18n('err_notification_sv'),
            modifier: 'material',
            cancelable: true,
          });
          hide('now_loading');
        }
      })
      .catch(function(error) {
        error.text().then(errorMessage => {
          getError('Error/setNotificationServer', errorMessage);
        });
      });
  } else {
    initNotificationPage();
  }
}

function initNotificationPage() {
  setTimeout(function() {
    elemId('noti-mode').checked = !!LoadNotificationConfig()['is_running'];
    var conf = $("[id^='noti-mute-']"),
      i = 0;
    while (conf[i]) {
      conf[i].checked = LoadNotificationConfig()['option']['notification']['all'][
        conf[i].id.replace('noti-mute-', '')
      ];
      i++;
    }
    renderKeyWordList();
    hide('now_loading');
  }, 50);
}
