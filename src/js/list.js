function list(mode, title, more_load, mode_toot, navmode) {
  if (navmode === true) {
    $.when(
      document
        .querySelector('#navigator')
        .bringPageTop('olist_nav.html', { animation: 'slide' })
    ).done(() => {
      list_n(mode, title, more_load, mode_toot, true);
    });
  } else {
    const menu = elemId('splitter-menu');
    $.when(
      document
        .querySelector('#navigator')
        .resetToPage('olist.html', { animation: 'none' })
        .then(menu.close.bind(menu))
    ).done(() => {
      list_n(mode, title, more_load, mode_toot);
    });
  }
}

function list_n(mode, title, more_load, mode_toot, navmode) {
  let i = 0;
  let reshtml = '';
  let get = '';
  let pin;
  let id_title;
  let id_main;
  if (more_load) {
    if (!list_old_id[0]) {
      setTimeout(() => {
        more_load();
      }, 500);
      return;
    }
    get = '?' + list_old_id[0];
  }
  if (mode === 'pin') {
    pin = true;
    mode = '/accounts/' + now_userconf['id'] + '/statuses?pinned=true';
  }
  if (navmode === true) {
    id_title = 'olist_nav_title';
    id_main = 'olist_nav_main';
  } else {
    id_title = 'olist_title';
    id_main = 'olist_main';
  }
  if (!mode && more_load) {
    mode = elemId(id_main).mode;
    mode_toot = elemId(id_main).mode_toot;
  }
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 304) {
        const json = JSON.parse(xhr.responseText);
        if (more_load) reshtml = elemId(id_main).innerHTML;
        else
          elemId(id_title).innerHTML = title.match(/\./i)
            ? i18next.t(title)
            : title;

        while (json[i]) {
          if (mode_toot === 'toot') {
            reshtml += toot_card(json[i], 'full', null);
          } else if (mode_toot === 'acct') {
            if (!json[i]['display_name'])
              json[i]['display_name'] = json[i]['username'];

            reshtml += AccountCard(json[i]);

            if (mode === 'follow_requests') {
              reshtml +=
                '<div class="toot y-center" style=\'padding-left: 0\'>\n' +
                "<ons-button style=\"width: 45%\" class='y-center' onclick='followreq(" +
                json[i]['id'] +
                ", \"authorize\")'><ons-icon icon='fa-check'></ons-icon></ons-button>\n" +
                "<ons-button style=\"width: 45%\" class='y-center' onclick='followreq(" +
                json[i]['id'] +
                ", \"reject\")'><ons-icon icon='fa-times'></ons-icon></ons-button>\n" +
                '</div>';
            }
          } else if (mode_toot === 'domain') {
            reshtml +=
              '<div class="toot acct-small"><div class="hashtag-card"><span class="toot-group"><b>' +
              json[i] +
              '</b></span></div></div>\n';
          }
          i++;
        }
        if (i !== 0 && xhr.getResponseHeader('link').indexOf('max_id') !== -1)
          list_old_id = xhr.getResponseHeader('link').match(/max_id=\d+/);
        else list_old_id = '';

        if (!more_load) {
          elemId(id_main).mode = mode;
          elemId(id_main).mode_toot = mode_toot;
          elemId(id_main).navmode = navmode;
        }

        if (pin === true) mode = 'pin';

        elemId(id_main).innerHTML = reshtml;
      } else {
        showtoast('cannot-load');
      }
      setTimeout(() => {
        if (more_load) more_load();
      }, 500);
    }
  };
  xhr.open('GET', 'https://' + inst + '/api/v1/' + mode + get, false);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + now_userconf['token']);
  xhr.send();
}

function followreq(id, mode) {
  Fetch('https://' + inst + '/api/v1/follow_requests/' + id + '/' + mode, {
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
      showtoast('ok_conf_2');
      list_n('follow_requests', 'navigation.follow_req', null, 'acct');
    })
    .catch(error => {
      catchHttpErr('follow_req', error);
    });
}

function LoadrepStatus() {
  let i = 0;
  let reshtml = '';
  let repstatus = [];
  loadNav('olist_nav.html');
  Fetch('https://' + inst + '/api/v1/reports', {
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
      json.sort((a, b) => {
        let t = 0;
        let a_ = parseInt(a.id);
        let b_ = parseInt(b.id);

        if (a_ < b_) t = 1;
        if (a_ > b_) t = -1;

        return t;
      });
      reshtml +=
        '<div class="toot">\n' + i18next.t('report_status_note') + '</div>\n';
      while (json[i]) {
        if (json[i]['action_taken']) {
          repstatus[0] = '管理者が確認済み';
          repstatus[1] = 'check';
        } else {
          repstatus[0] = '処理中';
          repstatus[1] = 'question';
        }

        reshtml +=
          '<div class="toot acct-small">\n' +
          '<div class="hashtag-card">\n' +
          '<span class="toot-group">\n' +
          "<b><ons-icon icon='fa-" +
          repstatus[1] +
          "'></ons-icon> #" +
          json[i]['id'] +
          ': ' +
          repstatus[0] +
          '</b>\n' +
          '</span>\n' +
          '</div>\n' +
          '</div>';
        repstatus = [];
        i++;
      }
      elemId('olist_nav_title').innerHTML = i18next.t(
        'navigation.report_status'
      );
      elemId('olist_nav_main').innerHTML = reshtml;
    })
    .catch(error => {
      catchHttpErr('repStatus', error);
    });
}

