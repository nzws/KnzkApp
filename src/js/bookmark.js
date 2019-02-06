function LoadBookmark() {
  let reshtml = '';
  const json = loadBookmark()[inst];
  loadNav('olist_nav.html');
  if (!instance_config[inst]['glitch_soc']) {
    reshtml +=
      '<div class="toot">\n' +
      i18next.t('bookmark.note', { interpolation: { escapeValue: false } }) +
      '</div>';
  }
  if (!instance_config[inst]['glitch_soc']) {
    renderBookmark(reshtml, json, 0);
    setTimeout(() => {
      elemId('olist_right').innerHTML =
        '<ons-toolbar-button onclick="clearBookmark()" class="toolbar-button">\n' +
        '<ons-icon icon=\'fa-trash\' class="ons-icon fa-trash fa"></ons-icon>\n' +
        '</ons-toolbar-button>';
    }, 500);
  } else if (instance_config[inst]['glitch_soc']) {
    renderBookmark_glitch();
  }
  setTimeout(() => {
    elemId('olist_nav_title').innerHTML = i18next.t('bookmark.title');
  }, 500);
}

function renderBookmark_glitch() {
  Fetch('https://' + inst + '/api/v1/bookmarks', {
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
        let i = 0;
        let reshtml = '';

        while (json[i]) {
          reshtml += toot_card(json[i], 'full', null);
          i++;
        }

        elemId('olist_nav_main').innerHTML = reshtml;
      }
    })
    .catch(error => {
      catchHttpErr('show_bookmark_glitch', error);
    });
}

function renderBookmark(reshtml, json_bookmark, i) {
  if (!json_bookmark[i]) {
    setTimeout(() => {
      elemId('olist_nav_main').innerHTML = reshtml;
    }, 50);
    return;
  }
  Fetch('https://' + inst + '/api/v1/statuses/' + json_bookmark[i], {
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
      reshtml += toot_card(json, 'full', null);
      if (json_bookmark[i + 1]) {
        //次ある
        renderBookmark(reshtml, json_bookmark, i + 1);
      } else {
        elemId('olist_nav_main').innerHTML = reshtml;
      }
    })
    .catch(error => {
      reshtml +=
        '<div onclick="changeBookmark(\'' +
        json_bookmark[i] +
        '\');LoadBookmark()" class="toot acct-small"><div class="hashtag-card"><span class="toot-group"><b>' +
        i18next.t('bookmark.deleted', {
          interpolation: { escapeValue: false }
        }) +
        '</b></span></div></div>\n';
      if (json_bookmark[i + 1]) {
        //次ある
        renderBookmark(reshtml, json_bookmark, i + 1);
      } else {
        elemId('olist_nav_main').innerHTML = reshtml;
      }
    });
}

function initBookmark() {
  let bookmark = JSON.parse(localStorage.getItem('knzkapp_bookmark'));
  if (bookmark == undefined) {
    localStorage.setItem('knzkapp_bookmark', JSON.stringify({}));
    bookmark = JSON.parse(localStorage.getItem('knzkapp_bookmark'));
  }
  if (!bookmark[inst]) {
    bookmark[inst] = [];
    localStorage.setItem('knzkapp_bookmark', JSON.stringify(bookmark));
  }
}

function changeBookmark(id) {
  if (!instance_config[inst]['glitch_soc']) {
    const json = loadBookmark();
    if (checkBookmark(id)) {
      //削除
      json[inst].splice(json[inst].indexOf(id), 1);
    } else {
      //追加
      json[inst].unshift('' + id);
    }
    saveBookmark(json);
  } else {
    const bookmark_mode = tl_postdata[id]['bookmarked']
      ? '/unbookmark'
      : '/bookmark';
    Fetch('https://' + inst + '/api/v1/statuses/' + id + bookmark_mode, {
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
        if (json['id']) {
          tl_postdata[json['id']] = json;
          showtoast('ok_conf_2');
        }
      })
      .catch(error => {
        catchHttpErr('bookmark_glitch', error);
      });
  }
}

function checkBookmark(id) {
  //ブックマークされて無ければfalse
  if (!instance_config[inst]['glitch_soc']) {
    const json = loadBookmark();
    return json[inst].indexOf('' + id) !== -1;
  } else {
    return tl_postdata[id]['bookmarked'];
  }
}

function loadBookmark() {
  return JSON.parse(localStorage.getItem('knzkapp_bookmark'));
}

function saveBookmark(json, force) {
  localStorage.setItem('knzkapp_bookmark', JSON.stringify(json));
  if (!force) showtoast('ok_conf_2');
}

function clearBookmark() {
  if (!instance_config[inst]['glitch_soc']) {
    ons.notification
      .confirm(
        i18next.t('bookmark.clear.text', {
          inst: inst,
          interpolation: { escapeValue: false }
        }),
        { title: i18next.t('bookmark.clear.title'), modifier: 'material' }
      )
      .then(e => {
        if (e === 1) {
          const bookmark = loadBookmark();
          bookmark[inst] = [];
          saveBookmark(bookmark);
          BackTab();
        }
      });
  } else {
    ons.notification.alert(
      'Glitch-socブックマークでは全削除を行う事ができません。',
      {
        title: 'ブックマーク全削除',
        modifier: 'material'
      }
    );
  }
}

function clearAllBookmark() {
  ons.notification
    .confirm(dialog_i18n('clear_bookmark', 1), {
      title: dialog_i18n('clear_bookmark'),
      modifier: 'material',
      cancelable: true
    })
    .then(e => {
      if (e === 1) {
        const bookmark = {};
        bookmark[inst] = [];
        saveBookmark(bookmark);
        ons.notification.toast(i18next.t('dialogs_js.clear_done'));
      }
    });
}

function migration_app2glitch() {
  if (instance_config[inst]['glitch_soc']) {
    const json = loadBookmark();
    if (json[inst][0]) {
      let i = 0;
      while (json[inst][i]) {
        Fetch(
          'https://' + inst + '/api/v1/statuses/' + json[inst][i] + '/bookmark',
          {
            headers: {
              'content-type': 'application/json',
              Authorization: 'Bearer ' + now_userconf['token']
            },
            method: 'POST'
          }
        )
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw response;
            }
          })
          .then(data => {
            const id = json[inst].indexOf('' + data['id']);
            if (!json[inst][id + 1]) {
              json[inst] = [];
              saveBookmark(json, true);
              // eslint-disable-next-line no-console
              console.log('Complete:app2glitch migration');
            }
          })
          .catch(error => {
            catchHttpErr('bookmark_app2glitch', error);
          });
        i++;
      }
    }
  }
}
