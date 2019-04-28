/*
  Kanzaki(@knzkoniisan) + Kit + JavaScript = KanzaKit.js
*/

export default {
  elemId(_id) {
    return document.getElementById(_id);
  },
  elem(_selector) {
    return document.querySelectorAll(_selector);
  },
  escape(text) {
    try {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  randInt(min = 0, max = 100) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  },
  elemRemove(element) {
    return element ? element.parentNode.removeChild(element) : false;
  },
  search(base, searchtext) {
    return base && base.includes(searchtext);
  }
};
