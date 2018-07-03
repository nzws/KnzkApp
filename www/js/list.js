function list(mode, title, more_load, mode_toot, navmode) {
  if (navmode === true) {
    $.when(
      document.querySelector('#navigator').bringPageTop('olist_nav.html', { animation: 'slide' })
    ).done(function() {
      list_n(mode, title, more_load, mode_toot, true);
    });
  } else {
    var menu = document.getElementById('splitter-menu');
    $.when(
      document
        .querySelector('#navigator')
        .resetToPage('olist.html', { animation: 'none' })
        .then(menu.close.bind(menu))
    ).done(function() {
      list_n(mode, title, more_load, mode_toot);
    });
  }
}

function list_n(mode, title, more_load, mode_toot, navmode) {
  var i = 0,
    reshtml = '',
    get = '',
    pin;
  var id_title, id_main;
  if (more_load) {
    get = '?' + list_old_id[0];
    more_load.value = 'Loading now...';
    more_load.disabled = true;
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
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200 || xhr.status === 304) {
        var json = JSON.parse(xhr.responseText);
        if (more_load) {
          more_load.className = 'button button--large--quiet invisible';
          reshtml = document.getElementById(id_main).innerHTML;
        } else {
          document.getElementById(id_title).innerHTML = title.match(/\./i)
            ? i18next.t(title)
            : title;
        }

        while (json[i]) {
          if (mode_toot === 'toot') {
            reshtml += toot_card(json[i], 'full', null);
          } else if (mode_toot === 'acct') {
            if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];

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

        if (pin === true) mode = 'pin';
        if (list_old_id !== '')
          reshtml +=
            "<button class='button button--large--quiet' onclick='list_n(\"" +
            mode +
            '", "' +
            title +
            '", this, "' +
            mode_toot +
            '", ' +
            navmode +
            ")'>" +
            i18next.t('navigation.load_more') +
            '</button>';
        document.getElementById(id_main).innerHTML = reshtml;
        return true;
      } else {
        showtoast('cannot-load');
        return false;
      }
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
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: 'POST',
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(function(json) {
      showtoast('ok_conf_2');
      list_n('follow_requests', 'navigation.follow_req', null, 'acct', true);
    })
    .catch(function(error) {
      error.text().then(errorMessage => {
        sendLog('Error/followreq', errorMessage);
      });
      list_n('follow_requests', 'navigation.follow_req', null, 'acct', true);
    });
}

function LoadrepStatus() {
  var i = 0,
    reshtml = '',
    repstatus = [];
  loadNav('olist_nav.html');
  Fetch('https://' + inst + '/api/v1/reports', {
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
        throw response;
      }
    })
    .then(function(json) {
      json.sort(function(a, b) {
        let t = 0,
          a_ = parseInt(a.id),
          b_ = parseInt(b.id);

        if (a_ < b_) t = 1;
        if (a_ > b_) t = -1;

        return t;
      });
      reshtml += '<div class="toot">\n' + i18next.t('report_status_note') + '</div>\n';
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
      document.getElementById('olist_nav_title').innerHTML = i18next.t('navigation.report_status');
      document.getElementById('olist_nav_main').innerHTML = reshtml;
    })
    .catch(function(error) {
      error.text().then(errorMessage => {
        sendLog('Error/loadRepStatus', errorMessage);
      });
    });
}

function renderListsCollection(isEdit) {
  if (isEdit) {
    editing_id = isEdit;
    loadNav('lists_people.html');
  }
  Fetch('https://' + inst + '/api/v1/lists' + (isEdit ? '/' + isEdit + '/accounts' : ''), {
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
        throw response;
      }
    })
    .then(function(json) {
      if (json) {
        var i = 0,
          buf = '';
        while (json[i]) {
          if (isEdit) {
            if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];
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
        document.getElementById(isEdit ? 'people-list' : 'lists-list').innerHTML = buf;
      }
    })
    .catch(error => {
      error.text().then(errorMessage => {
        sendLog('Error/render_lists', errorMessage);
      });
    });
}

