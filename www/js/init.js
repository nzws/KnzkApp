function init() {
  closeAllws();
  init_d();
  change_splash(0);
  if (!localStorage || !Fetch) {
    show('cannot-use-ls');
  } else {
    show('starting_screen');

    if (localStorage.getItem('knzkapp_now_token')) {
      try {
        now_userconf = {
          token: localStorage.getItem('knzkapp_now_token'),
          id: localStorage.getItem('knzkapp_now_id'),
          username: localStorage.getItem('knzkapp_now_username'),
        };
        inst = localStorage.getItem('knzkapp_now_domain').toLowerCase();
      } catch (e) {
        starting_alert('err');
        getError('Error/init_login', e);
        return false;
      }

      try {
        starting_alert('instance_conf');
        if (instance_config[inst]) {
          toot_limit = instance_config[inst]['limit'];
        } else {
          instance_config[inst] = { limit: 500 };
          toot_limit = 500;
        }
      } catch (e) {
        starting_alert('err');
        getError('Error/init_instance', e);
        return false;
      }

      try {
        starting_alert('theme');
        elemId('theme_css').href = getConfig(1, 'theme') ? getConfig(1, 'theme') : '';
        elemId('css_md').href = instance_config[inst]['markdown']
          ? 'css/kirishima_markdown.css'
          : '';

        if (ons.platform.isIPhoneX()) {
          // for iPhone X
          let html_tag = document.documentElement;
          html_tag.setAttribute('onsflag-iphonex-portrait', '1');
          html_tag.setAttribute('onsflag-iphonex-landscape', '1');
          elemId('css_custom_platform').href = 'css/iphonex.css';
        } else if (platform === 'android') {
          elemId('css_custom_platform').href = 'css/toolbar-height.css';
        }
      } catch (e) {
        starting_alert('err');
        getError('Error/init_instance', e);
        return false;
      }

      starting_alert('instance_login');
      Fetch('https://' + inst + '/api/v1/instance')
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw response;
          }
        })
        .then(function(json) {
          starting_alert('login');
          Fetch('https://' + inst + '/api/v1/accounts/verify_credentials', {
            headers: { Authorization: 'Bearer ' + now_userconf['token'] },
          })
            .then(function(response) {
              if (response.ok) {
                return response.json();
              } else {
                throw response;
              }
            })
            .then(function(json) {
              try {
                starting_alert('prepare');
                timeline_config = getConfig(3, 'config');
                timeline_default_tab = getConfig(3, 'default') === '' ? 0 : getConfig(3, 'default');
                timeline_list_names = getConfig(3, 'list_names');

                if (now_userconf['id'] == undefined)
                  localStorage.setItem('knzkapp_now_mastodon_id', json.id);
                if (now_userconf['username'] == undefined)
                  localStorage.setItem('knzkapp_now_mastodon_username', json.username);

                if (json.source) {
                  default_post_visibility = json.source.privacy;
                  default_sensitive = json.source.sensitive;
                } else {
                  default_post_visibility = 'public';
                }

                if (getConfig(1, 'no_custom_emoji')) {
                  $('#ep_bt_custom').addClass('invisible');
                } else {
                  $('#ep_bt_custom').removeClass('invisible');
                  var elist = elemId('emoji_list_popover');
                  elist.innerHTML = 'loading now...';
                  elist.dataset.isload = 'no';
                }

                document.querySelector('#navigator').resetToPage('home.html');
                initBookmark();
                initevent();

                setTimeout(function() {
                  startWatching();
                  initTimeline();
                  migration_app2glitch();

                  if (getConfig(1, 'tutorial') !== 1) {
                    loadNav('tutorial.html', 'up');
                    setConfig(1, 'tutorial', 1);
                  }

                  try {
                    starting_alert('user');

                    if (getConfig(1, 'menu-fav') == 1) $('#menu-fav-page').removeClass('invisible');
                    if (getConfig(1, 'swipe_menu') == 1) {
                      elemId('splitter-menu').setAttribute('swipeable', '1');
                      elemId('tl_tabs').setAttribute('swipeable', '1');
                    }
                    document
                      .getElementById('splitter-profile-bg')
                      .setAttribute(
                        'style',
                        "background-image: url('" +
                          json[getConfig(1, 'no_gif') ? 'header_static' : 'header'] +
                          "');"
                      );
                    user_icon = json[getConfig(1, 'no_gif') ? 'avatar_static' : 'avatar'];
                    elemId('splitter-icon').src = user_icon;
                    if (instance_config[inst]['yomigana'])
                      elemId('splitter-profile-name').style.height = '30px';
                    elemId('splitter-profile-name').innerHTML = t_text(
                      escapeHTML(json.display_name)
                    );
                    elemId('account_change-username').innerHTML = json.acct + '@' + inst;
                    if (json.locked === true) $('#menu-followreq').removeClass('invisible');
                    else $('#menu-followreq').addClass('invisible');
                    elemId('home-icon').src = user_icon;
                    document
                      .getElementById('simple_toot_TL_input')
                      .setAttribute(
                        'placeholder',
                        i18next.t('toot.toot_as', { acct: now_userconf['username'] + '@' + inst })
                      );
                  } catch (e) {
                    starting_alert('err');
                    getError('Error/init_instance', e);
                    return false;
                  }
                  hide('starting_screen');
                }, 500);
              } catch (e) {
                console.log(e);
                getError('Error/init_2', e);
              }
            })
            .catch(function(error) {
              error.text().then(errorMessage => {
                getError('Error/init_verify_credentials', errorMessage, true);
              });
              showtoast('cannot-connect-API');
              hide('starting_screen');
            });
        })
        .catch(function(error) {
          error.text().then(errorMessage => {
            getError('Error/init_instance', errorMessage, true);
          });
          showtoast('cannot-connect-sv');
          hide('starting_screen');
        });
    } else {
      setTimeout(function() {
        hide('starting_screen');
        document.querySelector('#navigator').resetToPage('login.html');
      }, 500);
    }
  }
}

