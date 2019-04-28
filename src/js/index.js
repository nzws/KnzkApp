import $ from 'jquery/dist/jquery.slim';
window.$ = $;
import ons from 'onsenui';
window.ons = ons;
import '../scss/index.scss';

import bootstrap from './bootstrap';

import page_login from './page/login';

import utils_openLink from './utils/openLink';
import utils_page from './utils/page';

window.knzk = {
  bootstrap,
  page: {
    login: page_login
  },
  utils: {
    openLink: utils_openLink,
    page: utils_page
  }
};

ons.ready(() => {
  knzk.bootstrap();
});
