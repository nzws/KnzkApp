function startWatching() {
  let heartbeat;
  try {
    if (Notification_ws) {
      try {
        Notification_ws.close();
        // eslint-disable-next-line no-empty
      } catch (e) {}
      Notification_ws = null;
    }
    if (!getConfig(1, 'no_unread_label')) {
      Notification_ws = new WebSocket(
        'wss://' +
          inst +
          '/api/v1/streaming/?access_token=' +
          now_userconf['token'] +
          '&stream=user&u=1'
      );
      Notification_ws.onopen = () => {
        heartbeat = setInterval(() => Notification_ws.send('p'), 10000); //ping
        Notification_ws.onmessage = message => {
          let ws_resdata = JSON.parse(message.data);

          if (ws_resdata.event === 'notification') {
            ws_resdata = JSON.parse(ws_resdata.payload);
            const filter = getConfig(
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
              const noti = $('.noti_unread');
              noti.removeClass('invisible');
              noti.html(Notification_num);
            }
          }
        };
        Notification_ws.onclose = () => {
          clearInterval(heartbeat);
          startWatching();
        };
      };
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

function resetLabel() {
  const noti = $('.noti_unread');
  noti.addClass('invisible');
  Notification_num = 0;
}

function changeNotification(force) {
  const config = LoadNotificationConfig();
  if (FCM_token) {
    const conf = $("[id^='noti-mute-']");
    let i = 0;
    if (conf[0]) {
      while (conf[i]) {
        config['option']['notification']['all'][
          conf[i].id.replace('noti-mute-', '')
        ] = conf[i].checked;
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
    const formdata = {
      server_key: push_default_serverKey,
      instance_url: inst,
      access_token: now_userconf['token'],
      device_token: FCM_token,
      option: JSON.stringify(config['option']),
      language: lng,
      username: now_userconf['username'],
      app_name: document.querySelector('meta[name=version]').content
    };
    let body = '';
    for (const key in formdata) {
      body += key + '=' + encodeURIComponent(formdata[key]) + '&';
    }
    body += 'd=' + new Date().getTime();
    Fetch('https://' + config['server'] + '/' + is_unregister + 'register', {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
        Accept: 'application/json'
      },
      method: 'POST',
      body: body
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        SetNotificationConfig('is_running', is_unregister ? 0 : 1);
        if (conf[0]) showtoast('ok_conf');
      })
      .catch(error => {
        elemId('noti-mode').checked = !!is_unregister;
        catchHttpErr('register_notification', error);
      });
  } else {
    /*
    ons.notification.alert(dialog_i18n('err_fcm_2', 1), {
      title: dialog_i18n('err_fcm_2'),
      modifier: 'material',
      cancelable: true
    });
     */
    elemId('noti-mode').checked = !!is_unregister;
  }
}

function addKeyWord() {
  ons.notification
    .prompt(dialog_i18n('keyword', 1), {
      title: dialog_i18n('keyword'),
      modifier: 'material',
      cancelable: true
    })
    .then(repcom => {
      if (repcom) {
        if (repcom.length > 30) {
          ons.notification.alert(i18next.t('dialogs_js.keyword_limit'), {
            title: 'Error',
            modifier: 'material'
          });
          return;
        }
        const config = LoadNotificationConfig()['option'];
        config['keyword'].unshift(repcom);
        SetNotificationConfig('option', config);
        renderKeyWordList();
      }
    });
}

function renderKeyWordList() {
  const config = LoadNotificationConfig();
  let reshtml = '';
  let i = 0;
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
  const config = LoadNotificationConfig()['option'];
  const nid = parseInt(id);
  config['keyword'].splice(nid, 1);
  SetNotificationConfig('option', config);
  showtoast('del_ok');
  renderKeyWordList();
}

function LoadNotificationConfig() {
  const name = now_userconf['username'] + '@' + inst;
  return getConfig(4, name);
}

function SetNotificationConfig(n, data) {
  const name = now_userconf['username'] + '@' + inst;
  const config = getConfig(4, name);
  config[n] = data;
  setConfig(4, name, config);
}

function setNotificationServer() {
  show('now_loading');
  const name = now_userconf['username'] + '@' + inst;
  let config = LoadNotificationConfig();
  if (!config)
    config = {
      option: { notification: { all: {}, user: {} }, keyword: [] },
      server: '',
      is_change: 0,
      is_running: 0
    };
  if (!config['server']) {
    Fetch(push_default_centerURL, { method: 'GET' })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        if (json[0]) {
          config['server'] = json[0];
          setConfig(4, name, config);
          initNotificationPage();
        } else {
          ons.notification.alert(dialog_i18n('err_notification_sv', 1), {
            title: dialog_i18n('err_notification_sv'),
            modifier: 'material',
            cancelable: true
          });
          hide('now_loading');
        }
      })
      .catch(error => {
        catchHttpErr('setNotificationServer', error);
      });
  } else {
    initNotificationPage();
  }
}

function initNotificationPage() {
  setTimeout(() => {
    elemId('noti-mode').checked = !!LoadNotificationConfig()['is_running'];
    const conf = $("[id^='noti-mute-']");
    let i = 0;
    while (conf[i]) {
      conf[i].checked = LoadNotificationConfig()['option']['notification'][
        'all'
      ][conf[i].id.replace('noti-mute-', '')];
      i++;
    }
    renderKeyWordList();
    hide('now_loading');
  }, 50);
}
