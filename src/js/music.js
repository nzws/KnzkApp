function radio_set(num = audio_playing, force) {
  const audioElem = elemId('music-control'),
    radioTitle = elemId('music_title');
  if (radios[num]) {
    audio_playing = num;
    if (isPlaying() || force) {
      audioElem.src = radios[num]['url'];
      radioTitle.innerText = radios[num]['name'];
      audioElem.play();
    }
  } else {
    audioElem.pause();
    audioElem.src = '';
    radioTitle.innerText = 'Not Playing';
  }
}

function radioToggle() {
  const audioElem = elemId('music-control'),
    audioButton = elemId('music-button'),
    ButtonBase = 'list-item__icon ons-icon fa fa-fw fa-';
  if (isPlaying()) {
    //停止
    radio_set(9999);
    audioButton.className = ButtonBase + 'play';
  } else {
    //再生
    radio_set(audio_playing, 1);
    audioElem.play();
    audioButton.className = ButtonBase + 'stop';
  }
}

function isPlaying() {
  return elemId('music-button').className === 'list-item__icon ons-icon fa fa-fw fa-stop';
}

function generateRadio() {
  const list = elemId('radio_list');
  if (list.innerHTML) return;
  var i = 0,
    reshtml = '',
    BoxData = {};
  while (radios[i]) {
    BoxData = {
      num: i,
      name: radios[i]['name'],
      sub: radios[i]['sub'],
      isDefault: i === 0 ? 1 : 0,
    };
    reshtml += tmpl('radio_tmpl', BoxData);
    i++;
  }
  list.innerHTML = reshtml;
}

function music_change() {
  var list = elemId('music-form');
  var menu = elemId('menu-list');
  var account_list = elemId('account-list');
  if (list.style.display === 'none') {
    generateRadio();
    list.style.display = 'block';
    menu.style.display = 'none';
    account_list.style.display = 'none';
  } else {
    list.style.display = 'none';
    account_list.style.display = 'none';
    menu.style.display = 'block';
  }
}
