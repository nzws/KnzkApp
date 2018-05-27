function SearchKey() {
  if (window.event.keyCode == 13) SearchLoad();
}

function SearchLoad() {
  loadNav('olist_nav.html');
  var q = escapeHTML(document.getElementById('nav-search').value);
  Fetch('https://' + inst + '/api/v1/search?q=' + q, {
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
        sendLog('Error/Search', response.json);
        throw new Error();
      }
    })
    .then(function(json) {
      var reshtml = '',
        i = 0;
      document.getElementById('olist_nav_title').innerHTML = i18next.t(
        'search.result',
        { text: q }
      );
      reshtml +=
        '<ons-list><ons-list-header>' +
        i18next.t('search.accts') +
        '</ons-list-header></ons-list>';
      while (json['accounts'][i]) {
        if (!json['accounts'][i]['display_name'])
          json['accounts'][i]['display_name'] = json['accounts'][i]['username'];
        reshtml += AccountCard(json['accounts'][i]);
        i++;
      }

      i = 0;
      reshtml +=
        '<ons-list><ons-list-header>' +
        i18next.t('search.tags') +
        '</ons-list-header></ons-list>';
      while (json['hashtags'][i]) {
        reshtml +=
          '<div onclick=\'showTagTL("' +
          json['hashtags'][i] +
          '")\' class="toot acct-small">\n' +
          '    <div class="hashtag-card">\n' +
          '    <span class="toot-group">\n' +
          '      <b>#' +
          json['hashtags'][i] +
          '</b>\n' +
          '    </span>\n' +
          '    </div>\n' +
          '</div>';
        i++;
      }

      i = 0;
      reshtml +=
        '<ons-list><ons-list-header>' +
        i18next.t('search.toots') +
        '</ons-list-header></ons-list>';
      while (json['statuses'][i]) {
        reshtml += toot_card(json['statuses'][i], 'full');
        i++;
      }

      document.getElementById('olist_nav_main').innerHTML = reshtml;
    })
    .catch(function(error) {
      showtoast('cannot-pros');
      console.log(error);
    });
}
