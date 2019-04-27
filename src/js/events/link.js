const openLink = require('../utils/openLink');

module.exports = event => {
  event.stopPropagation();
  event.preventDefault();

  const url = event.currentTarget.href;
  if (url === '#' || !url) {
    return;
  }

  const data = url.split('/');
  if (event.currentTarget.className === 'u-url mention') {
    show_account_name(data[data.length - 1] + '@' + data[data.length - 2]);
  } else if (event.currentTarget.className === 'mention hashtag') {
    showTagTL(data[data.length - 1]);
  } else {
    openLink(url);
  }

  return false;
};
