function AccountCard(acct) {
  var reshtml;

  reshtml =
    "<div onclick='show_account(" +
    acct['id'] +
    ')\' class="toot acct-small">\n' +
    '<img src="' +
    acct['avatar'] +
    '"class="icon-img-small" align="middle">\n' +
    '<span class="toot-group toot-card-right">\n' +
    '<b>' +
    t_text(escapeHTML(acct['display_name'])) +
    '</b> <small>@' +
    acct['acct'] +
    '</small>\n' +
    '</span>\n' +
    '</div>';

  return reshtml;
}

function show_account(id) {
  loadNav('account.html', null);
  Fetch('https://' + inst + '/api/v1/accounts/' + id, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'GET',
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog('Error/showaccount', response.json);
        throw new Error();
      }
    })
    .then(function(json) {
      acctdata['acct'][json['id']] = json;
      account_page_id = json.id;
      account_page_acct = json.acct;

      var bio_field = '',
        i = 0,
        border_style = '';
      if (json['fields']) {
        if (json['fields'][0]) {
          while (json['fields'][i]) {
            border_style = i === 0 ? "style='border-top:none'" : '';
            bio_field +=
              '<div class="account_bar account_bar_mode" ' +
              border_style +
              '>' +
              '<div class="account_links">' +
              '<span class="account_tab fields_left">' +
              escapeHTML(json['fields'][i]['name']) +
              '</span>' +
              '<span class="account_tab acctTL_now fields_right">' +
              json['fields'][i]['value'] +
              '</span>' +
              '</div></div>';
            i++;
          }
        }
      }

      if (!json.display_name) json.display_name = json.username;
      document.getElementById('userpage-name').innerHTML = t_text(
        escapeHTML(json.display_name)
      );
      document.getElementById('userpage-title').innerHTML = '@' + json.acct;
      document.getElementById('userpage-acct').innerHTML = '@' + json.acct;
      document.getElementById('userpage-bio').innerHTML =
        t_text(json.note) + bio_field;
      document.getElementById('userpage-icon').src =
        json[getConfig(1, 'no_gif') ? 'avatar_static' : 'avatar'];
      document
        .getElementById('userpage-bg')
        .setAttribute(
          'style',
          "background-image: url('" +
            json[getConfig(1, 'no_gif') ? 'header_static' : 'header'] +
            "');"
        );
      document.getElementById('userpage-follow').innerHTML =
        json.following_count;
      document.getElementById('userpage-follower').innerHTML =
        json.followers_count;
      document.getElementById('userpage-post-count').innerHTML =
        json.statuses_count;
      if (json.locked === true) $('#userpage-lock').removeClass('invisible');
      else $('#userpage-lock').addClass('invisible');
      showAccountTL(json.id);

      if (json.moved) {
        document.getElementById('acct-moved-base').className =
          'toot acct-small';
        document.getElementById('acct-moved').innerHTML = AccountCard(
          json.moved
        );
      } else {
        document.getElementById('acct-moved-base').className = 'invisible';
      }

      if (json.username === json.acct) {
        //登録日
        var d = new Date(json['created_at']);
        var date_text = d.toLocaleDateString(lng, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        document.getElementById('userpage-hint').innerHTML =
          i18next.t('account.joined_at') + ': <b>' + date_text + '</b>';
      } else {
        document.getElementById('userpage-hint').innerHTML =
          "<span class='note'>" + i18next.t('account.note') + '</span>';
      }
    })
    .catch(function(error) {
      showtoast('cannot-pros');
      console.log(error);
    });

  Fetch('https://' + inst + '/api/v1/accounts/relationships?id=' + id, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'GET',
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog('Error/relationships', response.json);
        throw new Error();
      }
    })
    .then(function(json) {
      acctdata['rs'][id] = json;

      if (json[0]['followed_by'] === true)
        document.getElementById('userpage-follower-badge').className =
          'userpage-follower';
      else
        document.getElementById('userpage-follower-badge').className =
          'invisible';

      if (json[0]['following'])
        document.getElementById('userpage-follow-button').className =
          'userpage-button follow-active ons-icon fa-user-times fa';
      else
        document.getElementById('userpage-follow-button').className =
          'userpage-button ons-icon fa-user-plus fa';

      if (json[0]['muting']) {
        document.getElementById('userpage-follow-button').className =
          'invisible';
        document.getElementById('userpage-mute-badge').className =
          'userpage-follower';
      } else document.getElementById('userpage-mute-badge').className = 'invisible';

      if (json[0]['blocking'] === true) {
        document.getElementById('userpage-follow-button').className =
          'invisible';
        document.getElementById('userpage-block-badge').className =
          'userpage-follower';
      } else document.getElementById('userpage-block-badge').className = 'invisible';

      if (json[0]['id'] === now_userconf['id']) {
        document.getElementById('userpage-follow-button').className =
          'invisible';
        document.getElementById('userpage-follower-badge').className =
          'invisible';
      }

      if (json[0]['requested'] === true) {
        document.getElementById('userpage-follow-button').className =
          'userpage-button follow-active ons-icon fa-hourglass fa';
        document.getElementById('userpage-followreq-badge').className =
          'userpage-follower';
      } else document.getElementById('userpage-followreq-badge').className = 'invisible';
    })
    .catch(function(error) {
      showtoast('cannot-pros');
      console.log(error);
    });
}

