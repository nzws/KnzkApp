import kit from '../components/kanzakit';
import page from '../utils/page';
import locale from '../locale';
import splitter from '../utils/splitter';

import timeline from './page/timeline';

export default () => {
  locale.localize();
  kit.elemId('navigator').topPage.dataset.splitterswipeable
    ? splitter.enableSwipeAble()
    : splitter.disableSwipeAble();

  switch (page.getTopPageId()) {
    case 'timeline':
      return timeline();
    default:
      return false;
  }
};
