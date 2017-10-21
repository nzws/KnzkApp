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
                        message = '<span class="fa fa-spin"><span class="fa fa-spin"><ons-icon icon="fa-refresh" class="white"></ons-icon></span></ons-icon></span>';
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
    if (debug === true) {
        ons.notification.alert('テスト用:この状態で公開しないでください!');
    }
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
    old_TL_ws = "";
    init_d();
    hide('cannot-connect-sv');
    hide('cannot-connect-mastodon');
    hide('cannot-connect-internet');
    hide('cannot-connect-API');
    if (!localStorage) {
        show("cannot-use-ls");
    } else {
        show('now_loading');
        fetch("https://"+inst+"/api/v1/instance", {
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error();
            }
        }).then(function(json) {
            if (localStorage.getItem('knzk_login_token')) {
                fetch("https://"+inst+"/api/v1/accounts/verify_credentials", {
                    headers: {'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')}
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        throw new Error();
                    }
                }).then(function(json) {
                    if (localStorage.getItem('knzk_realtime') == undefined) localStorage.setItem('knzk_realtime', 1);
                    loadNav('home.html');
                    initevent();
                    showTL("local", null, null, true, null);
                    document.getElementById("splitter-profile-bg").setAttribute('style', 'background-image: url(\''+json.header+'\');');
                    document.getElementById("splitter-icon").src = json.avatar;
                    document.getElementById("splitter-profile-name").innerHTML = json.display_name;
                    document.getElementById("account_change-username").innerHTML = json.acct + "@" + inst;
                    var dial = localStorage.getItem('knzk_dial'), icon;
                    if (dial) {
                        $("#dial_main").removeClass("invisible");
                        if (dial === "toot") icon = "fa-pencil"; else if (dial === "alert") icon = "fa-bell"; if (dial === "reload") icon = "fa-refresh";
                        document.getElementById("dial-icon").className = "ons-icon fa "+icon;
                    }
                }).catch(function(error) {
                    show('cannot-connect-API');
                    console.log(error);
                    hide('now_loading');
                });
            } else {
                loadNav('login.html');
            }
            hide('now_loading');
        }).catch(function(error) {
            if (stat_sv) {
                fetch("http://"+stat_sv+"/api/v1/components", {
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        throw new Error();
                    }
                }).then(function(json) { //statusつながる&インスタンスつながらない=鯖落ち
                    show('cannot-connect-mastodon');
                    hide('now_loading');
                }).catch(function(error) { //両方とも繋がらない=通信できない
                    show('cannot-connect-internet');
                    console.log(error);
                    hide('now_loading');
                });
            } else { //status無いのでわからない
                show('cannot-connect-sv');
                console.log(error);
                hide('now_loading');
            }
        });
    }
}


function initevent() {
    $(document).on('click', 'div.toot_content', function(event) {
        var obj = event.currentTarget, id = 0;
        var button = event.target.className;
        if (obj.className === "toot_content" && button.indexOf("button") === -1 && button.indexOf("enquete") === -1) {
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
            window.open(url, "_blank", "enableViewportScale=yes");
        }
        return false;
    });

    document.addEventListener('postpush', function(event) {
        if (event.enterPage.id === "config-page") {
            document.getElementById("account-conf-id").innerHTML = "<div class=\"center list-item__center\">@"+localStorage.getItem('knzk_username')+" でログイン中</div>";
            show('now_loading');
            setTimeout(function() {
                if (localStorage.getItem('knzk_bigfav') == 1) document.getElementById("conf-fav-namu").checked = "true";
                if (localStorage.getItem('knzk_lite_mode') == 1) document.getElementById("conf-lite-mode").checked = "true";
                if (localStorage.getItem('knzk_nsfw') == 1) document.getElementById("conf-nsfw").checked = "true";
                if (localStorage.getItem('knzk_cw') == 1) document.getElementById("conf-cw").checked = "true";
                if (localStorage.getItem('knzk_acct_list_small') == 1) document.getElementById("conf-acct_list_small").checked = "true";
                if (localStorage.getItem('knzk_realtime') == 1) document.getElementById("conf-realtime").checked = "true";
                if (localStorage.getItem('knzk_spin') == 1) document.getElementById("conf-spin").checked = "true";
                if (localStorage.getItem('knzk_dial')) document.getElementById("dial_"+localStorage.getItem('knzk_dial')).selected = true;
                hide('now_loading');
            },500);
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
        /*
        var home_cr = {0:"ローカルTL",1:"+ローカルTL",2:"ホーム",3:"連合"};
        var TL_name = {0:"local",1:"pluslocal",2:"home",3:"public"};
        */
        var home_cr = {0:"ローカルTL",1:"ホーム",2:"連合"};
        var TL_name = {0:"local",1:"home",2:"public"};
        document.getElementById('home_title').innerHTML = home_cr[event.activeIndex];
        now_TL = TL_name[event.activeIndex];
        showTL(null,null,null,true,true);
    });
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