const languages = {
  ja: '日本語',
  en: 'English',
};

const localLang = localStorage.getItem('knzkapp_language');

const i18n_init = () =>
  new Promise((resolve, reject) => {
    if (localLang) {
      i18n_init_callback(localLang, resolve);
    } else {
      try {
        navigator.globalization.getPreferredLanguage(
          function(language) {
            lng = language.value;
            if (lng.split('-').length == 2) lng = lng.split('-')[0];
            if (!languages[lng]) lng = 'en';
            i18n_init_callback(lng, resolve);
          },
          function() {
            i18n_init_callback('en', resolve);
          }
        );
      } catch (e) {
        i18n_init_callback('en', resolve);
      }
    }
  });

function i18n_init_callback(lang, resolve) {
  i18next.use(i18nextXHRBackend).init(
    {
      lng: lang,
      backend: {
        loadPath: `./locales/${lang}.json`,
      },
    },
    function(err, t) {
      lng = lang;
      console.log('lang:' + lang);
      jqueryI18next.init(i18next, $);
      $('[data-i18n]').localize();
      resolve();
    }
  );
}

function dialog_i18n(id, m) {
  var mode = m ? '.text' : '.title';
  return i18next.t('dialogs_js.' + id + mode, {
    interpolation: { escapeValue: false },
  });
}

function changeLanguage(v) {
  localStorage.setItem('knzkapp_language', v);
}