function initevent() {
  $(document).on('click', 'div.toot_content', function(event) {
    var obj = event.currentTarget,
      id = 0;
    var button = event.target.className;
    if (
      obj.className.indexOf('toot_content') !== -1 &&
      button.indexOf('button') === -1 &&
      button.indexOf('enquete') === -1
    ) {
      id = obj.dataset.id;
      if (obj.className.indexOf('toot-small') === -1) {
        if (obj.dataset.dispmode !== 'big') {
          show_post(id);
        }
      } else {
        toot_col(id);
      }
    }
  });
  $(document).on('click', 'a', function(event) {
    var word = '';
    event.stopPropagation();
    event.preventDefault();
    var obj = event.target;
    var url = obj.getAttribute('href');
    if (!url) {
      obj = event.currentTarget;
      url = obj.getAttribute('href');
    }
    if (url === '#') {
      return;
    }
    if (obj.className === 'u-url mention') {
      word = url.split('/');
      show_account_name(word[word.length - 1] + '@' + word[word.length - 2]);
    } else if (obj.className === 'mention hashtag') {
      word = url.split('/');
      tag_str = word[word.length - 1];
      showTagTL(tag_str);
    } else {
      openURL(url);
    }
    return false;
  });

  document.addEventListener('postpush', function(event) {
    try {
      $('[data-i18n]').localize();
    } catch (e) {}
    pageid = event.enterPage.id;
    if (event.enterPage.id === 'home') {
      setTimeout(function() {
        elemId('toot_limit_simple').innerHTML = toot_limit;
        $('#post_mode_simple').val(default_post_visibility);
        elemId('post_mode_icon_simple').className =
          'ons-icon fa-fw fa fa-' + visibility_icon_name(default_post_visibility);
        if (getConfig(1, 'cp_popover')) $('#simple_cp_bt').removeClass('invisible');
      }, 500);
    } else {
      home_auto_event = false;
      last_load_TL = '';
    }

    if (event.enterPage.id === 'config-page') {
      show('now_loading');
      setTimeout(function() {
        if (ons.platform.isIPhoneX()) elemId('item-dp').className = 'invisible'; //iPhoneXだとぶっ壊れるため
        if (getConfig(1, 'dial')) elemId('dial_' + getConfig(1, 'dial')).selected = true;
        if (getConfig(1, 'theme')) elemId('theme_' + getConfig(1, 'theme')).selected = true;
        if (getConfig(1, 'url_open')) elemId('url_' + getConfig(1, 'url_open')).selected = true;
        if (getConfig(1, 'toot_button'))
          elemId('toot_bt_' + getConfig(1, 'toot_button')).selected = true;
        if (getConfig(1, 'toot_body'))
          elemId('toot_body_' + getConfig(1, 'toot_body')).selected = true;
        hide('now_loading');
        var conf = $("[id^='conf-']"),
          i = 0;
        while (conf[i]) {
          if (parseInt(getConfig(1, conf[i].id.replace('conf-', '')))) conf[i].checked = true;
          i++;
        }
      }, 500);
    }

    if (event.enterPage.id === 'userconf-page') {
      show('now_loading');
      Fetch('https://' + inst + '/api/v1/accounts/verify_credentials', {
        headers: { Authorization: 'Bearer ' + now_userconf['token'] },
      })
        .then(function(response) {
          if (response.ok) {
            return response.json();
          } else {
            throw response;
          }
        })
        .then(function(json) {
          elemId('userconf-display_name').value = json['display_name'];
          elemId('userconf-note').value = json['source']['note'];
          elemId('userconf-lock').checked = json['locked'];
          hide('now_loading');
        })
        .catch(function(error) {
          error.text().then(errorMessage => {
            getError('Error/event_userconf-page', errorMessage);
          });
          hide('now_loading');
        });
    }

    if (event.enterPage.id === 'config_collapse-page') {
      show('now_loading');
      setTimeout(function() {
        var conf = $("[id^='conf-col-']"),
          i = 0;
        while (conf[i]) {
          if (parseInt(getConfig(2, conf[i].id.replace('conf-col-', '')))) conf[i].checked = true;
          i++;
        }
        hide('now_loading');
      }, 500);
    }

    if (event.enterPage.id === 'config_notification-page') {
      setNotificationServer();
    }

    if (event.enterPage.id === 'config_filter-page') {
      renderFilter();
    }

    if (event.enterPage.id === 'login-page') {
      if (now_userconf['token']) {
        setTimeout(function() {
          elemId('login_left').innerHTML =
            '<ons-toolbar-button onclick="BackTab()" class="toolbar-button">\n' +
            '<ons-icon icon="fa-chevron-left" class="ons-icon fa-chevron-left fa"></ons-icon>\n' +
            i18next.t('navigation.back') +
            '</ons-toolbar-button>';
          initph('alert');
        }, 200);
      }
    }
    if (event.enterPage.id === 'toot-page') {
      if (!tmp_post_visibility) tmp_post_visibility = default_post_visibility;
      elemId('post_mode_icon').className =
        'ons-icon fa fa-fw fa-' + visibility_icon_name(tmp_post_visibility);

      if (tmp_post_reply) {
        if (tmp_text_pre) {
          var post_reply_acct = tmp_text_pre,
            post_reply_acct_s = post_reply_acct.split(' ');
          if (post_reply_acct_s[1]) {
            post_reply_acct = post_reply_acct_s[0] + ' ...';
          }
        }
        elemId('post_reply').value = tmp_post_reply; //投稿ID
        elemId('post_reply_box').className = 'reply-box'; //返信のダイアログ表示
        elemId('post_reply_acct').innerHTML = tmp_text_pre ? post_reply_acct : '自分';
        elemId('post_mode').value = tmp_post_visibility; //投稿モード
        tmp_post_reply = null;
      }
      tmp_post_visibility = null;

      elemId('toot-limit').innerHTML = toot_limit;
      if (instance_config[inst]['enquete']) $('#vote_bt').removeClass('invisible');
      if (instance_config[inst]['yomigana']) $('#yomigana_bt').removeClass('invisible');
      if (instance_config[inst]['bbcode']) $('#bbcode_bt').removeClass('invisible');
      if (instance_config[inst]['enquete_duration']) $('#vote_new_time').removeClass('invisible');
      if (instance_config[inst]['glitch_soc']) $('#localonly_bt').removeClass('invisible');
      if (instance_config[inst]['markdown']) $('#md-box').removeClass('invisible');

      renderEmoji(elemId('emoji_list_popover'));
    }
    if (elemId('toot_textarea') && tmp_text_pre) {
      elemId('toot_textarea').value = tmp_text_pre;
      tmp_text_pre = null;
    }

    if (event.enterPage.id === 'about-page') {
      elemId('app-version').innerText = version;
    }

    if (event.enterPage.id === 'usermenu-page') {
      if (!instance_config[inst]['glitch_soc']) elemId('dmtimeline_bt').className = 'invisible';
    }

    if (event.enterPage.id === 'config_TL-page') {
      initTLConf();
    }

    if (event.enterPage.id === 'lists-page') {
      renderListsCollection();
    }
  });

  document.addEventListener('postpop', function(event) {
    pageid = event.enterPage.id;
    if (event.enterPage.id === 'home') {
      home_auto_event = true;
      home_autoevent();
      elemId('toot_limit_simple').innerHTML = toot_limit;
    } else {
      home_auto_event = false;
    }
  });

  if (getConfig(1, 'resume_reload')) {
    document.addEventListener(
      'resume',
      function() {
        if (pageid === 'home' && !home_auto_event) {
          showTL(null, null, null, true);
        }
      },
      false
    );
  }

  document.addEventListener('prechange', function(event) {
    if (event.carousel) {
      var label = [elemId('tutorial_next_label'), elemId('tutorial_next_icon')];
      if (event.activeIndex === 3) {
        label[0].innerText = i18next.t('tutorial.done');
        label[1].className = 'ons-icon fa-check fa';
      } else {
        label[0].innerText = i18next.t('tutorial.next');
        label[1].className = 'ons-icon fa-chevron-right fa';
      }
    } else if ($('#navigator').attr('page') === 'home.html') {
      timeline_now_tab = event.index;
      elemId('home_title').innerHTML = TLname(timeline_config[event.index]);
      now_TL = timeline_config[event.index];
      showTL(null, null, null, true);
    }
  });

  $(document).on('click', '.timeline', function(event) {
    if ($('#navigator').attr('page') === 'home.html') {
      simple_close();
      $('#TLChangeTab').hide();
    }
  });

  document.addEventListener('postopen', function(event) {
    account_list();
    reset_nav();
  });

  if (getConfig(1, 'swipe_menu') != 1) {
    document.addEventListener('swipeleft', function(event) {
      if (pageid === 'home') TL_next();
    });

    document.addEventListener('swiperight', function(event) {
      var h = event.gesture.startEvent.center.clientX;
      if (h <= 20) {
        fn.open();
        return false;
      }
      if (pageid === 'home') TL_prev();
    });
  }

  if (ons.isWebView()) {
    try {
      FCMPlugin.onTokenRefresh(function(token) {
        if (FCM_token) var t = true;
        FCM_token = token;
        if (!t) changeNotification(true);
      });
      FCMPlugin.getToken(function(token) {
        if (FCM_token) var t = true;
        FCM_token = token;
        if (!t) changeNotification(true);
      });
    } catch (e) {
      ons.notification.alert(dialog_i18n('err_fcm', 1), {
        title: dialog_i18n('err_fcm'),
      });
      getError('Error/FCM', '');
    }
  }
}

