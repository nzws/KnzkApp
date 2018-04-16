function init() {
  closeAllws();
  //変数破棄
  now_TL = "";
  last_load_TL = "";
  tmp_post_text = "";
  toot_new_id = "";
  toot_old_id = "";
  account_toot_old_id = "";
  account_page_id = "";
  alert_new_id = "";
  alert_old_id = "";
  more_status_id = "";
  more_acct_id = "";
  tmp_bbcode_id = "";
  tmp_bbcode_limit = "";
  tmp_bbcode_tootbutton = "";
  emoji_list = Array();
  account_page_acct = "";
  tmp_text_pre = "";
  tmp_post_reply = 0;
  tmp_post_visibility = "";
  follow_old_id = "";
  tmp_media_del_id = 0;
  tmp_media_del_obj = "";
  tag_old_id = "";
  tag_str = "";
  list_old_id = "";
  TL_websocket = {};
  image_mode = "";
  home_auto_event = false;
  home_auto_mode = true;
  home_auto_num = 0;
  doodle_old_color = null;
  doodle_mode = null;
  default_post_visibility = "";
  default_sensitive = false;
  config_tmp = {};
  original_post_text = "";
  original_post_userid = "";
  emoji_search = [];
  acct_mode = "";
  timeline_store_data = {};
  timeline_config = {};
  timeline_now_tab = 0;
  timeline_default_tab = 0;
  init_d();
  if (!localStorage || !fetch) {
    show("cannot-use-ls");
  } else {
    show('now_loading');

    if (localStorage.getItem('knzkapp_now_mastodon_token')) {
      try {
        inst = localStorage.getItem('knzkapp_now_mastodon_domain').toLowerCase();

        if (getConfig(1, 'theme')) document.getElementById("theme_css").href = getConfig(1, 'theme');

        if (instance_config[inst]) {
          toot_limit = instance_config[inst]["limit"];
        } else {
          instance_config[inst] = {limit: 500};
          toot_limit = 500;
        }

        if (instance_config[inst]["markdown"])
          document.getElementById("css_md").href = "css/kirishima_markdown.css";
        else
          document.getElementById("css_md").href = "";

        if (ons.platform.isIPhoneX()) { // for iPhone X
          let html_tag = document.documentElement;
          html_tag.setAttribute('onsflag-iphonex-portrait', '1');
          html_tag.setAttribute('onsflag-iphonex-landscape', '1');
          document.getElementById("css_toolbar_android").href = "css/iphonex.css";
        }

        if (platform === "android") document.getElementById("css_toolbar_android").href = "css/toolbar-height.css";
      } catch (e) {
        sendLog("Error/init_1", e);
      }

      fetch("https://" + inst + "/api/v1/instance").then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          sendLog("Error/init_instance", response.json);
          throw new Error();
        }
      }).then(function (json) {
        fetch("https://" + inst + "/api/v1/accounts/verify_credentials", {
          headers: {'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')}
        }).then(function (response) {
          if (response.ok) {
            return response.json();
          } else {
            sendLog("Error/init_verify_credentials", response.json);
            throw new Error();
          }
        }).then(function (json) {
          try {
            timeline_config = getConfig(3, "config");
            timeline_default_tab = getConfig(3, "default") === "" ? 0 : getConfig(3, "default");

            if (localStorage.getItem('knzkapp_now_mastodon_id') == undefined) localStorage.setItem('knzkapp_now_mastodon_id', json.id);
            if (localStorage.getItem('knzkapp_now_mastodon_username') == undefined) localStorage.setItem('knzkapp_now_mastodon_username', json.username);
            initBookmark();

            if (json.source) {
              default_post_visibility = json.source.privacy;
              default_sensitive = json.source.sensitive;
            } else {
              default_post_visibility = "public";
            }

            if (getConfig(1, 'no_custom_emoji')) {
              $("#ep_bt_custom").addClass("invisible");
            } else {
              $("#ep_bt_custom").removeClass("invisible");
              var elist = document.getElementById("emoji_list_popover");
              elist.innerHTML = "loading now...";
              elist.dataset.isload = "no";
            }

            document.querySelector('#navigator').resetToPage('home.html');
            initevent();

            setTimeout(function () {
              startWatching();
              TL_change(timeline_default_tab);
              now_TL = timeline_config[timeline_default_tab];
              timeline_now_tab = timeline_default_tab;
              document.getElementById('home_title').innerHTML = TLname(timeline_config[timeline_now_tab]);
              showTL(null, null, null, true, null);

              if (getConfig(1, 'tutorial') !== 1) {
                loadNav("tutorial.html", "up");
                setConfig(1, "tutorial", 1);
              }
              document.getElementById("splitter-profile-bg").setAttribute('style', 'background-image: url(\'' + json[getConfig(1, 'no_gif') ? "header_static" : "header"] + '\');');
              document.getElementById("splitter-icon").src = json[getConfig(1, 'no_gif') ? "avatar_static" : "avatar"];
              if (instance_config[inst]["yomigana"]) document.getElementById("splitter-profile-name").style.height = "30px";
              document.getElementById("splitter-profile-name").innerHTML = t_text(escapeHTML(json.display_name));
              document.getElementById("account_change-username").innerHTML = json.acct + "@" + inst;
              if (json.locked === true)
                $("#menu-followreq").removeClass("invisible");
              else
                $("#menu-followreq").addClass("invisible");

              if (getConfig(1, 'menu-fav') == 1) $("#menu-fav-page").removeClass("invisible");
              if (getConfig(1, 'swipe_menu') == 1) {
                document.getElementById("splitter-menu").setAttribute('swipeable', '1');
                document.getElementById("tl_tabs").setAttribute("swipeable", "1");
              }

              var dial = getConfig(1, 'dial'), icon;
              if (dial && dial != "change") {
                $("#dial_main").removeClass("invisible");
                if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell";
                if (dial === "reload") icon = "fa-refresh";
                document.getElementById("dial-icon").className = "ons-icon fa " + icon;
              } else if (dial) {
                $("#dial_TL").removeClass("invisible");
                setsd();
              }
              migration_app2glitch();
            }, 500);
          } catch (e) {
            console.log(e);
            sendLog("Error/init_2", e);
          }
        }).catch(function (error) {
          console.log(error);
          showtoast('cannot-connect-API');
          hide('now_loading');
        });
      }).catch(function (error) {
        showtoast('cannot-connect-sv');
        hide('now_loading');
      })
    } else {
      setTimeout(function () {
        document.querySelector('#navigator').resetToPage('login.html');
      }, 500);
    }
    hide('now_loading');
  }
}

