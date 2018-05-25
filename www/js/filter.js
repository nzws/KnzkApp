function createFilter() {
  var conf = $("[id^='filter_']"),
    i = 0,
    config = {},
    id = escapeHTML(
      document.getElementById('userid_filter').value
    ).toLowerCase();
  if (!id) return;
  if (id.indexOf('@') === -1) id += '@' + inst;
  while (conf[i]) {
    config[conf[i].id.replace('filter_', '')] = conf[i].checked;
    i++;
  }

  conf = $("[id^='filterpush_']");
  i = 0;
  var config_n = getConfig(5, 'notification');
  if (!config_n[id]) config_n[id] = {};
  while (conf[i]) {
    config_n[id][conf[i].id.replace('filterpush_', '')] = conf[i].checked;
    i++;
  }
  setConfig(5, id, config);
  setConfig(5, 'notification', config_n);
  showtoast('ok_conf');
  BackTab();
  renderFilter();
}

function renderFilter() {
  var config = getConfig_original(5);
  var reshtml = '';
  for (var key in config) {
    if (key !== 'notification') {
      reshtml +=
        '<ons-list-item>' +
        '<div class="center" onclick=\'editFilter("' +
        key +
        '")\'><span class="list-item__title">' +
        key +
        '</span></div>' +
        ' <div class="right" onclick=\'delFilter("' +
        key +
        '")\'><span class="list-item__title"><i class="list-item__icon list-item--chevron__icon ons-icon fa-trash fa fa-fw"></i></span></div>\n' +
        '</ons-list-item>\n';
    }
  }
  document.getElementById('filter_list').innerHTML = reshtml;
}

function editFilter(id) {
  var config = getConfig_original(5);
  document
    .querySelector('#navigator')
    .bringPageTop('editFilter.html')
    .then(function() {
      document.getElementById('userid_filter').value = id;
      var conf = $("[id^='filter_']"),
        i = 0;
      while (conf[i]) {
        conf[i].checked = config[id][conf[i].id.replace('filter_', '')];
        i++;
      }

      conf = $("[id^='filterpush_']");
      i = 0;
      while (conf[i]) {
        conf[i].checked =
          config['notification'][id][conf[i].id.replace('filterpush_', '')];
        i++;
      }
    });
}

function delFilter(id) {
  var config = getConfig_original(5);
  delete config[id];
  delete config['notification'][id];
  localStorage.setItem('knzkapp_conf_mastodon_filter', JSON.stringify(config));
  config_tmp[5] = null;
  showtoast('del_ok');
  renderFilter();
}
