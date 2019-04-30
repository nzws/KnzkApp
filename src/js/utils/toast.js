import ons from 'onsenui';
import locale from '../locale';

export default i18nId => {
  return ons.notification.toast(locale.t(i18nId), { timeout: 2000 });
};
