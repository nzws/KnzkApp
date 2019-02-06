function post_cw() {
  const cw_input = elemId('cw_input');
  const cwicon = elemId('cw_bt');

  if (cw_input.style.display == 'block') {
    //CW オン→オフ
    cw_input.style.display = 'none';
    cw_input.value = '';
    cwicon.className = quiet;
  } else {
    //CW オフ→オン
    cw_input.style.display = 'block';
    cwicon.className = button;
  }
}

function post_vote() {
  const cw_input = elemId('vote_new_list');
  const cwicon = elemId('vote_bt');

  if (cw_input.style.display == 'block') {
    //vote オン→オフ
    cw_input.style.display = 'none';
    elemId('vote_new_1').value = '';
    elemId('vote_new_2').value = '';
    elemId('vote_new_3').value = '';
    elemId('vote_new_4').value = '';
    elemId('vote_new_time').value = '30';
    cwicon.className = quiet;
  } else {
    //vote オフ→オン
    cw_input.style.display = 'block';
    cwicon.className = button;
  }
}

function up_file(simple, isInput) {
  let simple_id = '';
  if (simple) image_mode = simple_id = '_simple';
  else image_mode = simple_id = '';
  const card = document.getElementsByClassName('media-upload' + simple_id);
  if (card.length >= 4) {
    showtoast('maximum-media');
  } else {
    if (isInput) {
      const files = elemId('post_file' + simple_id).files;
      if (card.length + files.length > 4) {
        showtoast('maximum-media');
      } else {
        let i = 0;
        const images = [];
        while (files[i]) {
          const reader = new FileReader();
          reader.onload = fileData => {
            images.push(fileData.target.result.split(',')[1]);
            if (files.length === images.length) {
              up_file_suc(images, null);
            }
          };
          reader.readAsDataURL(files[i]);
          i++;
        }
      }
    } else {
      if (platform === 'ios') {
        navigator.camera.getPicture(up_file_onSuccess, file_error, {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          encodingType: 1
        });
      } else {
        elemId('post_file' + simple_id).click();
      }
    }
  }
}

function up_file_onSuccess(URI) {
  window.resolveLocalFileSystemURL(
    URI,
    fileEntry => {
      fileEntry.file(file => {
        const reader = new FileReader();
        reader.onloadend = event => {
          const blob = new Blob([event.target.result]);
          up_file_suc(null, blob);
        };
        reader.readAsArrayBuffer(file);
      }, file_error);
    },
    file_error
  );
}