function initevent() {
  $(document).on('click', 'div.toot_content', function (event) {
    var obj = event.currentTarget, id = 0;
    var button = event.target.className;
    if (obj.className.indexOf("toot_content") !== -1 && button.indexOf("button") === -1 && button.indexOf("enquete") === -1) {
      id = obj.dataset.id;
      if (obj.className.indexOf("toot-small") === -1) {
        if (obj.dataset.dispmode !== "big") {
          show_post(id);
        }
      } else {
        toot_col(id);
      }
    }
  });
  $(document).on('click', 'a', function (event) {
    var word = "";
    event.stopPropagation();
    event.preventDefault();
    var obj = event.target;
    var url = obj.getAttribute('href');
    if (!url) {
      obj = event.currentTarget;
      url = obj.getAttribute('href');
    }
    if (obj.className === "u-url mention") {
      word = url.split("/");
      show_account_name(word[word.length - 1] + "@" + word[word.length - 2]);
    } else if (obj.className === "mention hashtag") {
      word = url.split("/");
      tag_str = word[word.length - 1];
      showTagTL(tag_str);
    } else {
      openURL(url);
    }
    return false;
  });

  document.addEventListener('postpush', function (event) {
    pageid = event.enterPage.id;
    if (event.enterPage.id === "home") {
      setTimeout(function () {
        document.getElementById("toot_limit_simple").innerHTML = toot_limit;
        $("#post_mode_simple").val(default_post_visibility);
        document.getElementById("post_mode_icon_simple").className = "ons-icon fa-fw fa fa-" + visibility_name(default_post_visibility);
        if (getConfig(1, 'cp_popover')) $("#simple_cp_bt").removeClass("invisible");
      }, 500);
    } else {
      home_auto_event = false;
      last_load_TL = "";
    }

    if (event.enterPage.id === "config-page") {
      show('now_loading');
      setTimeout(function () {
        if (ons.platform.isIPhoneX()) document.getElementById("item-dp").className = "invisible"; //iPhoneXだとぶっ壊れるため
        if (getConfig(1, 'dial')) document.getElementById("dial_" + getConfig(1, 'dial')).selected = true;
        if (getConfig(1, 'theme')) document.getElementById("theme_" + getConfig(1, 'theme')).selected = true;
        if (getConfig(1, 'design_platform')) document.getElementById("dp_" + getConfig(1, 'design_platform')).selected = true;
        if (getConfig(1, 'url_open')) document.getElementById("url_" + getConfig(1, 'url_open')).selected = true;
        if (getConfig(1, 'toot_button')) document.getElementById("toot_bt_" + getConfig(1, 'toot_button')).selected = true;
        if (getConfig(1, 'toot_body')) document.getElementById("toot_body_" + getConfig(1, 'toot_body')).selected = true;
        hide('now_loading');
        var conf = $("[id^='conf-']"), i = 0;
        while (conf[i]) {
          if (parseInt(getConfig(1, conf[i].id.replace("conf-", "")))) conf[i].checked = true;
          i++;
        }
      }, 500);
    }

    if (event.enterPage.id === "userconf-page") {
      show('now_loading');
      fetch("https://" + inst + "/api/v1/accounts/verify_credentials", {
        headers: {'Authorization': 'Bearer ' + localStorage.getItem('knzkapp_now_mastodon_token')}
      }).then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          sendLog("Error/event_userconf-page", response);
          throw new Error();
        }
      }).then(function (json) {
        document.getElementById("userconf-display_name").value = json["display_name"];
        document.getElementById("userconf-note").value = json["source"]["note"];
        document.getElementById("userconf-lock").checked = json["locked"];
        hide('now_loading');
      }).catch(function (error) {
        showtoast('cannot-pros');
        hide('now_loading');
      });
    }

    if (event.enterPage.id === "config_collapse-page") {
      show('now_loading');
      setTimeout(function () {
        var conf = $("[id^='conf-col-']"), i = 0;
        while (conf[i]) {
          if (parseInt(getConfig(2, conf[i].id.replace("conf-col-", "")))) conf[i].checked = true;
          i++;
        }
        hide('now_loading');
      }, 500);
    }

    if (event.enterPage.id === "config_notification-page") {
      setNotificationServer();
      show('now_loading');
      setTimeout(function () {
        document.getElementById("noti-mode").checked = !!LoadNotificationConfig()["is_running"];
        var conf = $("[id^='noti-mute-']"), i = 0;
        while (conf[i]) {
          conf[i].checked = LoadNotificationConfig()["option"]["notification"]["all"][conf[i].id.replace("noti-mute-", "")];
          i++;
        }
        renderKeyWordList();
        hide('now_loading');
      }, 500);
    }

    if (event.enterPage.id === "login-page") {
      if (localStorage.getItem('knzkapp_now_mastodon_token')) {
        setTimeout(function () {
          document.getElementById("login_left").innerHTML = "<ons-toolbar-button onclick=\"BackTab()\" class=\"toolbar-button\">\n" +
            "                    <ons-icon icon=\"fa-chevron-left\" class=\"ons-icon fa-chevron-left fa\"></ons-icon>\n" +
            "                    戻る\n" +
            "                </ons-toolbar-button>";
          initph("alert");
        }, 200);
      }
    }
    if (event.enterPage.id === "toot-page") {
      if (!tmp_post_visibility) tmp_post_visibility = default_post_visibility;
      document.getElementById("post_mode_icon").className = "ons-icon fa fa-fw fa-" + visibility_name(tmp_post_visibility);

      if (tmp_post_reply) {
        if (tmp_text_pre) {
          var post_reply_acct = tmp_text_pre, post_reply_acct_s = post_reply_acct.split(" ");
          if (post_reply_acct_s[1]) {
            post_reply_acct = post_reply_acct_s[0] + " ...";
          }
        }
        document.getElementById("post_reply").value = tmp_post_reply; //投稿ID
        document.getElementById("post_reply_box").className = "reply-box"; //返信のダイアログ表示
        document.getElementById("post_reply_acct").innerHTML = tmp_text_pre ? post_reply_acct : "自分";
        document.getElementById("post_mode").value = tmp_post_visibility; //投稿モード
        tmp_post_reply = null;
      }
      tmp_post_visibility = null;

      document.getElementById("toot-limit").innerHTML = toot_limit;
      if (instance_config[inst]["enquete"]) $("#vote_bt").removeClass("invisible");
      if (instance_config[inst]["yomigana"]) $("#yomigana_bt").removeClass("invisible");
      if (instance_config[inst]["bbcode"]) $("#bbcode_bt").removeClass("invisible");
      if (instance_config[inst]["enquete_duration"]) $("#vote_new_time").removeClass("invisible");
      if (instance_config[inst]["glitch_soc"]) $("#localonly_bt").removeClass("invisible");
      if (instance_config[inst]["markdown"]) $("#md-box").removeClass("invisible");

      renderEmoji(document.getElementById("emoji_list_popover"));
    }
    if (document.getElementById("toot_textarea") && tmp_text_pre) {
      document.getElementById("toot_textarea").value = tmp_text_pre;
      tmp_text_pre = null;
    }

    if (event.enterPage.id === "about-page") {
      document.getElementById("app-version").innerText = version;
    }

    if (event.enterPage.id === "usermenu-page") {
      if (!instance_config[inst]["glitch_soc"]) document.getElementById("dmtimeline_bt").className = "invisible";
    }

    if (event.enterPage.id === "config_TL-page") {
      initTLConf();
    }
  });

  document.addEventListener('postpop', function (event) {
    pageid = event.enterPage.id;
    if (event.enterPage.id === "home") {
      home_auto_event = true;
      home_autoevent();
      document.getElementById("toot_limit_simple").innerHTML = toot_limit;
    } else {
      home_auto_event = false;
    }
  });

  if (getConfig(1, "resume_reload")) {
    document.addEventListener("resume", function () {
      if (pageid === "home" && !home_auto_event) {
        showTL(null, null, null, true);
      }
    }, false);
  }

  document.addEventListener('prechange', function (event) {
    if (event.carousel) {
      var label = [document.getElementById("tutorial_next_label"), document.getElementById("tutorial_next_icon")];
      if (event.activeIndex === 3) {
        label[0].innerText = "完了";
        label[1].className = "ons-icon fa-check fa";
      } else {
        label[0].innerText = "次へ";
        label[1].className = "ons-icon fa-chevron-right fa";
      }
    } else if ($("#navigator").attr("page") === "home.html") {
      timeline_now_tab = event.index;
      document.getElementById('home_title').innerHTML = TLname(timeline_config[event.index]);
      now_TL = timeline_config[event.index];
      showTL(null, null, null, true);
    }
  });

  $(document).on('click', '.timeline', function (event) {
    if ($("#navigator").attr("page") === "home.html") {
      simple_close();
    }
  });

  document.addEventListener('postopen', function (event) {
    account_list();
    reset_nav();
  });

  if (getConfig(1, 'swipe_menu') != 1) {
    document.addEventListener('swipeleft', function(event) {
      if (pageid === "home") TL_next();
    });

    document.addEventListener('swiperight', function(event) {
      if (pageid === "home") TL_prev();
    });
  }

  if (ons.isWebView()) {
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
  }
}

