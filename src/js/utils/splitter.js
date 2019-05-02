import kit from '../components/kanzakit';
import locale from '../locale';

export default {
  open() {
    return kit
      .elemId('menu')
      .open()
      .then(() => locale.localize());
  },
  close() {
    return kit.elemId('menu').close();
  },
  enableSwipeAble() {
    return kit.elemId('menu').setAttribute('swipeable', '1');
  },
  disableSwipeAble() {
    return kit.elemId('menu').removeAttribute('swipeable');
  }
};
