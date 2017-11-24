function initph(mode) {
    if (mode === "TL") {
    } else {
        try {
            var ph_alert = document.getElementById('ph-alert');
            ph_alert.addEventListener('changestate', function(event) {
                var message = '';

                switch (event.state) {
                    case 'initial':
                        message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
                        break;
                    case 'preaction':
                        message = '<ons-icon icon="fa-refresh" class="white"></ons-icon>';
                        break;
                    case 'action':
                        message = '<span class="fa fa-spin"><span class="fa fa-spin"><ons-icon icon="fa-refresh" class="white"></ons-icon></span></span>';
                        break;
                }

                ph_alert.innerHTML = message;
            });

            ph_alert.onAction = function(done) {
                console.log("reload");
                showAlert(done);
            };
        } catch (e) {
            console.log("ERROR_Pull_hook");
        }
    }
}

function init() {
    try {if (old_TL_ws) old_TL_ws.close();} catch (e) {console.log("no_ws");}
    //変数破棄
    now_TL = "local";
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
    emoji_num_a = Array();
    emoji_num = 0;
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
    old_TL_ws = null;
    image_mode = "";
    home_auto_event = false;
    home_auto_tmp = "";
    home_auto_mode = true;
    home_auto_num = 0;
    init_d();
    hide('cannot-connect-sv');
    hide('cannot-connect-mastodon');
    hide('cannot-connect-internet');
    hide('cannot-connect-API');
    if (!localStorage || !fetch) {
        show("cannot-use-ls");
    } else {
        show('now_loading');
        if (localStorage.getItem('knzk_account_token')) {
            if (localStorage.getItem('knzk_theme')) document.getElementById("theme_css").href = localStorage.getItem('knzk_theme');

            if (ons.platform.isIPhoneX()) { // for iPhone X
                document.documentElement.addAttribute('onsflag-iphonex-portrait', '1');
                document.documentElement.addAttribute('onsflag-iphonex-landscape', '1');
            }

            if (ons.platform.isAndroid()) document.getElementById("css_toolbar_android").href = "css/toolbar-height.css";

            inst = localStorage.getItem('knzk_login_domain');
            fetch("https://"+inst+"/api/v1/instance").then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error();
                }
            }).then(function(json) {
                fetch("https://"+inst+"/api/v1/accounts/verify_credentials", {
                    headers: {'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')}
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        throw new Error();
                    }
                }).then(function(json) {
                    document.getElementById("toot_emoji_list_popover").innerHTML = "load";
                    document.getElementById("emoji_list_popover").innerHTML = "load";
                    if (inst === "knzk.me") {
                        toot_limit = 5000;
                    } else if (inst === "now.kibousoft.co.jp") {
                        toot_limit = 4096;
                    } else {
                        toot_limit = 500;
                    }

                    if (localStorage.getItem('knzk_realtime') == undefined) localStorage.setItem('knzk_realtime', 1);
                    if (localStorage.getItem('knzk_dial') == undefined) localStorage.setItem('knzk_dial', 'change');
                    document.querySelector('#navigator').resetToPage('home.html');
                    initevent();
                    showTL("local", null, null, true, null);

                    setTimeout(function () {
                        document.getElementById("toot_limit_simple").innerHTML = toot_limit;
                        document.getElementById("splitter-profile-bg").setAttribute('style', 'background-image: url(\''+json.header+'\');');
                        document.getElementById("splitter-icon").src = json.avatar;
                        document.getElementById("splitter-profile-name").innerHTML = json.display_name;
                        document.getElementById("account_change-username").innerHTML = json.acct + "@" + inst;
                        if (json.locked === true)
                            $("#menu-followreq").removeClass("invisible");
                        else
                            $("#menu-followreq").addClass("invisible");

                        if (localStorage.getItem('knzk_menu-fav') == 1) $("#menu-fav-page").removeClass("invisible");

                        if (localStorage.getItem('knzk_swipe') == 1) document.getElementById("carousel").setAttribute('swipeable', '1');
                        var dial = localStorage.getItem('knzk_dial'), icon;
                        if (dial && dial != "change") {
                            $("#dial_main").removeClass("invisible");
                            if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell"; if (dial === "reload") icon = "fa-refresh";
                            document.getElementById("dial-icon").className = "ons-icon fa "+icon;
                        } else if (dial) {
                            $("#dial_TL").removeClass("invisible");
                        }
                    }, 200);
                }).catch(function(error) {
                    console.log(error);
                    show('cannot-connect-API');
                    hide('now_loading');
                });
            }).catch(function (error) {
                if (inst === "knzk.me") {
                    fetch("http://status.knzk.me/api/v1/components", {
                    }).then(function(response) {
                        if(response.ok) {
                            return response.json();
                        } else {
                            throw new Error();
                        }
                    }).then(function(json) { //statusつながる&インスタンスつながらない=鯖落ち
                        show('cannot-connect-mastodon');
                        hide('now_loading');
                    }).catch(function(error) {
                        console.log(error);
                        show('cannot-connect-internet');
                        hide('now_loading');
                    });
                } else { //status無いのでわからない
                    show('cannot-connect-sv');
                    hide('now_loading');
                }
            })
        } else {
            setTimeout(function () {
                document.querySelector('#navigator').resetToPage('login.html');
                if (!ons.isWebView()) $("#login_debug").removeClass("invisible");
            }, 500);
        }
        hide('now_loading');
    }
}

