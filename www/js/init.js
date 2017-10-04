function initph() {
    var ph = document.getElementById('ph-home');

    ph.addEventListener('changestate', function(event) {
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

        ph.innerHTML = message;
    });

    ph.onAction = function(done) {
        console.log("reload");
        showTL(null, done);
    };

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
}

function init() {
    //変数破棄
    now_TL = "local";
    last_load_TL = "";
    tmp_post_text = "";
    toot_new_id = 0;
    toot_old_id = 0;
    account_toot_old_id = 0;
    account_page_id = 0;
    alert_new_id = 0;
    alert_old_id = 0;
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
    follow_old_id = 0;
    media_num = 0;
    media_id = Array();
    tmp_media_del_id = 0;
    tmp_media_del_obj = "";
    tag_old_id = 0;
    tag_str = "";

    hide('cannot-connect-sv');
    hide('cannot-connect-mastodon');
    hide('cannot-connect-internet');
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
                document.querySelector('#navigator').resetToPage('init.html');
                load('home.html');
                initevent();
                showTL();
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
        if (obj.className == "toot_content") {
            console.log(obj);
            id = obj.dataset.id;
            show_post(id);
        }
    });
    $(document).on('click', 'a', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var obj = event.target;
        if (!event.target.className) obj = event.currentTarget;
        var url = obj.getAttribute('href');
        var word = url.split("/");

        if (obj.className == "u-url mention") {
            show_account_name(word[word.length-1]);
        } else if (obj.className == "mention hashtag") {
            tag_str = word[word.length-1];
            showTagTL(tag_str);
        }
        return false;
    });

    document.addEventListener('postpush', function(event) {
        if (document.getElementById("post_reply") && tmp_post_reply) {
            var bt_obj = document.getElementById("post_mode_bt");

            if (tmp_post_visibility == "public") bt_obj.innerHTML = "公開";
            else if (tmp_post_visibility == "unlisted") bt_obj.innerHTML = "非収載";
            else if (tmp_post_visibility == "private") bt_obj.innerHTML = "非公開";
            else if (tmp_post_visibility == "direct") bt_obj.innerHTML = "ダイレクト";

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

    document.addEventListener('prechange', function(event) {
        if (event.index == 2 || event.index == 3) {
            event.cancel();
        } else if (event.index == 0) { //home

        } else if (event.index == 1) { //通知
            showAlert();
        } else if (event.index == 4) { //config
            document.getElementById("account-conf-id").innerHTML = "<div class=\"center list-item__center\">@"+localStorage.getItem('knzk_username')+" でログイン中</div>";
            if (localStorage.getItem('knzk_bigfav') == 1) document.getElementById("conf-fav-namu").checked = "true";
            if (localStorage.getItem('knzk_material_design') == 1) document.getElementById("conf-material").checked = "true";
        }
    });
}

var button = "", quiet = "", light = "";
if (localStorage.getItem('knzk_material_design') == 1) { //マテリアル
    button = "button button--material";
    quiet = button + " button--material--flat";
    light = quiet;
} else {
    button = "button";
    quiet = button + " button--quiet";
    light = button + " button--light";
    ons.disableAutoStyling();
}
ons.ready(function() {
    init();
});