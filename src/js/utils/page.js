const kit = require('../components/kanzakit');

const navigator = kit.elemId('navigator');

class page {
  static open(name, options = { animation: 'slide' }) {
    return navigator.pushPage(name, options);
  }

  static back(options = { animation: 'slide' }) {
    return navigator.popPage(options);
  }

  static reset(name) {
    return setTimeout(() => navigator.resetToPage(name), 0);
  }

  static getTopPageId() {
    return navigator.topPage.dataset.pageid;
  }
}

module.exports = page;
