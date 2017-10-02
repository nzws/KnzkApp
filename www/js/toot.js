function toot_card(toot, mode, note, toot_light) {
    var buf = "", piccard = "", fav = "", boost = "", favmode = 0, boostmode = 0, namucard = "", namubt = "", m = 0, date = "", p = 0, alert_text = "", content = "", button = "", e = 0, bt_big = "", light = "";
    if (toot['reblog']) {
        alert_text = "<p class='alert_text'><ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + toot['account']['id'] + ")'>" + toot['account']['display_name'] + "</b>さんがブーストしました</p>";
        toot = toot['reblog'];
    }
    if (!toot['account']['display_name']) toot['account']['display_name'] = toot['account']['username'];
    if (toot['favourited'] == true) {
        fav = " fav-active";
        favmode = 1;
    }
    if (toot['reblogged'] == true) {
        boost = " boost-active";
        boostmode = 1;
    }
    if (localStorage.getItem('knzk_bigfav') == 1 && mode != "big") {
        namucard = " namu-toot";
        namubt = " namu-fav";
    }
    if (toot_light || toot['visibility'] === "direct") {
        light = " toot_light";
    }
    if (toot['emojis']) {
        while (toot['emojis'][e]) {
            emoji_num_a[emoji_num] = toot['emojis'][e]['shortcode'];
            emoji_list[emoji_num_a[emoji_num]] = toot['emojis'][e]['url'];
            emoji_num++;
            e++;
        }
        e = 0;
    }
    if (toot['mentions'][0]) {
        while (toot['mentions'][m]) {
            toot['content'] = toot['content'].replace(/<span class="h-card"><a href="https:\/\/(.*?)\/@(.*?)" class="u-url mention">@<span>(.*?)<\/span><\/a><\/span>/ , "<a href='#' onclick='show_account("+toot['mentions'][m]['id']+")'>@$2</a>");
            m++;
        }
    }
    if (toot['media_attachments'][0] && (mode == "full" || mode == "big")) {
        while (toot['media_attachments'][p]) {
            if (toot['sensitive']) { //NSFWオン
                piccard += "<ons-card onclick=\"window.open('"+toot['media_attachments'][p]['url']+"', '_blank')\" class='nsfw'><h3>回覧注意</h3><small>タップで表示</small></ons-card>";
            } else {
                piccard += "<ons-card onclick=\"window.open('"+toot['media_attachments'][p]['url']+"', '_blank')\" style='background-image: url("+toot['media_attachments'][p]['preview_url']+")' class='card-image'></ons-card>";
            }
            p++;
        }
    }
    date = displayTime('new', toot['created_at']);
    toot['content'] = toot['content'].replace(/<a href="https:\/\/(.*?)\/media\/(.*?)" rel="nofollow noopener" target="_blank"><span class="invisible">https:\/\/<\/span><span class="ellipsis">(.*?)\/media\/(.*?)<\/span><span class="invisible">(.*?)<\/span><\/a>/g , "<a href='#' onclick=\"window.open('https://$1/media/$2', '_blank')\"><ons-icon icon='fa-file-image-o'></ons-icon></a>");
    if (toot['spoiler_text']) {
        content = "<span onclick='show_post("+toot['id']+")'>" + toot['spoiler_text'] + "</span>　<ons-button modifier=\"light\" onclick='open_cw(\"cw_" + toot['id'] + "\", this);' class='cw-button'>もっと見る</ons-button><div class='invisible' id='cw_" + toot['id'] + "'><p><span onclick='show_post("+toot['id']+")'>" + toot['content'] + "</span>" + piccard + "</p></div>";
    } else { //CWなし
        content = "<div onclick='show_post("+toot['id']+")'>" + toot['content'] + "</div>" + piccard;
    }
    if (mode == "full") {
        button =    "                            <div class=\"toot-group\">" +
            "                                <ons-icon icon=\"fa-reply\" onclick=\"reply("+toot['id']+", '"+toot["account"]["acct"]+"', '"+toot["visibility"]+"')\" class=\"toot-button\"></ons-icon>" +
            "                                <ons-icon icon=\"fa-retweet\" onclick=\"toot_action("+toot['id']+", this, null, 'boost')\" class=\"toot-button"+boost+"\"></ons-icon>\n" +
            "                                <ons-icon icon=\"fa-bell\" onclick=\"toot_action("+toot['id']+", this, null, 'fav')\" class=\"toot-button"+namubt+fav+"\"></ons-icon>" +
            "                                <ons-icon icon=\"fa-ellipsis-h\" onclick=\"more("+toot['id']+", "+toot['account']['id']+")\" class=\"toot-button\"></ons-icon>" +
            "                            </div>\n";
    }
    if (mode == "big") {
        var d = new Date(toot['created_at']);
        var date_text = d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+d.getHours()+":"+d.getMinutes();
        bt_big = "<span class='big_date'>" + date_text + "　</span>" +
            "<div class=\"row toot_big_border\">\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-reply\" onclick=\"reply("+toot['id']+", '"+toot["account"]["acct"]+"', '"+toot["visibility"]+"')\" class=\"showtoot-button\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-retweet\" onclick=\"toot_action("+toot['id']+", this, 'big', 'boost')\" class=\"showtoot-button"+boost+"\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-bell\" onclick=\"toot_action("+toot['id']+", this, 'big', 'fav')\" class=\"showtoot-button"+fav+"\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-ellipsis-h\" onclick=\"more("+toot['id']+", "+toot['account']['id']+")\" class=\"showtoot-button\"></ons-icon></div>\n" +
            "                </div>";
    }
    if (note) alert_text = "<p class='alert_text'>"+note+"</p>";
    content = t_text(content);
    buf += "<div class=\"toot"+light+"\" id='post_"+toot['id']+"'>\n" +
        alert_text +
        "                    <div class=\"row\">\n" +
        "                        <div class=\"col-xs-2\">\n" +
        "                            <p><img src=\""+toot['account']['avatar']+"\" class=\"icon-img\" onclick='show_account("+toot['account']['id']+")'/></p>\n" +
        "                        </div>\n" +
        "                        <div class=\"col-xs-9 toot-card-right\"> \n" +
        "                           <div class='"+namucard+"'>" +
        "                            <div class=\"toot-group\">\n" +
        "                                <span onclick='show_account("+toot['account']['id']+")'><b>"+toot['account']['display_name']+"</b> <small>@"+toot['account']['acct']+"</small></span> <span class='date' data-time='" + toot['created_at'] + "'>" +date+ "</span>" +
        "                            </div>\n" +
        content +
        "                            </div> \n" +
        button +
        "                        </div>\n" +
        "                    </div>\n" +
        bt_big +
        "            </div>";

    return buf;
}