function initevent() {
    $(document).on('click', 'div.toot_content', function(event) {
        var obj = event.currentTarget, id = 0;
        var button = event.target.className;
        if (obj.className.indexOf("toot_content") !== -1 && button.indexOf("button") === -1 && button.indexOf("enquete") === -1) {
            if (obj.dataset.dispmode !== "big") {
                id = obj.dataset.id;
                show_post(id);
            }
        }
    });
    $(document).on('click', 'a', function(event) {
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
            show_account_name(word[word.length-1] + "@" + word[word.length-2]);
        } else if (obj.className === "mention hashtag") {
            word = url.split("/");
            tag_str = word[word.length-1];
            showTagTL(tag_str);
        } else {
            openURL(url);
        }
        return false;
    });

    document.addEventListener('postpush', function(event) {
        if (event.enterPage.id === "home" && !home_auto_event) {
            home_auto_event = true;
            home_autoevent();
            document.getElementById("toot_limit_simple").innerHTML = toot_limit;
        } else {
            home_auto_event = false;
        }

        if (event.enterPage.id === "config-page") {
            show('now_loading');
            setTimeout(function() {
                if (localStorage.getItem('knzk_bigfav') == 1) document.getElementById("conf-fav-namu").checked = "true";
                if (localStorage.getItem('knzk_lite_mode') == 1) document.getElementById("conf-lite-mode").checked = "true";
                if (localStorage.getItem('knzk_nsfw') == 1) document.getElementById("conf-nsfw").checked = "true";
                if (localStorage.getItem('knzk_cw') == 1) document.getElementById("conf-cw").checked = "true";
                if (localStorage.getItem('knzk_acct_list_small') == 1) document.getElementById("conf-acct_list_small").checked = "true";
                if (localStorage.getItem('knzk_realtime') == 1) document.getElementById("conf-realtime").checked = "true";
                if (localStorage.getItem('knzk_spin') == 1) document.getElementById("conf-spin").checked = "true";
                if (localStorage.getItem('knzk_swipe') == 1) document.getElementById("conf-swipe").checked = "true";
                if (localStorage.getItem('knzk_joke') == 1) document.getElementById("conf-joke").checked = "true";
                if (localStorage.getItem('knzk_menu-fav') == 1) document.getElementById("conf-menu-fav").checked = "true";
                if (localStorage.getItem('knzk_alert-back') == 1) document.getElementById("conf-alert-back").checked = "true";
                if (localStorage.getItem('knzk_image_full') == 1) document.getElementById("conf-image_full").checked = "true";
                if (localStorage.getItem('knzk_dial')) document.getElementById("dial_"+localStorage.getItem('knzk_dial')).selected = true;
                if (localStorage.getItem('knzk_theme')) document.getElementById("theme_"+localStorage.getItem('knzk_theme')).selected = true;
                hide('now_loading');
            },500);
        }
        if (event.enterPage.id === "login-page") {
            if (localStorage.getItem('knzk_account_token')) {
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
            var emoji = document.getElementById("toot_emoji_list_popover"), i = 0, reshtml = "";
            if (emoji.innerHTML == "load") {
                document.getElementById("toot-limit").innerHTML = toot_limit;
                fetch("https://"+inst+"/api/v1/custom_emojis", {
                    headers: {'content-type': 'application/json'},
                    method: 'GET',
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        //カスタム絵文字非対応インスタンス
                        $("#toot_emoji_bt").addClass("invisible");
                    }
                }).then(function(json) {
                    while (json[i]) {
                        reshtml += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\""+json[i]["shortcode"]+"\", true)'><img draggable=\"false\" class=\"emojione\" src=\""+json[i]["url"]+"\"></ons-button>\n";
                        i++;
                    }
                    emoji.innerHTML = reshtml;
                });
            }
        }

        if (document.getElementById("post_reply") && tmp_post_reply) {
            var bt_obj = document.getElementById("post_mode_bt");

            if (tmp_post_visibility === "public") bt_obj.innerHTML = "公開";
            else if (tmp_post_visibility === "unlisted") bt_obj.innerHTML = "非収載";
            else if (tmp_post_visibility === "private") bt_obj.innerHTML = "非公開";
            else if (tmp_post_visibility === "direct") bt_obj.innerHTML = "ダイレクト";

            document.getElementById("post_reply").value = tmp_post_reply; //投稿ID
            document.getElementById("post_reply_box").className = "reply-box"; //返信のダイアログ表示
            document.getElementById("post_reply_acct").innerHTML = tmp_text_pre; //返信先
            document.getElementById("post_mode").value = tmp_post_visibility; //投稿モード
            tmp_post_reply = null;
            tmp_post_visibility = null;
        }
        if (document.getElementById("toot_textarea") && tmp_text_pre) {
            document.getElementById("toot_textarea").value = tmp_text_pre;
            tmp_text_pre = null;
        }
    });

    var carousel = document.addEventListener('postchange', function(event) {
        var home_cr = {0:"ローカル",1:"ホーム",2:"連合"};
        var TL_name = {0:"local",1:"home",2:"public"};
        document.getElementById('home_title').innerHTML = home_cr[event.activeIndex];
        now_TL = TL_name[event.activeIndex];
        showTL(null,null,null,true,true);
    });

    $(document).on('click', 'ons-carousel', function(event) {
        if ($("#navigator").attr("page") === "home.html") {
            simple_close();
        }
    });
}

