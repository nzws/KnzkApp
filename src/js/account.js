function AccountCard(acct, mode) {
  let action;

  if (mode === 'addList') action = "addAccountToList('" + acct['id'] + "')";
  else if (mode === 'delList')
    action = "addAccountToList('" + acct['id'] + "', true)";
  else action = "show_account('" + acct['id'] + "')";

  acct['action'] = action;
  acct['display_name'] = t_text(
    escapeHTML(acct['display_name']),
    acct['emojis'],
    acct['acct']
  );

  return tmpl('account_card_tmpl', acct);
}

function show_account(id) {
  const largeId = window.isLargeMode ? '-large' : '';
  loadNav('account.html', null);
  Fetch('https://' + inst + '/api/v1/accounts/' + id, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'GET'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      acctdata['acct'][json['id']] = json;
      account_page_id = json.id;
      account_page_acct = json.acct;

      let bio_field = '';
      let i = 0;
      let border_style = '';
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
              t_text(json['fields'][i]['value'], json['emojis'], json['acct']) +
              '</span>' +
              '</div></div>';
            i++;
          }
        }
      }
      elemId('bio_field').innerHTML = bio_field;

      if (!json.display_name) json.display_name = json.username;
      elemId('userpage-name').innerHTML = t_text(
        escapeHTML(json.display_name),
        json.emojis,
        json.acct
      );
      elemId('userpage-title').innerHTML = '@' + json.acct;
      elemId('userpage-acct').innerHTML = '@' + json.acct;
      elemId('userpage-bio').innerHTML = t_text(
        json.note,
        json.emojis,
        json.acct
      );
      elemId('userpage-icon' + largeId).src =
        json[getConfig(1, 'no_gif') ? 'avatar_static' : 'avatar'];
      document
        .getElementById('userpage-bg' + largeId)
        .setAttribute(
          'style',
          "background-image: url('" +
            json[getConfig(1, 'no_gif') ? 'header_static' : 'header'] +
            "');"
        );
      elemId('userpage-follow').innerHTML = json.following_count;
      elemId('userpage-follower').innerHTML = json.followers_count;
      elemId('userpage-post-count').innerHTML = json.statuses_count;
      if (json.locked) $('#userpage-lock').removeClass('invisible');
      else $('#userpage-lock').addClass('invisible');
      if (json.bot) $('#userpage-bot').removeClass('invisible');
      else $('#userpage-bot').addClass('invisible');
      showAccountTL(json.id);

      if (json.moved) {
        elemId('acct-moved-base').className = 'toot acct-small';
        elemId('acct-moved').innerHTML = AccountCard(json.moved);
      } else {
        elemId('acct-moved-base').className = 'invisible';
      }

      if (json.username === json.acct) {
        //登録日
        const d = new Date(json['created_at']);
        const date_text = d.toLocaleDateString(lng, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        elemId('userpage-hint').innerHTML =
          i18next.t('account.joined_at') + ': <b>' + date_text + '</b>';
      } else {
        elemId('userpage-hint').innerHTML =
          "<span class='note'>" + i18next.t('account.note') + '</span>';
      }
    })
    .catch(error => {
      catchHttpErr('show_account', error);
    });

  Fetch('https://' + inst + '/api/v1/accounts/relationships?id=' + id, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'GET'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      acctdata['rs'][id] = json;

      elemId('userpage-follower-badge').className =
        json[0]['followed_by'] === true ? 'userpage-follower' : 'invisible';
      elemId('userpage-follow-button').className =
        'userpage-button ons-icon fa ' +
        (json[0]['following'] ? 'fa-user-times follow-active' : 'fa-user-plus');

      if (json[0]['muting'])
        elemId('userpage-follow-button').className = 'invisible';
      elemId('userpage-mute-badge').className = json[0]['muting']
        ? 'userpage-follower'
        : 'invisible';

      if (json[0]['blocking'] === true)
        elemId('userpage-follow-button').className = 'invisible';
      elemId('userpage-block-badge').className =
        json[0]['blocking'] === true ? 'userpage-follower' : 'invisible';

      if (json[0]['id'] === now_userconf['id']) {
        elemId('userpage-follow-button').className = 'invisible';
        elemId('userpage-follower-badge').className = 'invisible';
      }

      if (json[0]['requested'] === true)
        elemId('userpage-follow-button').className =
          'userpage-button follow-active ons-icon fa-hourglass fa';
      elemId('userpage-followreq-badge').className =
        json[0]['requested'] === true ? 'userpage-follower' : 'invisible';
    })
    .catch(error => {
      catchHttpErr('relationships', error);
    });
}

