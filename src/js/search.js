function SearchKey() {
  if (window.event.keyCode == 13) SearchLoad();
}

function SearchLoad() {
  loadNav('olist_nav.html');
  var q = escapeHTML(elemId('nav-search').value);
  Fetch('https://' + inst + '/api/v2/search?q=' + q, {
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
      elemId('olist_nav_title').innerHTML = i18next.t('search.result', {
        text: q,
      });
      reshtml +=
        '<ons-list><ons-list-header>' + i18next.t('search.accts') + '</ons-list-header></ons-list>';
      while (json['accounts'][i]) {
        if (!json['accounts'][i]['display_name'])
          json['accounts'][i]['display_name'] = json['accounts'][i]['username'];
        reshtml += AccountCard(json['accounts'][i]);
        i++;
      }

      i = 0;
      reshtml +=
        '<ons-list><ons-list-header>' + i18next.t('search.tags') + '</ons-list-header></ons-list>';
      while (json['hashtags'][i]) {
        reshtml +=
          '<ons-list-item onclick=\'showTagTL("' +
          json['hashtags'][i]['name'] +
          '")\'><div class="center trend_item">' +
          '<span class="list-item__title">#' +
          json['hashtags'][i]['name'] +
          '</span>' +
          '<span class="list-item__subtitle">' +
          i18next.t('navigation.trend.talking', {
            accounts: json['hashtags'][i]['history'][0]['accounts'],
          }) +
          '</span></div>' +
          '<div class="right trend_item"><h1>' +
          json['hashtags'][i]['history'][0]['uses'] +
          '</h1></div></ons-list-item>';
        i++;
      }

      i = 0;
      reshtml +=
        '<ons-list><ons-list-header>' + i18next.t('search.toots') + '</ons-list-header></ons-list>';
      while (json['statuses'][i]) {
        reshtml += toot_card(json['statuses'][i], 'full');
        i++;
      }

      elemId('olist_nav_main').innerHTML = reshtml;
    })
    .catch(function(error) {
      catchHttpErr('search', error);
    });
}
