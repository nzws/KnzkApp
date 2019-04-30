import ons from 'onsenui';

export default url => {
  if (ons.isWebView()) {
    SafariViewController.isAvailable(available => {
      if (available) {
        SafariViewController.show({
          url: url
        });
      } else {
        window.open(url, '_system');
      }
    });
  } else {
    window.open(url, '_blank');
  }
};
