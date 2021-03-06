function login_open(domain) {
  let os_name;
  let uri = 'knzkapp://login/token';
  if (platform === 'ios') {
    os_name = 'iOS';
  } else if (platform === 'android') {
    os_name = 'Android';
  } else {
    os_name = 'DeskTop';
    uri = 'urn:ietf:wg:oauth:2.0:oob';
  }
  Fetch('https://' + domain + '/api/v1/apps', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      scopes: 'read write follow',
      client_name: 'KnzkApp for ' + os_name,
      redirect_uris: uri,
      website: 'https://github.com/knzkdev/knzkapp'
    })
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      const inst_domain_tmp = domain.toLowerCase();
      localStorage.setItem('knzkapp_tmp_domain', inst_domain_tmp);
      localStorage.setItem('knzkapp_tmp_cid', json['client_id']);
      localStorage.setItem('knzkapp_tmp_scr', json['client_secret']);
      const url =
        'https://' +
        inst_domain_tmp +
        '/oauth/authorize?response_type=code&redirect_uri=' +
        uri +
        '&scope=read+write+follow&client_id=' +
        json['client_id'];
      if (platform === 'ios') {
        openURL(url);
      } else {
        window.open(url, '_system');
      }
      if (os_name === 'DeskTop') {
        ons.notification
          .prompt(dialog_i18n('code', 1), {
            title: dialog_i18n('code'),
            modifier: 'material',
            cancelable: true
          })
          .then(code => {
            if (code) {
              login_callback(code);
            }
          });
      }
    })
    .catch(error => {
      catchHttpErr('createApp', error);
      show('cannot-connect-sv-login');
      hide('now_loading');
    });
}

function login_open_c(domain) {
  if (domain) {
    if (domain.match(/@/i)) {
      showtoast('domain_invalid_text');
      return;
    }
    ons.notification
      .confirm(dialog_i18n('terms', 1), {
        title: dialog_i18n('terms'),
        modifier: 'material',
        cancelable: true
      })
      .then(e => {
        if (e === 1) {
          login_open(domain);
        }
      });
  }
}

function login_callback(code) {
  let uri = 'knzkapp://login/token';
  if (platform === 'ios') {
    SafariViewController.isAvailable(available => {
      if (available) {
        SafariViewController.hide(
          () => {
            // eslint-disable-next-line no-console
            console.log('hide SVC success');
          },
          () => {
            // eslint-disable-next-line no-console
            console.log('hide SVC failed');
          }
        );
      }
    });
  } else if (platform !== 'android') {
    uri = 'urn:ietf:wg:oauth:2.0:oob';
  }
  Fetch(
    'https://' + localStorage.getItem('knzkapp_tmp_domain') + '/oauth/token',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: localStorage.getItem('knzkapp_tmp_cid'),
        client_secret: localStorage.getItem('knzkapp_tmp_scr'),
        grant_type: 'authorization_code',
        redirect_uri: uri,
        code: code
      })
    }
  )
    .then(response => {
      if (response.ok) {
        if (now_userconf['username']) account_change();
      } else {
        throw response;
      }
      return response.json();
    })
    .then(json => {
      setTimeout(() => {
        if (json.access_token) {
          now_userconf['token'] = json.access_token;
          localStorage.setItem('knzkapp_now_token', json.access_token);
          localStorage.setItem(
            'knzkapp_now_domain',
            localStorage.getItem('knzkapp_tmp_domain')
          );
          inst = localStorage.getItem('knzkapp_tmp_domain');

          Fetch('https://' + inst + '/api/v1/accounts/verify_credentials', {
            headers: { Authorization: 'Bearer ' + now_userconf['token'] }
          })
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                throw response;
              }
            })
            .then(json_acct => {
              const confdata = JSON.parse(
                localStorage.getItem('knzkapp_conf_mastodon_timeline')
              );
              const acct = json_acct['username'] + '@' + inst;

              confdata[acct] = {
                config: [
                  'home',
                  'local',
                  'public',
                  'local_media',
                  'public_media'
                ],
                default: 0,
                list_names: {}
              };

              localStorage.setItem(
                'knzkapp_conf_mastodon_timeline',
                JSON.stringify(confdata)
              );

              if (localStorage.getItem('knzkapp_account_list') == undefined)
                localStorage.setItem(
                  'knzkapp_account_list',
                  JSON.stringify([])
                );
              localStorage.setItem('knzkapp_now_username', json_acct.acct);
              localStorage.setItem('knzkapp_now_id', json_acct.id);
              window.location.reload();
            })
            .catch(error => {
              catchHttpErr('login_verify_credentials', error);
              showtoast('cannot-connect-sv');
              hide('now_loading');
            });
        } else {
          hide('now_loading');
          ons.notification.alert(json.error, {
            title: i18next.t('dialogs_js.login_error'),
            modifier: 'material'
          });
        }
      }, 500);
    })
    .catch(error => {
      catchHttpErr('login_oauth_token', error);
      showtoast('cannot-connect-sv');
      hide('now_loading');
    });
}

