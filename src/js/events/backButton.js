import kit from '../components/kanzakit';
import page from '../utils/page';

import onsDialogDetector from '../utils/onsDialogDetector';

export default () => {
  const dialog = onsDialogDetector();
  if (dialog) {
    dialog.hide();
    return;
  }

  if (page.getTopPageId() === 'timeline') {
    if (kit.elemId('simple_toot_TL_input').rows === 3) {
      simple_close();
    } else {
      // Exit App
      navigator.app.exitApp();
    }
  } else {
    page.back();
  }
};
