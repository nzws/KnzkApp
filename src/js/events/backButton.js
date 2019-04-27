const kit = require('../components/kanzakit');
const page = require('../utils/page');

module.exports = () => {
  const dialog = isOpenAnyDialogs();
  if (dialog) {
    dialog.hide();
  } else {
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
  }
};
