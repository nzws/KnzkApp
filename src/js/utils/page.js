import kit from '../components/kanzakit';
import locale from '../locale';

export default {
  open(name, options = { animation: 'slide' }) {
    return kit
      .elemId('navigator')
      .pushPage(name, options)
      .then(() => locale.localize());
  },
  back(options = { animation: 'slide' }) {
    return kit.elemId('navigator').popPage(options);
  },
  reset(name) {
    return setTimeout(
      () =>
        kit
          .elemId('navigator')
          .resetToPage(name)
          .then(() => locale.localize()),
      0
    );
  },
  getTopPageId() {
    return kit.elemId('navigator').topPage.dataset.pageid;
  }
};
