function getConfig(type, name) {
    if (!config_tmp[type]) config_tmp[type] = type === 1 ? localStorage.getItem('knzkapp_conf_mastodon') : localStorage.getItem('knzkapp_conf_mastodoncol');

    var data = config_tmp[type];
    data = JSON.parse(data);
    return data[name] ? data[name] : "";
}

function change_conf(name, id, sel, istext) {
    var md = (name === 1) ? 'knzkapp_conf_mastodon' : 'knzkapp_conf_mastodoncol';
    var data = JSON.parse(localStorage.getItem(md));
    if (sel) {
        data[id] = document.getElementById("conf-"+id).value;
    } else {
        var colmd = "";
        if (md === "knzkapp_conf_mastodoncol") colmd = "col-";
        var mode = document.getElementById("conf-"+colmd+id).checked;
        if (istext)
            data[id] = platform === "ios" ? mode == true ? "0" : "1" : mode == true ? "1" : "0";
        else
            data[id] = platform === "ios" ? mode == true ? 0 : 1 : mode == true ? 1 : 0;
    }
    localStorage.setItem(md, JSON.stringify(data));
    config_tmp[name] = null;
}

function setConfig(name, id, value) { //data->1: 基本設定, data->2: col
    var md = (name === 1) ? 'knzkapp_conf_mastodon' : 'knzkapp_conf_mastodoncol';
    var data = JSON.parse(localStorage.getItem(md));
    data[id] = value;
    localStorage.setItem(md, JSON.stringify(data));
    config_tmp[name] = null;
}

function ConfigSetup() {
    var last_version = 2;

    if (!localStorage.getItem('knzkapp_conf_mastodon')) {
        if (localStorage.getItem('knzk_realtime') == undefined) localStorage.setItem('knzk_realtime', 1);
        if (localStorage.getItem('knzk_head_reset') == undefined) localStorage.setItem('knzk_head_reset', 1);
        if (localStorage.getItem('knzk_dial') == undefined) localStorage.setItem('knzk_dial', 'change');
    }

    if (localStorage.getItem('knzkapp_conf_version') == undefined) localStorage.setItem('knzkapp_conf_version', 1);

    var now_version = parseInt(localStorage.getItem('knzkapp_conf_version'));
    if (now_version !== last_version) {
        show('DB_migration');
        var mig_i = 0;
        var accountdata = {
            "list": localStorage.getItem('knzk_account_list'),
            "token": localStorage.getItem('knzk_account_token'),
            "userid": localStorage.getItem('knzk_userid'),
            "username": localStorage.getItem('knzk_username'),
            "domain": localStorage.getItem('knzk_login_domain')
        };
        if (now_version < 2) { //config migration v1 -> v2
            /**
             * v2
             * 散らばっていたconfigをまとめました。
             */
            var list_d = ["bigfav", "nsfw", "cw", "realtime", "spin", "swipe", "joke", "menu-fav", "alert-back", "image_full", "swipe_menu", "head_reset", "dial", "theme", "url_open"];
            var list_col = ["alert", "all", "bg", "bs", "collapse", "leng", "media", "preview"];
            var new_conf = {};
            var new_conf_col = {};
            mig_i = 0;
            while (list_d[mig_i]) {
                new_conf[list_d[mig_i]] = localStorage.getItem('knzk_' + list_d[mig_i]) == undefined ? "" : localStorage.getItem('knzk_' + list_d[mig_i]);
                mig_i++;
            }
            mig_i = 0;
            while (list_col[mig_i]) {
                new_conf_col[list_col[mig_i]] = localStorage.getItem('conf-col-' + list_col[mig_i]) == undefined ? "" : localStorage.getItem('conf-col-' + list_col[mig_i]);
                mig_i++;
            }
            localStorage.clear();

            localStorage.setItem('knzkapp_conf_mastodon', JSON.stringify(new_conf));
            localStorage.setItem('knzkapp_conf_mastodoncol', JSON.stringify(new_conf_col));
        }

        if (accountdata["list"]) localStorage.setItem('knzkapp_account_list', accountdata["list"]);
        if (accountdata["token"]) localStorage.setItem('knzkapp_now_mastodon_token', accountdata["token"]);
        if (accountdata["userid"]) localStorage.setItem('knzkapp_now_mastodon_id', accountdata["userid"]);
        if (accountdata["username"]) localStorage.setItem('knzkapp_now_mastodon_username', accountdata["username"]);
        if (accountdata["domain"]) localStorage.setItem('knzkapp_now_mastodon_domain', accountdata["domain"]);
        localStorage.setItem('knzkapp_conf_version', last_version);
        hide('DB_migration');
        init();
    }
}

function clearAllConfig() {
    ons.notification.confirm('本当に全ての設定をリセットしますか？', {title: '設定をリセット'}).then(function (e) {
        if (e === 1) {
            ons.notification.confirm('もう一度聞きます。<br>本当に全ての設定をリセットしますか？', {title: '設定をリセット'}).then(function (e) {
                if (e === 1) {
                    localStorage.setItem('knzkapp_conf_mastodon', JSON.stringify({}));
                    localStorage.setItem('knzkapp_conf_mastodoncol', JSON.stringify({}));
                    ons.notification.toast('設定をリセットしました。再起動してください。');
                }
            });
        }
    });
}