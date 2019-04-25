const kit = require('./kanzakit');

class page {
  static open(name, options = { animation: 'slide' }) {
    return kit.elemId('navigator').pushPage(name, options);
  }

  static back(options = { animation: 'slide' }) {
    return kit.elemId('navigator').popPage(options);
  }

  static reset(name) {
    return setTimeout(() => kit.elemId('navigator').resetToPage(name), 0);
  }
}

module.exports = page;