function renderListsCollection(isEdit) {
  if (isEdit) {
    editing_id = isEdit;
    loadNav('lists_people.html');
  }
  Fetch(
    'https://' +
      inst +
      '/api/v1/lists' +
      (isEdit ? '/' + isEdit + '/accounts' : ''),
    {
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + now_userconf['token']
      },
      method: 'GET'
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
      if (json) {
        let i = 0;
        let buf = '';
        while (json[i]) {
          if (isEdit) {
            if (!json[i]['display_name'])
              json[i]['display_name'] = json[i]['username'];
            buf += AccountCard(json[i], 'delList');
          } else {
            buf +=
              '<ons-list-item class="list-item"><div class="center list-item__center" onclick="showList(' +
              json[i]['id'] +
              ", '" +
              json[i]['title'] +
              '\')">' +
              json[i]['title'] +
              '</div>' +
              '<div class="right list-item__right" onclick="listMore(' +
              json[i]['id'] +
              ", '" +
              json[i]['title'] +
              '\')"><i class="fa fa-ellipsis-h"></i></div></ons-list-item>';
          }
          i++;
        }
        elemId(isEdit ? 'people-list' : 'lists-list').innerHTML = buf;
      }
    })
    .catch(error => {
      catchHttpErr('render_lists', error);
    });
}

function addAccountToList(id, isDelete) {
  Fetch('https://' + inst + '/api/v1/lists/' + editing_id + '/accounts', {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: isDelete ? 'DELETE' : 'POST',
    body: JSON.stringify({ account_ids: [id] })
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
      renderListsCollection(editing_id);
    })
    .catch(error => {
      catchHttpErr('AddToList', error);
    });
}

function SearchListLoad() {
  const q = escapeHTML(elemId('List-search').value);
  Fetch(
    'https://' +
      inst +
      '/api/v1/accounts/search?q=' +
      q +
      '&resolve=false&following=true',
    {
      headers: {
        'content-type': 'application/json',
        Authorization: 'Bearer ' + now_userconf['token']
      },
      method: 'GET'
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
      let reshtml = '';
      let i = 0;
      reshtml +=
        '<ons-list-item tappable="" onclick="closeSearchList()" class="list-item">' +
        '<label class="left music-item list-item__left"><i class="list-item__icon list-item--chevron__icon ons-icon fa-times fa fa-fw"></i></label>' +
        '<div class="center music-item list-item__center">' +
        i18next.t('navigation.close') +
        '</div></ons-list-item>';
      while (json[i]) {
        if (!json[i]['display_name'])
          json[i]['display_name'] = json[i]['username'];
        reshtml += AccountCard(json[i], 'addList');
        i++;
      }

      elemId('searchpeople-list').innerHTML = reshtml;
    })
    .catch(error => {
      catchHttpErr('searchList', error);
    });
}

function closeSearchList() {
  renderListsCollection(editing_id);
  elemId('searchpeople-list').innerHTML = '';
}

function listMore(id, title, is_page) {
  timeline_list_names[id] = title;
  ons
    .openActionSheet({
      cancelable: true,
      buttons: [
        i18next.t('actionsheet.editlist.name'),
        i18next.t('actionsheet.editlist.people'),
        i18next.t('actionsheet.editlist.delete'),
        i18next.t('actionsheet.editlist.add'),
        {
          label: i18next.t('navigation.cancel'),
          icon: 'md-close'
        }
      ]
    })
    .then(index => {
      if (index === 0) editList(id, title, is_page);
      else if (index === 1) renderListsCollection(id);
      else if (index === 2) deleteList(id, title, is_page);
      else if (index === 3) editTLConfAdd('list:' + id);
    });
}

function editList(id, title, is_page) {
  const method = id ? 'PUT' : 'POST';
  ons.notification
    .prompt(dialog_i18n('editlist', 1), {
      title: dialog_i18n('editlist'),
      defaultValue: title ? title : '',
      modifier: 'material',
      cancelable: true
    })
    .then(repcom => {
      if (repcom) {
        Fetch('https://' + inst + '/api/v1/lists' + (id ? '/' + id : ''), {
          headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + now_userconf['token']
          },
          method: method,
          body: JSON.stringify({ title: repcom })
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw response;
            }
          })
          .then(json => {
            renderListsCollection();
            if (is_page) showList(id, repcom);
          })
          .catch(error => {
            catchHttpErr('editList', error);
          });
      }
    });
}

function deleteList(id, title, is_page) {
  ons.notification
    .confirm(dialog_i18n('deletelist', 1) + '<br>(' + title + ')', {
      title: dialog_i18n('deletelist'),
      modifier: 'material',
      cancelable: true
    })
    .then(e => {
      if (e === 1) {
        Fetch('https://' + inst + '/api/v1/lists/' + id, {
          headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + now_userconf['token']
          },
          method: 'DELETE'
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw response;
            }
          })
          .then(json => {
            renderListsCollection();
            if (is_page) BackTab();
          })
          .catch(error => {
            catchHttpErr('delList', error);
          });
      }
    });
}

function showList(id, title) {
  list('timelines/list/' + id, 'List:' + title, null, 'toot', true);
  setTimeout(() => {
    elemId('olist_right').innerHTML =
      '<ons-toolbar-button onclick="listMore(\'' +
      id +
      "', '" +
      title +
      '\', 1)" class="toolbar-button">\n' +
      '<ons-icon icon=\'fa-cogs\' class="ons-icon fa-cogs fa"></ons-icon>\n' +
      '</ons-toolbar-button>';
  }, 100);
}

function SearchListKey() {
  if (window.event.keyCode == 13) SearchListLoad();
}

function openListB(id, mode) {
  list(
    'statuses/' + id + '/' + (mode ? 'favourited' : 'reblogged') + '_by',
    'toot.' + (mode ? 'fav' : 'boost') + '.user',
    null,
    'acct',
    true
  );
}
