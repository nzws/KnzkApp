/*
  Kanzaki(@knzkoniisan) + Kit + JavaScript = KanzaKit.js
*/

class kanzakit {
  static elemId(_id) {
    return document.getElementById(_id);
  }

  static elem(_selector) {
    return document.querySelectorAll(_selector);
  }

  static escape(text) {
    try {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static randInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  }

  static elemRemove(element) {
    return element ? element.parentNode.removeChild(element) : false;
  }

  static search(base, searchtext) {
    return base && base.includes(searchtext);
  }
}

module.exports = kanzakit;
