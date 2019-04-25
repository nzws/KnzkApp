const languages = {
  ja: '日本語',
  en: 'English'
};
const browserLangs =
  window.navigator.languages || window.navigator.browserLanguages;

const i18next = require('i18next');
const jqueryI18next = require('jquery-i18next');

class locale {
  static load() {
    return new Promise(resolve => {
      let language = '';
      browserLangs.forEach(lang => {
        if (lang.split('-').length >= 2) lang = lang.split('-')[0];

        if (languages[lang]) {
          language = lang;
        }
      });

      if (!language) language = 'en';
      if (knzk.conf.language) language = knzk.conf.language;

      i18next
        .init({
          lng: language,
          debug: !!knzk.conf.is_debug,
          resources: {
            en: {
              translation: require('../../locales/en.json')
            },
            ja: {
              translation: require('../../locales/ja.json')
            }
          }
        })
        .then(() => {
          jqueryI18next.init(i18next, $);
          $('[data-i18n]').localize();
          resolve();
        });
    });
  }

  static localize() {
    return $('[data-i18n]').localize();
  }

  static t(id) {
    return i18next.t(id, {
      interpolation: { escapeValue: false }
    });
  }

  static dialog(id, type) {
    return locale.t(`dialogs_js.${id}${type ? '.text' : '.title'}`);
  }
}

module.exports = locale;
