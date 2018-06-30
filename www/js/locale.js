const languages = {
  ja: '日本語',
  en: 'English',
};

function i18n_init() {
  try {
    navigator.globalization.getPreferredLanguage(
      function(language) {
        lng = language.value;
        if (lng.split('-').length == 2) lng = lng.split('-')[0];
        if (!languages[lng]) lng = 'en';
        i18n_init_callback(lng);
      },
      function() {
        i18n_init_callback('en');
      }
    );
  } catch (e) {
    i18n_init_callback('en');
  }
}

function i18n_init_callback(lang) {
  i18next.use(i18nextXHRBackend).init(
    {
      lng: lang,
      backend: {
        loadPath: `./locales/${lang}.json`,
      },
    },
    function(err, t) {
      console.log('lang:' + lang);
      jqueryI18next.init(i18next, $);
      $('[data-i18n]').localize();
    }
  );
}

function dialog_i18n(id, m) {
  var mode = m ? '.text' : '.title';
  return i18next.t('dialogs_js.' + id + mode, {
    interpolation: { escapeValue: false },
  });
}
