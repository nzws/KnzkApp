function getError(name, log, mode) {
  if (!mode) showtoast('cannot-pros');
  if (getConfig(1, 'SendLog') === '1') {
    console.log('ログ送信');
    if (Raven.isSetup()) {
      Raven.captureMessage(new Error(name), {
        extra: {
          Response: log,
        },
        tags: {
          version: version,
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