function account_state_action(id, mode) {
  var url = '';
  if (mode === 'follow') {
    url =
      acctdata['rs'][id][0]['following'] || acctdata['rs'][id][0]['requested']
        ? '/unfollow'
        : '/follow';
    document.getElementById('userpage-follow-button').className =
      'userpage-button ons-icon fa-spinner fa fa-spin';
  } else if (mode === 'mute') {
    url = acctdata['rs'][id][0]['muting'] ? '/unmute' : '/mute';
  } else if (mode === 'block') {
    url = acctdata['rs'][id][0]['blocking'] ? '/unblock' : '/block';
  }

  Fetch('https://' + inst + '/api/v1/accounts/' + id + url, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'POST',
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog('Error/state_action', response.json);
        throw new Error();
      }
    })
    .then(function(json) {
      if (mode !== 'follow') showtoast('ok_conf_2');
      setTimeout(function() {
        show_account(id);
      }, 500);
    })
    .catch(function(error) {
      showtoast('cannot-pros');
      console.log(error);
    });
}

function account_action(id) {
  if (now_userconf['id'] == id) {
    ons
      .openActionSheet({
        cancelable: true,
        buttons: [
          i18next.t('actionsheet.toot.openbrowser'),
          i18next.t('actionsheet.toot.url'),
          i18next.t('actionsheet.toot.qrcode'),
          {
            label: i18next.t('navigation.cancel'),
            icon: 'md-close',
          },
        ],
      })
      .then(function(index) {
        if (index === 0) openURL(acctdata['acct'][id]['url']);
        else if (index === 1) copy(acctdata['acct'][id]['url']);
        else if (index === 2)
          OpenQR('@' + account_page_acct.split('@')[0] + '@' + inst);
      });
  } else {
    var mute_m = acctdata['rs'][id][0]['muting']
      ? i18next.t('actionsheet.toot.mute.unset')
      : i18next.t('actionsheet.toot.mute.set');
    var block_m = acctdata['rs'][id][0]['blocking']
      ? i18next.t('actionsheet.toot.block.unset')
      : i18next.t('actionsheet.toot.block.unset');
    ons
      .openActionSheet({
        cancelable: true,
        buttons: [
          i18next.t('actionsheet.toot.mention'),
          i18next.t('actionsheet.toot.openbrowser'),
          i18next.t('actionsheet.toot.url'),
          {
            label: mute_m,
            modifier: 'destructive',
          },
          {
            label: block_m,
            modifier: 'destructive',
          },
          {
            label: i18next.t('navigation.cancel'),
            icon: 'md-close',
          },
        ],
      })
      .then(function(index) {
        if (index === 0) post_pre('@' + account_page_acct);
        else if (index === 1) openURL(acctdata['acct'][id]['url']);
        else if (index === 2) copy(acctdata['acct'][id]['url']);
        else if (index === 3) account_state_action(id, 'mute');
        else if (index === 4) account_state_action(id, 'block');
      });
  }
}

function show_account_name(username) {
  Fetch('https://' + inst + '/api/v1/search?q=' + username, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'GET',
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog('Error/show_account_name', response.json);
        showtoast('cannot-pros');
        return false;
      }
    })
    .then(function(json) {
      if (json) {
        var user = json['accounts'][0];
        if (user) {
          var userCheck = username.toLowerCase();
          if (
            !'@' + user['acct'].toLowerCase() === userCheck &&
            !('@' + user['acct'] + '@' + inst).toLowerCase() === userCheck
          ) {
            showtoast('no-acct');
          }
          show_account(user['id']);
        } else {
          showtoast('cannot-pros');
          return false;
        }
      }
    });
}

function post_pre(text, force) {
  tmp_text_pre = !force ? text + ' ' : text;
  loadNav('post.html', 'up');
}

function OpenQR(user) {
  document
    .querySelector('#navigator')
    .bringPageTop('qrcode.html')
    .then(function() {
      document.getElementById('qrimg').src =
        'http://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chl=https%3A%2F%2Fopenapp.nzws.me%2Fopen.html%3F' +
        encodeURIComponent(user);
      document.getElementById('qr-userid').innerText = user;
    });
}

function update_userdata() {
  Fetch('https://' + inst + '/api/v1/accounts/update_credentials', {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'PATCH',
    body: JSON.stringify({
      display_name: document.getElementById('userconf-display_name').value,
      note: document.getElementById('userconf-note').value,
      locked: document.getElementById('userconf-lock').checked,
    }),
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        sendLog('Error/update_userdata', response);
        throw new Error();
      }
    })
    .then(function(json) {
      showtoast('ok_conf');
      BackTab();
    })
    .catch(function(error) {
      showtoast('cannot-pros');
      console.log(error);
    });
}
