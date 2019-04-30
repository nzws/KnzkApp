import kit from '../components/kanzakit';

const detect = (elements, isCheckCancelable = false) => {
  for (let element of elements) {
    if (element.visible && (!isCheckCancelable || element.cancelable)) {
      return element;
    }
  }
  return null;
};

export default () => {
  return (
    detect(kit.elem('ons-alert-dialog'), true) ||
    detect(kit.elem('ons-popover')) ||
    detect(kit.elem('ons-action-sheet'))
  );
};