function toot_action(id, obj, mode, action_mode) {
    var url = "";
    if (action_mode === "fav") {
        if (localStorage.getItem('knzk_bigfav') == 1 && mode != "big") {
            if (obj.className == "toot-button namu-fav ons-icon fa-bell fa") {
                url = "/favourite";
                obj.className = "toot-button namu-fav fav-active ons-icon fa-bell fa";
            } else {
                url = "/unfavourite";
                obj.className = "toot-button namu-fav ons-icon fa-bell fa";
            }
        } else if (mode == "big") {
            if (obj.className == "showtoot-button ons-icon fa-bell fa") {
                url = "/favourite";
                obj.className = "showtoot-button fav-active ons-icon fa-bell fa";
            } else {
                url = "/unfavourite";
                obj.className = "showtoot-button ons-icon fa-bell fa";
            }
        } else {
            if (obj.className == "toot-button ons-icon fa-bell fa") {
                url = "/favourite";
                obj.className = "toot-button fav-active ons-icon fa-bell fa";
            } else {
                url = "/unfavourite";
                obj.className = "toot-button ons-icon fa-bell fa";
            }
        }
    } else {
        if (mode == "big") {
            if (obj.className == "showtoot-button ons-icon fa-retweet fa") {
                url = "/reblog";
                obj.className = "showtoot-button boost-active ons-icon fa-retweet fa";
            } else {
                url = "/unreblog";
                obj.className = "showtoot-button ons-icon fa-retweet fa";
            }
        } else {
            if (obj.className == "toot-button ons-icon fa-retweet fa") {
                url = "/reblog";
                obj.className = "toot-button boost-active ons-icon fa-retweet fa";
            } else {
                url = "/unreblog";
                obj.className = "toot-button ons-icon fa-retweet fa";
            }
        }
    }
    fetch("https://"+inst+"/api/v1/statuses/"+id+url, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        console.log("OK:"+action_mode);
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
        if (action_mode === "fav") {
            if (localStorage.getItem('knzk_bigfav') == 1 && mode != "big") {
                if (obj.className == "toot-button namu-fav ons-icon fa-bell fa") {
                    obj.className = "toot-button namu-fav fav-active ons-icon fa-bell fa";
                } else {
                    obj.className = "toot-button namu-fav ons-icon fa-bell fa";
                }
            } else if (mode == "big") {
                if (obj.className == "showtoot-button ons-icon fa-bell fa") {
                    obj.className = "showtoot-button fav-active ons-icon fa-bell fa";
                } else {
                    obj.className = "showtoot-button ons-icon fa-bell fa";
                }
            } else {
                if (obj.className == "toot-button ons-icon fa-bell fa") {
                    obj.className = "toot-button fav-active ons-icon fa-bell fa";
                } else {
                    obj.className = "toot-button ons-icon fa-bell fa";
                }
            }
        } else {
            if (mode == "big") {
                if (obj.className == "showtoot-button ons-icon fa-retweet fa") {
                    obj.className = "showtoot-button boost-active ons-icon fa-retweet fa";
                } else {
                    obj.className = "showtoot-button ons-icon fa-retweet fa";
                }
            } else {
                if (obj.className == "toot-button ons-icon fa-retweet fa") {
                    obj.className = "toot-button boost-active ons-icon fa-retweet fa";
                } else {
                    obj.className = "toot-button ons-icon fa-retweet fa";
                }
            }
        }
    });
}

