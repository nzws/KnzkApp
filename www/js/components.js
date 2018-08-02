var showPopover = function(target, id) {
  elemId(id).show(target);
};

var hidePopover = function(id) {
  elemId(id).hide();
};

window.fn = {};

window.fn.open = function() {
  var menu = elemId('splitter-menu');
  menu.open();
  $('[data-i18n]').localize();
};

function reset_nav() {
  var list = elemId('music-form');
  var menu = elemId('menu-list');
  var account_list = elemId('account-list');
  list.style.display = 'none';
  account_list.style.display = 'none';
  menu.style.display = 'block';
}

function load(page) {
  if (page != 'home.html') {
    try {
      closeAllws();
    } catch (e) {}
  }
  loadNav(page, null, 'reset');
}

function loadNav(page, mode, move_mode) {
  //mode: アニメーション方法, splitter: スライドメニューを使用しているか, move_mode: ページを読み込むモード
  var option = mode === 'up' ? { animation: 'lift' } : { animation: 'slide' },
    menu = elemId('splitter-menu'),
    nav = document.querySelector('#navigator');

  var onLoad = function() {
    menu.close();
    setTimeout(function() {
      $('[data-i18n]').localize();
    }, 0);
  };

  if (move_mode === 'reset') nav.resetToPage(page, { animation: 'none' }).then(onLoad());
  // else if (move_mode === "reload") nav.bringPageTop(page, option).then(onLoad());
  else nav.bringPageTop(page, option).then(onLoad());
}

function BackTab(mode) {
  var option;
  if (mode === 'down') option = { animation: 'lift' };
  else option = { animation: 'slide' };

  document.querySelector('#navigator').popPage(option);
}

function displayTime(mode, time) {
  if (mode == 'new') {
    return new Date(time).toTwitterRelativeTime(lng);
  } else {
    var i = 0;
    var list = document.getElementsByClassName('date');
    while (list[i]) {
      list[i].innerHTML = displayTime('new', list[i].dataset.time);
      i++;
    }
  }
}

function opendial() {
  if (getConfig(1, 'dial') == 'toot') {
    loadNav('post.html', 'up');
  } else if (getConfig(1, 'dial') == 'alert') {
    openTL('alert_nav');
  } else if (getConfig(1, 'dial') == 'reload') {
    showTL(null, 'dial');
  }
}

function showtoast(id) {
  elemId(id).show();
  setTimeout(function() {
    //3秒くらい
    elemId(id).hide();
  }, 2000);
}

function t_text(text, emojidata, domain) {
  var i = 0,
    emoji = '',
    replacetext = '';

  if (getConfig(1, 'joke') == 1) {
    text = text.replace(/。/g, '、それと便座カバー。');
    text = text.replace(/toot/g, 'awoo');
    text = text.replace(/TOOT/g, 'AWOO');
    text = text.replace(/(神崎|おにいさん)/g, "<span style='color: red'>$1</span>");
    text = text.replace(/あんのたん/g, "<span class='fav-active'>$1</span>");
    text = text.replace(
      /(ごちうさ|ご注文はうさぎですか？)/g,
      'あぁ^～心がぴょんぴょんするんじゃぁ^～'
    );
    text = text.replace(/35億/g, '5000兆円');
    text = text.replace(/がっこうぐらし/g, '【窓割れてね？】');
    text = text.replace(
      /(ニート|無職|ノージョブ|自宅警備員)/g,
      '【部屋に閉じこもって生きていればそれでいいの？】'
    );
  }

  if (!getConfig(1, 'no_custom_emoji') && emojidata) {
    var emoji_mode = getConfig(1, 'no_gif') ? 'static_url' : 'url';
    while (emojidata[i]) {
      emoji = ':' + emojidata[i]['shortcode'] + ':';

      replacetext =
        '<img draggable="false" class="emojione" src="' + emojidata[i][emoji_mode] + '" />';
      text = text.replace(new RegExp(emoji, 'g'), replacetext);
      i++;
    }
  }

  // インスタンスのドメインが送られてきた場合はチェックを行うが、送られてこなかった場合は今まで通り全て読み仮名通す
  var isYomigana = false;
  try {
    if (instance_config[domain.toLowerCase()]['yomigana']) isYomigana = true;
  } catch (e) {}
  if (!domain) isYomigana = true;

  if (isYomigana) {
    //読み仮名 from theboss.tech
    //参考: https://github.com/theboss/mastodon/commit/f14da9bf85298000c4882e604b3d1eda8c99d0ee
    text = text.replace(/[|｜]?([^|｜《]+?)《([^》]+?)》/g, '<ruby><rb>$1</rb><rt>$2</rt></ruby>');
  }

  //text = emojione.toImage(text);
  text = twemoji.parse(text);
  return text;
}

function show(id) {
  elemId(id).show();
}

function hide(id) {
  elemId(id).hide();
}

function openURL(url) {
  var mode = getConfig(1, 'url_open');
  if (ons.isWebView() && !mode) {
    SafariViewController.isAvailable(function(available) {
      if (available) {
        SafariViewController.show(
          {
            url: url,
          },
          function(result) {
            if (result.event === 'opened') {
              console.log('opened');
            } else if (result.event === 'loaded') {
              console.log('loaded');
            } else if (result.event === 'closed') {
              console.log('closed');
            }
          },
          function(msg) {
            console.log('openURL[' + url + ']: ' + msg);
          }
        );
      } else {
        window.open(url, '_system');
      }
    });
  } else {
    if (mode == 'Inapp') {
      window.open(url, '_blank');
    } else {
      window.open(url, '_system');
    }
  }
}

function getParam(val) {
  var data_s = {},
    data = val.substring(1).split('&'),
    data_ex,
    value,
    key;
  for (var i = 0; i < data.length; i++) {
    data_ex = value = key = null;
    data_ex = data[i].search(/=/);
    value = data[i].slice(data[i].indexOf('=', 0) + 1);
    if (data_ex != -1) key = data[i].slice(0, data_ex);
    if (key) data_s[key] = decodeURIComponent(value);
  }
  return data_s;
}

function escapeHTML(text) {
  text = text
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return text;
}

function copy(text) {
  cordova.plugins.clipboard.copy(text);
  showtoast('ok-copy');
}

function elemId(id) {
  return document.getElementById(id);
}

function change_splash(mode) {
  if (ons.isWebView()) {
    if (mode) {
      navigator.splashscreen.show();
    } else {
      navigator.splashscreen.hide();
    }
  } else {
    console.log('[splash screen]:' + !!mode);
  }
}
