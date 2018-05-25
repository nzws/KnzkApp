function LoadBookmark() {
  var reshtml = '',
    json = loadBookmark()[inst];
  loadNav('olist_nav.html');
  if (!instance_config[inst]['glitch_soc']) {
    reshtml +=
      '<div class="toot">\n' +
      'ブックマークはKnzkApp独自の機能で、データが端末内に保管されます。<br>ブックマークはインスタンスごとに区別されます。\n' +
      '</div>';
  }
  if (json[0] && !instance_config[inst]['glitch_soc']) {
    renderBookmark(reshtml, json, 0);
  } else if (instance_config[inst]['glitch_soc']) {
    renderBookmark_glitch();
  } else {
    setTimeout(function() {
      document.getElementById('olist_nav_title').innerHTML = 'ブックマーク';
      document.getElementById('olist_nav_main').innerHTML = reshtml;
    }, 1000);
  }
}

function renderBookmark_glitch() {
  Fetch('https://' + inst + '/api/v1/bookmarks', {
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
        sendLog('Error/show_bookmark_glitch', response.json);
        showtoast('cannot-pros');
      }
    })
    .then(function(json) {
      if (json) {
        var i = 0,
          reshtml = '';

        while (json[i]) {
          reshtml += toot_card(json[i], 'full', null);
          i++;
        }

        document.getElementById('olist_nav_main').innerHTML = reshtml;
        document.getElementById('olist_nav_title').innerHTML = 'ブックマーク';
      }
    });
}

function renderBookmark(reshtml, json_bookmark, i) {
  Fetch('https://' + inst + '/api/v1/statuses/' + json_bookmark[i], {
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
        sendLog('Error/show_bookmark', response.json);
        showtoast('cannot-pros');
      }
    })
    .then(function(json) {
      reshtml += toot_card(json, 'full', null);
      if (!json_bookmark[i + 1]) {
        document.getElementById('olist_nav_title').innerHTML = 'ブックマーク';
        document.getElementById('olist_nav_main').innerHTML = reshtml;
        document.getElementById('olist_right').innerHTML =
          '<ons-toolbar-button onclick="clearBookmark()" class="toolbar-button">\n' +
          '<ons-icon icon=\'fa-trash\' class="ons-icon fa-trash fa"></ons-icon>\n' +
          '</ons-toolbar-button>';
      } else {
        //次ある
        renderBookmark(reshtml, json_bookmark, i + 1);
      }
    });
}

function initBookmark() {
  var bookmark = JSON.parse(localStorage.getItem('knzkapp_bookmark'));
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
    var json = loadBookmark();
    if (checkBookmark(id)) {
      //削除
      json[inst].splice(json[inst].indexOf(id), 1);
    } else {
      //追加
      json[inst].unshift('' + id);
    }
    saveBookmark(json);
  } else {
    var bookmark_mode = tl_postdata[id]['bookmarked']
      ? '/unbookmark'
      : '/bookmark';
    Fetch('https://' + inst + '/api/v1/statuses/' + id + bookmark_mode, {
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
          sendLog('Error/bookmark_glitch', response.json);
          showtoast('cannot-pros');
        }
      })
      .then(function(json) {
        if (json['id']) {
          tl_postdata[json['id']] = json;
          showtoast('ok_conf_2');
        }
      });
  }
}

function checkBookmark(id) {
  //ブックマークされて無ければfalse
  if (!instance_config[inst]['glitch_soc']) {
    var json = loadBookmark();
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
        '本当に削除しますか？<br>※' +
          inst +
          'のアカウントのブックマークが対象です。',
        { title: 'ブックマーク全削除' }
      )
      .then(function(e) {
        if (e === 1) {
          var bookmark = loadBookmark();
          bookmark[inst] = [];
          saveBookmark(bookmark);
          BackTab();
        }
      });
  } else {
    ons.notification.alert(
      'Glitch-socブックマークでは全削除を行う事ができません。',
      { title: 'ブックマーク全削除' }
    );
  }
}

function clearAllBookmark() {
  ons.notification
    .confirm(
      '本当に「(あなたがログインしている全てのアカウントの)全てのブックマーク」を削除しますか？<br>※Glitch-socインスタンスを除きます。',
      { title: 'ブックマーク全削除' }
    )
    .then(function(e) {
      if (e === 1) {
        ons.notification
          .confirm(
            'もう一度聞きます。<br>本当に「(あなたがログインしている全てのアカウントの)全てのブックマーク」を削除しますか？',
            { title: 'ブックマーク全削除' }
          )
          .then(function(e) {
            if (e === 1) {
              var bookmark = {};
              bookmark[inst] = [];
              saveBookmark(bookmark);
            }
          });
      }
    });
}

function migration_app2glitch() {
  if (instance_config[inst]['glitch_soc']) {
    var json = loadBookmark();
    if (json[inst][0]) {
      var i = 0;
      while (json[inst][i]) {
        Fetch(
          'https://' + inst + '/api/v1/statuses/' + json[inst][i] + '/bookmark',
          {
            headers: {
              'content-type': 'application/json',
              Authorization: 'Bearer ' + now_userconf['token'],
            },
            method: 'POST',
          }
        )
          .then(function(response) {
            if (response.ok) {
              return response.json();
            } else {
              sendLog('Error/bookmark_glitch', response.json);
              showtoast('cannot-pros');
            }
          })
          .then(function(data) {
            var id = json[inst].indexOf('' + data['id']);
            if (!json[inst][id + 1]) {
              json[inst] = [];
              saveBookmark(json, true);
              console.log('Complete:app2glitch migration');
            }
          });
        i++;
      }
    }
  }
}