function open_cw(id, btobj) {
    var cw = document.getElementById(id).className;
    if (cw == "invisible") {
        document.getElementById(id).className = "";
        btobj.className = "cw-button " + button;
    } else {
        document.getElementById(id).className = "invisible";
        btobj.className = "cw-button " + light;
    }
}

function reply(id, acct, visibility) {
    tmp_text_pre = "@" + acct + " ";
    tmp_post_reply = id;
    tmp_post_visibility = visibility;
    loadNav('post.html', 'up');
}

function more(id, acctid) {
    more_status_id = id;
    more_acct_id = acctid;
    if (localStorage.getItem('knzk_userid') == more_acct_id) {
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                //'詳細を表示',
                //'返信',
                {
                    label: '削除',
                    modifier: 'destructive'
                },
                {
                    label: 'キャンセル',
                    icon: 'md-close'
                }
            ]
        }).then(function (index) {
            if (index == 0) show('delete-post');
        })
    } else {
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                //'詳細を表示',
                //'返信',
                {
                    label: '通報',
                    modifier: 'destructive'
                },
                {
                    label: 'キャンセル',
                    icon: 'md-close'
                }
            ]
        }).then(function (index) {
            if (index == 0) report();
        })
    }
}

function delete_post() {
    hide('delete-post');
    fetch("https://"+inst+"/api/v1/statuses/"+more_status_id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'DELETE'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        document.getElementById("post_"+more_status_id).innerHTML = "";
        console.log("OK:del");
        showtoast('del-post-ok');
        more_acct_id = 0;
        more_status_id = 0;
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
        more_acct_id = 0;
        more_status_id = 0;
    });
}

function show_post(id) {
    var reshtml = "", d = 0, e = 0;
    loadNav('showtoot.html');
    fetch("https://"+inst+"//api/v1/statuses/"+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-pros');
        }
    }).then(function(json_stat) {
        fetch("https://"+inst+"//api/v1/statuses/"+id+"/context", {
            headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
            method: 'GET'
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                showtoast('cannot-pros');
            }
        }).then(function(json) {
            while (json['ancestors'][d]) {
                reshtml += toot_card(json['ancestors'][d], null, null);
                d++;
            }
            d = 0;

            reshtml += toot_card(json_stat, "big", null);

            while (json['descendants'][d]) {
                reshtml += toot_card(json['descendants'][d], null, null);
                d++;
            }

            document.getElementById("show_toot").innerHTML = reshtml;
        });
    });
}

function report() {
    var rep = ons.notification.prompt('通報の理由を記入してください。').then(function (repcom) {
        fetch("https://"+inst+"/api/v1/reports", {
            headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
            method: 'POST',
            body: JSON.stringify({
                account_id: more_acct_id,
                status_ids: more_status_id,
                comment: repcom
            })
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error();
            }
        }).then(function(json) {
            console.log("OK:rep");
            showtoast('report-post');
            more_acct_id = 0;
            more_status_id = 0;
        }).catch(function(error) {
            showtoast('cannot-pros');
            console.log(error);
            more_acct_id = 0;
            more_status_id = 0;
        });
    });
}