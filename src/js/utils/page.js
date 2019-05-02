import kit from '../components/kanzakit';
import pageEvent from '../events/page';

export default {
  getNavigatorElement: () => kit.elemId('navigator'),
  open(name, options = { animation: 'slide' }) {
    return this.getNavigatorElement()
      .pushPage(name, options)
      .then(() => pageEvent());
  },
  back(options = { animation: 'slide' }) {
    return this.getNavigatorElement().popPage(options);
  },
  reset(name) {
    return setTimeout(
      () =>
        this.getNavigatorElement()
          .resetToPage(name)
          .then(() => pageEvent()),
      0
    );
  },
  getTopPageId() {
    return this.getNavigatorElement().topPage.dataset.pageid;
  }
};
