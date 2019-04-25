const kit = require('./kanzakit');

class page {
  static open(name, options = { animation: 'slide' }) {
    return kit.elemId('navigator').pushPage(name, options);
  }

  static back(options = { animation: 'slide' }) {
    return kit.elemId('navigator').popPage(options);
  }
}

module.exports = page;