function home_autoevent() {
  setTimeout(function () {
    if (home_auto_event) {
      updateTLtrack();
      var storedata = timeline_store_data[inst][timeline_now_tab];
      if (storedata !== "" && home_auto_mode) {
        if (getConfig(1, 'chatmode'))
          document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML = document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML + storedata;
        else
          document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML = storedata + document.querySelector('#TL' + timeline_now_tab + '_main > .page__content').innerHTML;
        timeline_store_data[inst][timeline_now_tab] = "";
        home_auto_num = 0;
        setTLheadcolor(0);
        if (getConfig(1, 'chatmode')) $(".page__content").scrollTop(99999999999999999999999);
      }

      if (!getConfig(1, 'chatmode')) {
        try {
          var mr = $(".more_load_bt_" + timeline_now_tab).offset().top - window.innerHeight;
          if (mr < -10) {
            showTL(null, null, document.getElementsByClassName("more_load_bt_" + timeline_now_tab)[0]);
          }
        } catch (e) {
          console.log(e);
        }
      }
      home_autoevent();
    }
  }, 1000);
}

var button = "", quiet = "", light = "", large_quiet = "", platform = "";

function init_d() {
  var platform_mode = "ios", css = "";

  if (!platform) {
    if (ons.platform.isIOS()) {
      platform = "ios";
    } else if (ons.platform.isAndroid()) {
      platform = "android";
    } else {
      platform = "other";
    }
  }
  if (localStorage.getItem('knzkapp_conf_mastodon') != undefined) {
    if (getConfig(1, 'design_platform')) {
      platform_mode = getConfig(1, 'design_platform');
    } else {
      ons.disableAutoStyling();
    }

    if (platform_mode === "ios") {
      button = "button";
      quiet = button + " button--quiet";
      light = button + " button--light";
      large_quiet = button + " button--large--quiet";
      ons.platform.select("ios");
    } else {
      button = "button button--material";
      quiet = "button button--material--flat";
      light = button + " button--light";
      large_quiet = button + " button--material--flat button--large";
      ons.platform.select("android");
      css += "#toot-button { padding-bottom: 0; }";
    }

    if (getConfig(1, 'spin') == 1 || getConfig(1, 'gpu') != 1) {
      if (getConfig(1, 'spin') == 1) {
        css += ".fa-spin {-webkit-animation: none;  animation: none;}";
      }
      if (getConfig(1, 'gpu') != 1) {
        css += ".toot, .timeline {transform: translate3d(0, 0, 0);}";
      }
      if (getConfig(1, 'toot_button')) {
        if (getConfig(1, 'toot_button') === "large") {
          css += ".toot-button { margin-right: 0.5em; font-size: xx-large; }";
        } else if (getConfig(1, 'toot_button') === "small") {
          css += ".toot-button { margin-right: 1.5em; font-size: large; } .date-disp { margin-top: 0 }";
        }
      } else {
        setConfig(1, "toot_button", "normal");
      }
      if (getConfig(1, 'toot_body')) {
        if (getConfig(1, 'toot_body') === "large") {
          css += ".toot_content > p { font-size: medium; }";
        } else if (getConfig(1, 'toot_body') === "small") {
          css += ".toot_content > p { font-size: small; }";
        }
      } else {
        setConfig(1, "toot_body", "normal");
      }
    }
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    heads[0].appendChild(node);
  }
}

