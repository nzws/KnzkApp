function tutorial_open() {
  if (instance_config[inst]['enquete'])
    $('#vote_bt_tutorial').removeClass('invisible');
  if (instance_config[inst]['yomigana'])
    $('#yomigana_bt_tutorial').removeClass('invisible');
  if (instance_config[inst]['bbcode'])
    $('#bbcode_bt_tutorial').removeClass('invisible');
  if (instance_config[inst]['enquete_duration'])
    $('#vote_new_time_tutorial').removeClass('invisible');
  if (instance_config[inst]['glitch_soc'])
    $('#localonly_bt_tutorial').removeClass('invisible');
  if (instance_config[inst]['markdown'])
    $('#md_note_tutorial').removeClass('invisible');

  document.getElementById('tutorial_toot_TL_input').rows = 3;
  $('#tutorial_toot_TL_toolbar').addClass('simple_toot_open');
  $('#tutorial_more').removeClass('invisible');
}

function tutorial_alert(id) {
  ons.notification.alert(i18next.t('tutorial.page2.alert.' + id), {
    title: 'Tutorial',
  });
}

function tutorial_close() {
  document.getElementById('tutorial_toot_TL_input').rows = 1;
  $('#tutorial_toot_TL_toolbar').removeClass('simple_toot_open');
  $('#tutorial_more').addClass('invisible');
}

function next_tutorial() {
  var c = document.getElementById('tutorial_c');
  if (c.getActiveIndex() === 3) {
    BackTab('down');
  } else {
    c.next();
  }
}