function setTLheadcolor(mode) {
    try {
        var head = document.getElementById("home_title");
        var unread = document.getElementById("home_title_unread");
        if (mode) { //blue
            head.className = "TL_reload";
            unread.innerHTML = home_auto_num;
            unread.className = "notification";
        } else {
            head.className = "";
            unread.className = "notification invisible";
        }
    } catch (e) {
        console.log(e);
    }
}

function home_autoevent() {
    setTimeout(function () {
        if (home_auto_event) {
            var h = $("#"+now_TL+"_item").scrollTop();
            home_auto_mode = h <= 100;
            if (home_auto_tmp !== "" && home_auto_mode) {
                document.getElementById(now_TL+"_main").innerHTML = home_auto_tmp + document.getElementById(now_TL+"_main").innerHTML;
                home_auto_tmp = "";
                home_auto_num = 0;
                setTLheadcolor(0);
            }

            try {
                var mr = $(".more_load_bt_"+now_TL).offset().top;
                if (mr < 700) {
                    showTL(null,null,document.getElementsByClassName("more_load_bt_"+now_TL)[0]);
                }
            } catch (e) {
                console.log(e);
            }
            home_autoevent();
        }
    }, 1000);
}

var button = "", quiet = "", light = "";
function init_d() {
    button = "button";
    quiet = button + " button--quiet";
    light = button + " button--light";
    ons.disableAutoStyling();
    if (localStorage.getItem('knzk_lite_mode') == 1) {
        ons.disableAnimations();
    }

    if (localStorage.getItem('knzk_spin') == 1) {
        var css = ".fa-spin {-webkit-animation: none;  animation: none;}";
        var node = document.createElement("style");
        node.type = "text/css";
        node.appendChild(document.createTextNode(css));
        var heads = document.getElementsByTagName("head");
        heads[0].appendChild(node);
    }
}
init_d();
ons.ready(function() {
    init();
});

// https://press.monaca.io/atsushi/248
function handleOpenURL(url) {
    setTimeout(function() {
        var strValue = url;
        strValue = strValue.replace('knzkapp://','');
        var mode = strValue.split("/");
        if (mode[0] === "login") {
            var token = mode[1].replace('token?code=','');
            token = token.replace('&state=','');
            login_callback(token);
        }
    }, 100);
}