function debug_login() {
  show('now_loading');
  const inst_domain = elemId('login_debug_domain').value;
  const token = elemId('login_debug_token').value;

  Fetch('https://' + inst_domain + '/api/v1/accounts/verify_credentials', {
    headers: { Authorization: 'Bearer ' + token }
  })
    .then(response => {
      if (response.ok) {
        if (now_userconf['username']) account_change();
        return response.json();
      } else {
        //デバッガなのでいらない
        throw new Error();
      }
    })
    .then(json => {
      setTimeout(() => {
        if (localStorage.getItem('knzkapp_account_list') == undefined)
          localStorage.setItem('knzkapp_account_list', JSON.stringify([]));
        localStorage.setItem('knzkapp_now_token', token);
        localStorage.setItem('knzkapp_now_domain', inst_domain);
        localStorage.setItem('knzkapp_now_username', json.acct);
        localStorage.setItem('knzkapp_now_id', json.id);

        window.location.reload();
      }, 500);
    })
    .catch(error => {
      showtoast('cannot-connect-sv');
      // eslint-disable-next-line no-console
      console.log(error);
      hide('now_loading');
    });
}

function account_change(id) {
  const list = JSON.parse(localStorage.getItem('knzkapp_account_list'));

  const now = {
    username: now_userconf['username'],
    userid: now_userconf['id'],
    login_token: now_userconf['token'],
    login_domain: localStorage.getItem('knzkapp_now_domain')
  };

  if (id) {
    const nid = parseInt(id);
    const next_account = list[nid];
    list.splice(nid, 1);
    Fetch(
      'https://' +
        next_account['login_domain'] +
        '/api/v1/accounts/verify_credentials',
      {
        headers: { Authorization: 'Bearer ' + next_account['login_token'] }
      }
    )
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        localStorage.setItem('knzkapp_now_token', next_account['login_token']);
        localStorage.setItem('knzkapp_now_username', next_account['username']);
        localStorage.setItem('knzkapp_now_id', next_account['userid']);
        localStorage.setItem(
          'knzkapp_now_domain',
          next_account['login_domain'].toLowerCase()
        );

        list.unshift(now);
        localStorage.setItem('knzkapp_account_list', JSON.stringify(list));

        window.location.reload();
      })
      .catch(error => {
        catchHttpErr('loginchange_verify_credentials', error);
        showtoast('cannot-connect-API');
      });
  } else {
    list.unshift(now);
    localStorage.setItem('knzkapp_account_list', JSON.stringify(list));
  }
}

function account_del(id) {
  ons.notification
    .confirm(dialog_i18n('delete_account', 1), {
      title: dialog_i18n('delete_account'),
      modifier: 'material'
    })
    .then(e => {
      if (e === 1) {
        const list = JSON.parse(localStorage.getItem('knzkapp_account_list'));
        const nid = parseInt(id);
        list.splice(nid, 1);
        localStorage.setItem('knzkapp_account_list', JSON.stringify(list));
        elemId('splitter-menu').close();
        showtoast('del_ok');
      }
    });
}

function account_list() {
  const list = JSON.parse(localStorage.getItem('knzkapp_account_list'));
  let reshtml = '';
  let i = 0;
  while (list[i]) {
    reshtml +=
      '<ons-list-item>\n' +
      '      <div class="center" onclick=\'account_change("' +
      i +
      '")\'>\n' +
      '        <span class="list-item__title">@' +
      list[i]['username'] +
      '@' +
      list[i]['login_domain'] +
      '</span>\n' +
      '      </div>\n' +
      '      <div class="right" onclick=\'account_del("' +
      i +
      '")\'>\n' +
      '        <span class="list-item__title"><i class="list-item__icon list-item--chevron__icon ons-icon fa-trash fa fa-fw"></i></span>\n' +
      '      </div>\n' +
      '    </ons-list-item>';
    i++;
  }
  elemId('account-list-other').innerHTML = reshtml;
}

function open_addaccount() {
  const menu = elemId('splitter-menu');
  document
    .querySelector('#navigator')
    .bringPageTop('login.html', { animation: 'slide' })
    .then(menu.close.bind(menu));
}

function clearAllAccount() {
  ons.notification
    .confirm(dialog_i18n('clear_account', 1), {
      title: dialog_i18n('clear_account'),
      modifier: 'material',
      cancelable: true
    })
    .then(e => {
      if (e === 1) {
        localStorage.setItem('knzkapp_account_list', JSON.stringify([]));

        localStorage.removeItem('knzkapp_now_token');
        localStorage.removeItem('knzkapp_now_username');
        localStorage.removeItem('knzkapp_now_id');
        localStorage.removeItem('knzkapp_now_domain');
        ons.notification.toast(i18next.t('dialogs_js.clear_done'));
      }
    });
}

function changeAccountInLoad() {
  const list = JSON.parse(localStorage.getItem('knzkapp_account_list'));
  const buttons = [];
  let i = 0;
  while (list[i]) {
    buttons.push({
      label: list[i]['username'] + '@' + list[i]['login_domain']
    });
    i++;
  }
  buttons.push({ label: '<b>' + i18next.t('account.add') + '</b>' });
  buttons.push({ label: i18next.t('navigation.cancel'), icon: 'md-close' });

  ons
    .openActionSheet({
      title: i18next.t('starting.error_acct'),
      cancelable: true,
      buttons: buttons
    })
    .then(index => {
      if (list.length === index) {
        hide('starting_screen');
        open_addaccount();
        return;
      }
      if (list.length + 1 === index) {
        hide('starting_screen');
        return;
      }
      account_change(index);
    });

  elemId('account-list-other').innerHTML = reshtml;
}
