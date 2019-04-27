const kit = require('../components/kanzakit');

module.exports = () => {
  return (
    detect(kit.elem('ons-alert-dialog'), true) ||
    detect(kit.elem('ons-popover')) ||
    detect(kit.elem('ons-action-sheet'))
  );
};

const detect = (elements, isCheckCancelable = false) => {
  return elements
    ? Object.keys(elements).forEach(element => {
        if (element.visible && (!isCheckCancelable || element.cancelable)) {
          return element;
        }
      })
    : null;
};