function home_autoevent() {
  setTimeout(function() {
    if (home_auto_event) {
      updateTLtrack();
      var storedata = TlStoreData_pre[inst][timeline_now_tab];
      if (storedata !== '' && home_auto_mode) {
        if (getConfig(1, 'chatmode'))
          elemTimeline().innerHTML = elemTimeline().innerHTML + storedata;
        else {
          elemTimeline().innerHTML = storedata + elemTimeline().innerHTML;
          cacheTL();
        }
        TlStoreData_pre[inst][timeline_now_tab] = '';
        home_auto_num = 0;
        setTLheadcolor(0);
        if (getConfig(1, 'chatmode')) $('.page__content').scrollTop(99999999999999999999999);
      }
      home_autoevent();
    }
  }, 1000);
}

var button = '',
  quiet = '',
  light = '',
  large_quiet = '',
  platform = '';

function init_d() {
  var css = '';

  if (!platform) {
    if (ons.platform.isIOS()) {
      platform = 'ios';
    } else if (ons.platform.isAndroid()) {
      platform = 'android';
    } else {
      platform = 'other';
    }
  }
  if (localStorage.getItem('knzkapp_conf_mastodon') != undefined) {
    ons.disableAutoStyling();

    button = 'button';
    quiet = button + ' button--quiet';
    light = button + ' button--light';
    large_quiet = button + ' button--large--quiet';

    if (getConfig(1, 'spin') == 1 || getConfig(1, 'gpu') != 1) {
      if (getConfig(1, 'spin') == 1) {
        css += '.fa-spin {-webkit-animation: none;  animation: none;}';
      }
      if (getConfig(1, 'gpu') != 1) {
        css += '.toot, .timeline {transform: translate3d(0, 0, 0);}';
      }
      if (getConfig(1, 'toot_button')) {
        if (getConfig(1, 'toot_button') === 'large') {
          css += '.toot-button { margin-right: 0.5em; font-size: xx-large; }';
        } else if (getConfig(1, 'toot_button') === 'small') {
          css +=
            '.toot-button { margin-right: 1.5em; font-size: large; } .date-disp { margin-top: 0 }';
        }
      } else {
        setConfig(1, 'toot_button', 'normal');
      }
      if (getConfig(1, 'toot_body')) {
        if (getConfig(1, 'toot_body') === 'large') {
          css += '.toot_content > p { font-size: medium; }';
        } else if (getConfig(1, 'toot_body') === 'small') {
          css += '.toot_content > p { font-size: small; }';
        }
      } else {
        setConfig(1, 'toot_body', 'normal');
      }
    }
    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName('head');
    heads[0].appendChild(node);
  }
}