init_d();
ons.ready(function () {
  ConfigSetup();
  init();
  if (is_debug) {
    ons.notification.alert('この状態で公開しないで下さい！', {title: 'デバッグモード'});
    if (getConfig(1, "SendLog") === "") setConfig(1, "SendLog", "0");
  } else {
    if (getConfig(1, "SendLog") === "") {
      ons.notification.confirm("KnzkAppでは、エラー時に開発者が原因を特定しやすいようログを送信する機能が備わっています。<br>エラー時にログを開発者へ送信してもよろしいですか？<br><a onclick=\"openURL('https://knzkapp.yuzu.tk/privacy.html')\">プライバシーポリシー</a>", {
        title: 'KnzkAppへようこそ',
        buttonLabels: ["同意しない", "同意する"]
      }).then(function (e) {
        if (e === 1) {
          setConfig(1, "SendLog", "1");
          Raven.config(sentryID, {release: version}).install();
        } else {
          setConfig(1, "SendLog", "0");
        }
      });
    } else if (getConfig(1, "SendLog") === "1") {
      Raven.config(sentryID, {release: version}).install();
    }
  }
});

// https://press.monaca.io/atsushi/248
function handleOpenURL(url) {
  setTimeout(function () {
    var strValue = url;
    strValue = strValue.replace('knzkapp://', '');
    var mode = strValue.split("/");
    if (mode[0] === "login") {
      var token = getParam(mode[1].replace('token', ''));
      login_callback(token["code"]);
    } else if (mode[0] === "user") {
      var user = mode[1].replace('open?', '');
      show_account_name(user);
    }
  }, 100);
}
