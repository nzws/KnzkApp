const mk_login = {}

mk_login.openLoginConfirm = function(domain) {
  if (domain) {
    if (domain.match(/@/i)) {
      showtoast('domain_invalid_text')
      return
    }
    ons.notification
      .confirm(dialog_i18n('terms', 1), {
        title: dialog_i18n('terms'),
        modifier: 'material',
        cancelable: true
      })
      .then(function(e) {
        if (e === 1) {
          knzkMk.openLogin(domain)
        }
      })
  }
}

mk_login.openLogin = function(domain) {
  var os_name,
    uri = 'knzkapp://login/token'
  if (platform === 'ios') {
    os_name = 'iOS'
  } else if (platform === 'android') {
    os_name = 'Android'
  } else {
    os_name = 'DeskTop'
    uri = 'urn:ietf:wg:oauth:2.0:oob'
  }
  Fetch('https://' + domain + '/api/app/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      description: 'KnzkApp',
      name: 'KnzkApp for ' + os_name,
      callbackUrl: uri,
      permission: [
        'account/read',
        'account/write',
        'account-read',
        'account-write',
        'note-write',
        'reaction-write',
        'following-read',
        'following-write',
        'drive-read',
        'drive-write',
        'notification-read',
        'notification-write',
        'vote-write',
        'favorites-read',
        'favorite-write',
        'messaging-read',
        'messaging-write'
      ]
    })
  })
    .then(function(response) {
      if (response.ok) {
        return response.json()
      } else {
        throw response
      }
    })
    .then(function(json) {
      var inst_domain_tmp = domain.toLowerCase()
      localStorage.setItem('knzkapp_tmp_domain', inst_domain_tmp)
      localStorage.setItem('knzkapp_tmp_scr', json['secret'])

      Fetch('https://' + domain + '/api/auth/session/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          appSecret: json['secret']
        })
      })
        .then(function(response) {
          if (response.ok) {
            return response.json()
          } else {
            throw response
          }
        })
        .then(function(json) {
          localStorage.setItem('knzkapp_tmp_token', json['token'])
          if (platform === 'ios') {
            openURL(json['url'])
          } else {
            window.open(json['url'], '_system')
          }
          if (os_name === 'DeskTop') {
            ons.notification
              .confirm(dialog_i18n('code', 'misskey'), {
                title: dialog_i18n('code'),
                modifier: 'material'
              })
              .then(function(c) {
                if (c === 1) {
                  knzkMk.loginCallback()
                }
              })
          }
        })
        .catch(function(error) {
          catchHttpErr('createApp', error)
          show('cannot-connect-sv-login')
          hide('now_loading')
        })
    })
    .catch(function(error) {
      catchHttpErr('createApp', error)
      show('cannot-connect-sv-login')
      hide('now_loading')
    })
}

mk_login.loginCallback = function() {
  if (platform === 'ios') {
    SafariViewController.isAvailable(function(available) {
      if (available) {
        SafariViewController.hide(
          function() {
            console.log('hide SVC success')
          },
          function() {
            console.log('hide SVC failed')
          }
        )
      }
    })
  }

  Fetch('https://' + localStorage.getItem('knzkapp_tmp_domain') + '/api/auth/session/userkey', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      appSecret: localStorage.getItem('knzkapp_tmp_scr'),
      token: localStorage.getItem('knzkapp_tmp_token')
    })
  })
    .then(function(response) {
      if (response.ok) {
        if (now_userconf['username']) account_change()
      } else {
        throw response
      }
      return response.json()
    })
    .then(function(json) {
      setTimeout(function() {
        if (json.accessToken) {
          now_userconf['token'] = sha256(json.accessToken + localStorage.getItem('knzkapp_tmp_scr'))
          localStorage.setItem('knzkapp_now_token', now_userconf['token'])

          localStorage.setItem('knzkapp_now_domain', localStorage.getItem('knzkapp_tmp_domain'))
          localStorage.setItem('knzkapp_now_service', 'misskey')
          inst = localStorage.getItem('knzkapp_tmp_domain')

          const confdata = JSON.parse(localStorage.getItem('knzkapp_conf_mastodon_timeline'))
          const acct = json.user.username + '@' + inst

          confdata[acct] = {
            config: ['home', 'local', 'public', 'local_media', 'public_media'],
            default: 0,
            list_names: {}
          }

          localStorage.setItem('knzkapp_conf_mastodon_timeline', JSON.stringify(confdata))

          if (localStorage.getItem('knzkapp_account_list') == undefined)
            localStorage.setItem('knzkapp_account_list', JSON.stringify([]))
          localStorage.setItem('knzkapp_now_username', json.user.username)
          localStorage.setItem('knzkapp_now_id', json.user.id)
          location.href = 'misskey.html'
        } else {
          hide('now_loading')
          ons.notification.alert(json.error, {
            title: i18next.t('dialogs_js.login_error'),
            modifier: 'material'
          })
        }
      }, 500)
    })
    .catch(function(error) {
      catchHttpErr('login_oauth_token', error)
      showtoast('cannot-connect-sv')
      hide('now_loading')
    })
}