init_d();
i18n_init();
ons.ready(function() {
  ConfigSetup();
  init();
  if (is_debug) {
    ons.notification.alert('この状態で公開しないで下さい！', {
      title: 'Debug mode',
    });
    if (getConfig(1, 'SendLog') === '') setConfig(1, 'SendLog', '0');
  } else {
    if (getConfig(1, 'SendLog') === '') {
      setTimeout(function() {
        ons.notification
          .confirm(dialog_i18n('log', 1), {
            title: dialog_i18n('log'),
            buttonLabels: [i18next.t('dialogs_js.log.no'), i18next.t('dialogs_js.log.yes')],
          })
          .then(function(e) {
            if (e === 1) {
              setConfig(1, 'SendLog', '1');
              Raven.config(sentryID, { release: version }).install();
            } else {
              setConfig(1, 'SendLog', '0');
            }
          });
      }, 500);
    } else if (getConfig(1, 'SendLog') === '1') {
      Raven.config(sentryID, { release: version }).install();
    }
  }
});

// https://press.monaca.io/atsushi/248
function handleOpenURL(url) {
  setTimeout(function() {
    var strValue = url;
    strValue = strValue.replace('knzkapp://', '');
    var mode = strValue.split('/');
    if (mode[0] === 'login') {
      var token = getParam(mode[1].replace('token', ''));
      login_callback(token['code']);
    } else if (mode[0] === 'user') {
      var user = mode[1].replace('open?', '');
      show_account_name(user);
    }
  }, 100);
}

function starting_alert(type) {
  if (type === 'err') {
    elemId('starting_err').className = '';
  } else {
    if (i18next.t('starting.' + type) == 'starting.' + type) {
      //i18nロードされてない: 仕方ないのでen読み込む
      const en_locale = {
        instance_conf: 'Loading instance settings...',
        theme: 'Loading UI settings...',
        instance_login: 'Verifying instance...',
        login: 'Login in...',
        prepare: 'Preparing...',
        user: 'Loading user informations...',
      };
      elemId('starting_alert').innerText = en_locale[type];
    } else {
      elemId('starting_alert').innerText = i18next.t('starting.' + type);
    }
  }
}
