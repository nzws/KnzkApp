const kit = require('../components/kanzakit');
const page = require('../utils/page');
const onsDialogDetector = require('../utils/onsDialogDetector');

module.exports = () => {
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
