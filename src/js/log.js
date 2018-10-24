function getError(name, log, mode) {
  if (typeof obj === 'string') {
    log['response'] = log;
    log['alert'] = '';
  } else {
    if (!log['response']) {
      log['response'] = log;
      log['alert'] = '';
    }
  }
  if (!mode) showtoast('cannot-pros');
  if (getConfig(1, 'SendLog') === '1') {
    console.log('ログ送信');
    if (Raven.isSetup()) {
      Raven.captureMessage(new Error(name), {
        extra: {
          Response: log['response'],
          Alert: log['alert'],
        },
        tags: {
          version: app_version,
          userAgent: navigator.userAgent,
        },
      });
    }
  }
  if (is_debug) {
    ons.notification.alert('<pre>' + log + '</pre>', { title: 'log', modifier: 'material' });
  }
}

function Seterrorlog(id, text, data) {
  if (data) {
    elemId(id).innerHTML = JSON.stringify(text);
  } else {
    elemId(id).innerHTML = text;
  }
}

function catchHttpErr(name, response) {
  try {
    response.json().then(function(json) {
      errorAlert = '<b>Error' + response.status + '!</b>';
      if (json) {
        errorAlert += json.error ? '<br>' + json.error : '';
        getError('Error/' + name, { response: response, alert: errorAlert }, 1);
      }
      elemId('error_alert_text').innerHTML = errorAlert;
      showtoast('error_alert');
      if (!json) throw Error;
    });
  } catch (e) {
    getError('Error/' + name, { response: response, alert: 'none' });
  }
}