function up_file_suc(base64, mode_blob) {
  let blob;
  if (base64 || mode_blob) {
    if (Array.isArray(base64)) {
      var arr = base64;
      if (!base64[0]) return;
      base64 = base64[0];
      arr.shift();
    }
    show('now_loading');
    if (base64) {
      const binary = atob(base64);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      blob = new Blob([new Uint8Array(array)], { type: 'image/png' });
    } else if (mode_blob) {
      blob = mode_blob;
    }

    const formData = new FormData();
    formData.append('file', blob);

    Fetch('https://' + inst + '/api/v1/media', {
      headers: { Authorization: 'Bearer ' + now_userconf['token'] },
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(json => {
        if (json) {
          if (json['id'] && json['type'] !== 'unknown') {
            elemId('image_list' + image_mode).innerHTML =
              '<ons-card onclick="file_del(this)" style=\'background-image: url(' +
              json['preview_url'] +
              ")' class='card-image media-upload" +
              image_mode +
              "' data-mediaid='" +
              json['id'] +
              "'></ons-card>" +
              elemId('image_list' + image_mode).innerHTML;
            hide('now_loading');
          } else {
            hide('now_loading');
            showtoast('cannot-pros');
          }
        }
        if (arr) up_file_suc(arr);
      })
      .catch(error => {
        catchHttpErr('media', error);
        hide('now_loading');
      });
  }
}

function file_del(card) {
  ons.notification
    .confirm(i18next.t('dialogs_js.delete_picture'), {
      modifier: 'material',
      cancelable: true
    })
    .then(e => {
      if (e === 1) {
        card.parentNode.removeChild(card);
      }
    });
}

function file_error(msg) {
  showtoast('cannot-post');
  // eslint-disable-next-line no-console
  console.log(msg);
}

function post_nsfw(simple) {
  let simple_id = '';
  if (simple) simple_id = '_simple';
  const cw_input = elemId('nsfw_input' + simple_id);
  const cwicon = elemId('nsfw_bt' + simple_id);

  if (simple) {
    if (cwicon.className == button + ' w-max') {
      //選択済み→解除
      cw_input.value = '';
      cwicon.className = quiet;
    } else {
      cw_input.value = '1';
      cwicon.className = button + ' w-max';
    }
  } else {
    if (cwicon.className == button) {
      //CW オン→オフ
      cw_input.value = '';
      cwicon.className = quiet;
    } else {
      //CW オフ→オン
      cw_input.value = '1';
      cwicon.className = button;
    }
  }
}

function post_localonly(simple) {
  let simple_id = '';
  if (simple) simple_id = '_simple';
  const cw_input = elemId('localonly_input' + simple_id);
  const cwicon = elemId('localonly_bt' + simple_id);

  if (cwicon.className == button) {
    //選択済み→解除
    cw_input.value = '';
    if (simple) cwicon.className = quiet + ' no-rd';
    else cwicon.className = quiet;
  } else {
    cw_input.value = '1';
    cwicon.className = button;
  }
}

function post_mode(simple) {
  let simple_id = '';
  if (simple) simple_id = '_simple';
  const input_obj = elemId('post_mode' + simple_id);
  const bt_obj = elemId('post_mode_icon' + simple_id);
  const icon_base = 'ons-icon fa-fw fa fa-';
  let visibility_name = '';

  const buttons = [
    { label: i18next.t('privacy.public'), icon: 'fa-globe' },
    { label: i18next.t('privacy.unlisted'), icon: 'fa-unlock-alt' },
    { label: i18next.t('privacy.private'), icon: 'fa-lock' },
    { label: i18next.t('privacy.direct'), icon: 'fa-envelope' },
    {
      label: i18next.t('navigation.cancel'),
      icon: 'md-close'
    }
  ];

  if (instance_config[inst]['privacy_limited'])
    buttons.splice(3, 0, {
      label: i18next.t('privacy.limited'),
      icon: 'fa-low-vision'
    });

  ons
    .openActionSheet({
      cancelable: true,
      buttons: buttons
    })
    .then(index => {
      if (index == 0) visibility_name = 'public';
      else if (index == 1) visibility_name = 'unlisted';
      else if (index == 2) visibility_name = 'private';
      else if (index == 3 && instance_config[inst]['privacy_limited'])
        visibility_name = 'limited';
      else if (
        (index == 3 && !instance_config[inst]['privacy_limited']) ||
        (index == 4 && instance_config[inst]['privacy_limited'])
      )
        visibility_name = 'direct';
      else return;

      input_obj.value = visibility_name;
      bt_obj.className = icon_base + visibility_icon_name(visibility_name);
    });
}

function check_limit(value, id, tb_id, cw_id) {
  let limit = 0;
  if (cw_id) {
    const cw = elemId(cw_id).value;
    limit = toot_limit - value.length - cw.length;
  } else {
    limit = toot_limit - value.length;
  }
  elemId(id).innerHTML = limit;
  if (limit < 0) {
    elemId(id).setAttribute('style', 'color: red');
  } else {
    elemId(id).setAttribute('style', '');
  }
}

function show_bbcodegen(id, limit, button) {
  tmp_bbcode_limit = limit;
  tmp_bbcode_tootbutton = button;
  tmp_bbcode_id = id;
  tmp_post_text = elemId(id).value;
  loadNav('bbcode.html');
}

function bbcodegen(force) {
  const text = elemId('bbcode_text').value;
  const base = elemId('bbcode_base').value;
  const color = elemId('bbcode_color').value;
  const large = elemId('bbcode_large').value;
  const spin = parseInt(elemId('bbcode_spin').value);
  const pulse = parseInt(elemId('bbcode_pulse').value);
  let pre = '';
  let suf = '';
  let buf = '';
  let value = '';
  if (spin > 9 && !force) {
    ons.notification
      .confirm(dialog_i18n('warning_spin', 1), {
        title: dialog_i18n('warning_spin'),
        modifier: 'material',
        cancelable: true
      })
      .then(e => {
        if (e === 1) {
          bbcodegen(true);
        }
      });
  } else {
    if (spin) {
      for (let i = 0; i < spin; i++) {
        pre += '[spin]';
        suf = '[/spin]' + suf;
      }
    }
    if (base) {
      pre += '[' + base + ']';
      suf = '[/' + base + ']' + suf;
    }
    if (color) {
      pre += '[colorhex=' + color + ']';
      suf = '[/colorhex]' + suf;
    }
    if (pulse) {
      for (let p = 0; p < pulse; p++) {
        pre += '[pulse]';
        suf = '[/pulse]' + suf;
      }
    }

    if (large) {
      /* sizeは潰れた
      large = large * 16;
      pre += "[size="+large+"]";
      suf = "[/size]" + suf;
      */
      pre += '[large=' + large + 'x]';
      suf = '[/large]' + suf;
    }
    buf = pre + text + suf;
    value = tmp_post_text + buf;
    const limit = toot_limit - value.length;
    if (limit < 0) {
      showtoast('bbcode-limit');
    } else {
      document.querySelector('#navigator').popPage();
      elemId(tmp_bbcode_id).value = value;
      check_limit(value, tmp_bbcode_limit, tmp_bbcode_tootbutton);
    }
  }
}

function bbcode_color(color) {
  BackTab();
  const color_s = '#' + color;
  if (color_mode) {
    const d_box = elemId('doodle-color-box-mini');
    if (color) {
      doodle_old_color = color_s;
      sketcher.color = color_s;
      d_box.style.backgroundColor = color_s;
    } else {
      sketcher.color = color_s;
      d_box.style.backgroundColor = '#000000';
    }
  } else {
    const b_color = elemId('bbcode_color');
    const b_box = elemId('color-box-mini');
    if (color) {
      b_color.value = color;
      b_box.style.backgroundColor = color_s;
    } else {
      b_color.value = '';
      b_box.style.backgroundColor = '';
    }
  }
}

function post(id, option, simple) {
  const media_id = Array();
  let i;
  let simple_id = '';

  const optiondata = {
    status: elemId(id).value,
    visibility: option.visibility
  };

  if (simple) {
    simple_close();
    show('post_now');
    simple_id = '_simple';
  } else show('now_loading');

  const media = document.getElementsByClassName('media-upload' + simple_id);

  const vote1 = elemId('vote_new_1' + simple_id).value;
  const vote2 = elemId('vote_new_2' + simple_id).value;
  const vote3 = elemId('vote_new_3' + simple_id).value;
  const vote4 = elemId('vote_new_4' + simple_id).value;
  const votem = elemId('vote_new_time' + simple_id).value;

  if (vote1 != '' && vote2 != '') {
    optiondata.isEnquete = true;
    optiondata.enquete_duration = parseInt(votem);
    optiondata.enquete_items = [vote1, vote2, vote3, vote4];
  }
  if (option.cw) {
    optiondata.spoiler_text = option.cw;
  }
  if (option.local_only) {
    optiondata.status += ' 👁️';
  }
  if (option.sensitive && media[0]) {
    optiondata.sensitive = true;
  }
  if (option.in_reply_to_id) {
    optiondata.in_reply_to_id = option.in_reply_to_id;
  }
  if (media[0]) {
    i = 0;
    while (media[i]) {
      media_id[i] = media[i].dataset.mediaid;
      i++;
    }
    optiondata.media_ids = media_id;
  }
  Fetch('https://' + inst + '/api/v1/statuses', {
    headers: {
      'content-type': 'application/json',
      Authorization: 'Bearer ' + now_userconf['token']
    },
    method: 'POST',
    body: JSON.stringify(optiondata)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(json => {
      if (json['id']) {
        if (simple) {
          $('#simple_toot_form')
            .find('textarea, input, select')
            .val('')
            .end()
            .find(':checked')
            .prop('checked', false);
          $('#simple_vote')
            .find('textarea, input, select')
            .val('')
            .end()
            .find(':checked')
            .prop('checked', false);
          $('#simple_toot_cw').val('');
          check_limit(
            elemId('simple_toot_TL_input').value,
            'toot_limit_simple',
            'toot-button_simple',
            'simple_toot_cw'
          );
          elemId('image_list_simple').innerHTML = '';
          $('#post_mode_simple').val(default_post_visibility);
          elemId('localonly_bt_simple').className =
            'no-rd button button--quiet';
          elemId('post_mode_icon_simple').className =
            'ons-icon fa-fw fa fa-' +
            visibility_icon_name(default_post_visibility);
          hide('post_now');
        } else {
          hide('now_loading');
          BackTab('down');
        }
      } else {
        showtoast('cannot-post');
        if (simple) hide('post_now');
        else hide('now_loading');
      }
    })
    .catch(error => {
      showtoast('cannot-post');
      // eslint-disable-next-line no-console
      console.log(error);
      if (simple) hide('post_now');
      else hide('now_loading');
      catchHttpErr('post', error);
    });
}

function simple_open() {
  if (instance_config[inst]['enquete'])
    $('#vote_bt_simple').removeClass('invisible');
  if (instance_config[inst]['yomigana'])
    $('#yomigana_bt_simple').removeClass('invisible');
  if (instance_config[inst]['bbcode'])
    $('#bbcode_bt_simple').removeClass('invisible');
  if (instance_config[inst]['enquete_duration'])
    $('#vote_new_time_simple').removeClass('invisible');
  if (instance_config[inst]['glitch_soc'])
    $('#localonly_bt_simple').removeClass('invisible');
  if (instance_config[inst]['markdown'])
    $('#md_note_simple').removeClass('invisible');

  elemId('simple_toot_TL_input').rows = 3;
  $('#simple_toot_TL_toolbar').addClass('simple_toot_open');
  $('#simple_more').removeClass('invisible');

  $('#dial_main').addClass('fab_simple_toot_open');
  $('#dial_TL').addClass('fab_simple_toot_open');

  renderEmoji(elemId('emoji_list_popover'));
}

function simple_close() {
  document.activeElement.blur();
  elemId('simple_toot_TL_input').rows = 1;
  $('#simple_toot_TL_toolbar').removeClass('simple_toot_open');
  $('#simple_more').addClass('invisible');

  $('#dial_main').removeClass('fab_simple_toot_open');
  $('#dial_TL').removeClass('fab_simple_toot_open');
}

function add_emoji_simple(addtext, mode) {
  // https://qiita.com/noraworld/items/d6334a4f9b07792200a5
  let id = 'simple_toot_TL_input';
  if (mode == undefined) {
    // eslint-disable-next-line no-console
    console.log(pageid);
    if (pageid === 'toot-page') {
      id = 'toot_textarea';
    }
  } else {
    if (mode) id = 'toot_textarea';
  }
  const textarea = elemId(id);
  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const before = sentence.substr(0, pos);
  const word = addtext;
  const after = sentence.substr(pos, len);
  sentence = before + word + after;
  textarea.value = sentence;
  hidePopover('emoji_popover');
}

function paste_simple() {
  cordova.plugins.clipboard.paste(text => {
    add_emoji_simple(text);
  });
}
