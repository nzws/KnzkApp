import kit from '../components/kanzakit';

export default {
  open(name, options = { animation: 'slide' }) {
    return kit.elemId('navigator').pushPage(name, options);
  },
  back(options = { animation: 'slide' }) {
    return kit.elemId('navigator').popPage(options);
  },
  reset(name) {
    return setTimeout(() => kit.elemId('navigator').resetToPage(name), 0);
  },
  getTopPageId() {
    return kit.elemId('navigator').topPage.dataset.pageid;
  }
};