function account_state_action(id, mode) {
  let url = '';
  if (mode === 'follow') {
    url =
      acctdata['rs'][id][0]['following'] || acctdata['rs'][id][0]['requested']
        ? '/unfollow'
        : '/follow';
    elemId('userpage-follow-button').className =
      'userpage-button ons-icon fa-spinner fa fa-spin';
  } else if (mode === 'mute') {
    url = acctdata['rs'][id][0]['muting'] ? '/unmute' : '/mute';
  } else if (mode === 'block') {
    url = acctdata['rs'][id][0]['blocking'] ? '/unblock' : '/block';
  } else if (mode === 'endorsements') {
    url = acctdata['rs'][id][0]['endorsed'] ? '/unpin' : '/pin';
  }

  Fetch('https://' + inst + '/api/v1/accounts/' + id + url, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'POST'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      if (mode !== 'follow') showtoast('ok_conf_2');
      setTimeout(() => {
        show_account(id);
      }, 500);
    })
    .catch(error => {
      catchHttpErr('state_action', error);
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
            icon: 'md-close'
          }
        ]
      })
      .then(index => {
        if (index === 0) openURL(acctdata['acct'][id]['url']);
        else if (index === 1) copy(acctdata['acct'][id]['url']);
        else if (index === 2) OpenQR(inst, account_page_acct.split('@')[0]);
      });
  } else {
    const mute_m = acctdata['rs'][id][0]['muting']
      ? i18next.t('actionsheet.toot.mute.unset')
      : i18next.t('actionsheet.toot.mute.set');
    const block_m = acctdata['rs'][id][0]['blocking']
      ? i18next.t('actionsheet.toot.block.unset')
      : i18next.t('actionsheet.toot.block.set');
    const endorsements = acctdata['rs'][id][0]['endorsed']
      ? i18next.t('actionsheet.toot.endorsements.unset')
      : i18next.t('actionsheet.toot.endorsements.set');

    const button_arr = [
      i18next.t('actionsheet.toot.mention'),
      i18next.t('actionsheet.toot.openbrowser'),
      i18next.t('actionsheet.toot.url')
    ];
    if (acctdata['rs'][id][0]['following']) button_arr.push(endorsements);
    button_arr.push({ label: mute_m, modifier: 'destructive' });
    button_arr.push({ label: block_m, modifier: 'destructive' });
    button_arr.push({
      label: i18next.t('navigation.cancel'),
      icon: 'md-close'
    });

    ons
      .openActionSheet({
        cancelable: true,
        buttons: button_arr
      })
      .then(index => {
        if (index === 0) post_pre('@' + account_page_acct);
        else if (index === 1) openURL(acctdata['acct'][id]['url']);
        else if (index === 2) copy(acctdata['acct'][id]['url']);
        else if (index === 3 && acctdata['rs'][id][0]['following'])
          account_state_action(id, 'endorsements');
        else if (
          (index === 4 && acctdata['rs'][id][0]['following']) ||
          (index === 3 && !acctdata['rs'][id][0]['following'])
        )
          account_state_action(id, 'mute');
        else if (
          (index === 5 && acctdata['rs'][id][0]['following']) ||
          (index === 4 && !acctdata['rs'][id][0]['following'])
        )
          account_state_action(id, 'block');
      });
  }
}

function show_account_name(username) {
  Fetch('https://' + inst + '/api/v1/search?q=' + username, {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'GET'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      if (json) {
        const user = json['accounts'][0];
        if (user) {
          const userCheck = username.toLowerCase();
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
    })
    .catch(error => {
      catchHttpErr('show_account_username', error);
    });
}

function post_pre(text, force) {
  tmp_text_pre = !force ? text + ' ' : text;
  loadNav('post.html', 'up');
}

function OpenQR(instance, username) {
  document
    .querySelector('#navigator')
    .bringPageTop('qrcode.html')
    .then(() => {
      elemId('qrimg').src =
        'http://chart.googleapis.com/chart?cht=qr&chs=200x200&choe=UTF-8&chl=' +
        encodeURIComponent(
          'https://open.knzk.app/?instance=' + instance + '&name=' + username
        );
      elemId('qr-userid').innerText = username + '@' + instance;
    });
}

function update_userdata() {
  Fetch('https://' + inst + '/api/v1/accounts/update_credentials', {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'PATCH',
    body: JSON.stringify({
      display_name: elemId('userconf-display_name').value,
      note: elemId('userconf-note').value,
      locked: elemId('userconf-lock').checked
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
      showtoast('ok_conf');
      BackTab();
    })
    .catch(error => {
      catchHttpErr('update_userdata', error);
    });
}