function addAccountToList(id, isDelete) {
  Fetch('https://' + inst + '/api/v1/lists/' + editing_id + '/accounts', {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token'],
    },
    method: isDelete ? 'DELETE' : 'POST',
    body: JSON.stringify({ account_ids: [id] }),
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(function(json) {
      showtoast('ok_conf');
      renderListsCollection(editing_id);
    })
    .catch(function(error) {
      error.text().then(errorMessage => {
        sendLog('Error/AddToList', errorMessage);
      });
    });
}

function SearchListLoad() {
  var q = escapeHTML(document.getElementById('List-search').value);
  Fetch('https://' + inst + '/api/v1/accounts/search?q=' + q + '&resolve=false&following=true', {
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
        throw response;
      }
    })
    .then(function(json) {
      var reshtml = '',
        i = 0;
      reshtml +=
        '<ons-list-item tappable="" onclick="closeSearchList()" class="list-item">' +
        '<label class="left music-item list-item__left"><i class="list-item__icon list-item--chevron__icon ons-icon fa-times fa fa-fw"></i></label>' +
        '<div class="center music-item list-item__center">' +
        i18next.t('navigation.close') +
        '</div></ons-list-item>';
      while (json[i]) {
        if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];
        reshtml += AccountCard(json[i], 'addList');
        i++;
      }

      document.getElementById('searchpeople-list').innerHTML = reshtml;
    })
    .catch(function(error) {
      error.text().then(errorMessage => {
        sendLog('Error/SearchList', errorMessage);
      });
    });
}

function closeSearchList() {
  renderListsCollection(editing_id);
  document.getElementById('searchpeople-list').innerHTML = '';
}

function listMore(id, title) {
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
          icon: 'md-close',
        },
      ],
    })
    .then(function(index) {
      if (index === 0) editList(id, title);
      else if (index === 1) renderListsCollection(id);
      else if (index === 2) deleteList(id, title);
      else if (index === 3) editTLConfAdd('list:' + id);
    });
}

function editList(id, title) {
  var method = id ? 'PUT' : 'POST';
  ons.notification
    .prompt(dialog_i18n('editlist', 1), {
      title: dialog_i18n('editlist'),
      defaultValue: title ? title : '',
    })
    .then(function(repcom) {
      if (repcom) {
        Fetch('https://' + inst + '/api/v1/lists' + (id ? '/' + id : ''), {
          headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + now_userconf['token'],
          },
          method: method,
          body: JSON.stringify({ title: repcom }),
        })
          .then(function(response) {
            if (response.ok) {
              return response.json();
            } else {
              throw response;
            }
          })
          .then(function(json) {
            renderListsCollection();
          })
          .catch(error => {
            error.text().then(errorMessage => {
              sendLog('Error/edit_list', errorMessage);
            });
          });
      }
    });
}

function deleteList(id, title) {
  ons.notification
    .confirm(dialog_i18n('deletelist', 1) + '<br>(' + title + ')', {
      title: dialog_i18n('deletelist'),
    })
    .then(function(e) {
      if (e === 1) {
        Fetch('https://' + inst + '/api/v1/lists/' + id, {
          headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + now_userconf['token'],
          },
          method: 'DELETE',
        })
          .then(function(response) {
            if (response.ok) {
              return response.json();
            } else {
              throw response;
            }
          })
          .then(function(json) {
            renderListsCollection();
          })
          .catch(error => {
            error.text().then(errorMessage => {
              sendLog('Error/del_list', errorMessage);
            });
          });
      }
    });
}

function showList(id, title) {
  list('timelines/list/' + id, 'List:' + title, null, 'toot', true);
  setTimeout(function() {
    document.getElementById('olist_right').innerHTML =
      '<ons-toolbar-button onclick="loadNav(\'lists.html\')" class="toolbar-button">\n' +
      '<ons-icon icon=\'fa-cogs\' class="ons-icon fa-cogs fa"></ons-icon>\n' +
      '</ons-toolbar-button>';
  }, 100);
}

function SearchListKey() {
  if (window.event.keyCode == 13) SearchListLoad();
}
