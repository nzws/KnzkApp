import kit from '../components/kanzakit';

const detect = (elements, isCheckCancelable = false) => {
  return elements
    ? Object.keys(elements).forEach(element => {
        if (element.visible && (!isCheckCancelable || element.cancelable)) {
          return element;
        }
      })
    : null;
};

export default () => {
  return (
    detect(kit.elem('ons-alert-dialog'), true) ||
    detect(kit.elem('ons-popover')) ||
    detect(kit.elem('ons-action-sheet'))
  );
};
