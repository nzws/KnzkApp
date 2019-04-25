import $ from 'jquery';
window.$ = $;
import ons from 'onsenui';
window.ons = ons;

import '../scss/index.scss';

window.knzk = {
  bootstrap: require('./bootstrap'),
  components: {
    page: require('./components/page')
  }
};

ons.ready(() => {
  knzk.bootstrap();
});
