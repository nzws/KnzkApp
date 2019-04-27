import $ from 'jquery/dist/jquery.slim';
window.$ = $;
import ons from 'onsenui';
window.ons = ons;

import '../scss/index.scss';

window.knzk = {
  bootstrap: require('./bootstrap'),
  page: {
    login: require('./page/login')
  },
  utils: {
    openLink: require('./utils/openLink'),
    page: require('./utils/page')
  }
};

ons.ready(() => {
  knzk.bootstrap();
});
