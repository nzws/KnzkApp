function toot_card(toot, mode, note, toot_light) {
    var buf = "", piccard = "", fav = "", boost = "", namucard = "", namubt = "", m = 0, date = "", p = 0, alert_text = "", content = "", button = "", e = 0, bt_big = "", light = "", q = 0, enq_item = "";
    if (toot['reblog']) {
        alert_text = "<p class='alert_text'><ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + toot['account']['id'] + ")'>" + toot['account']['display_name'] + "</b>さんがブーストしました</p>";
        toot = toot['reblog'];
    }
    if (toot['enquete']) {
        toot['enquete'] = JSON.parse(toot['enquete']);
        var enq_comp_date = new Date(new Date().getTime() - new Date(toot['created_at']).getTime());
        var enq_sec = enq_comp_date.getSeconds();
        var enq_sec_comp = toot['enquete']['duration'] - enq_sec;
        if (toot['enquete']['ratios_text']) { //締め切り
            while (toot['enquete']['items'][q]) {
                enq_item += "<div class='progress-bar enq'>\n" +
                    "           <div class='progress-bar__primary' style='width: "+toot['enquete']['ratios'][q]+"%'></div>\n" +
                    "           <div class='text'>"+toot['enquete']['items'][q]+"</div>\n" +
                    "           <div class='text right'>"+toot['enquete']['ratios_text'][q]+"</div>\n" +
                    "       </div>";
                q++;
            }
        } else { //受付中
            if (enq_sec_comp >= 0) { //受付中

            } else { //締め切り（投票トゥート）

            }
        }
        toot['content'] = toot['enquete']['question'] + "<div class=\"toot enq\">"+enq_item+"</div>";
    }
    if (!toot['account']['display_name']) toot['account']['display_name'] = toot['account']['username'];
    if (toot['favourited'] == true) {
        fav = " fav-active";
    }
    if (toot['reblogged'] == true) {
        boost = " boost-active";
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
    if (toot['media_attachments'][0] && (mode == "full" || mode == "big")) {
        while (toot['media_attachments'][p]) {
            if (toot['sensitive']) { //NSFWオン
                piccard += "<a href='"+toot['media_attachments'][p]['url']+"'><ons-card class='nsfw'><h3>回覧注意</h3><small>タップで表示</small></ons-card></a>";
            } else {
                piccard += "<a href='"+toot['media_attachments'][p]['url']+"'><ons-card style='background-image: url("+toot['media_attachments'][p]['preview_url']+")' class='card-image'></ons-card></a>";
            }
            p++;
        }
    }
    date = displayTime('new', toot['created_at']);
    toot['content'] = toot['content'].replace(/<a href="((http:|https:)\/\/[\x21-\x26\x28-\x7e]+)\/media\/([\x21-\x26\x28-\x7e]+)" rel="nofollow noopener" target="_blank"><span class="invisible">(http:|https:)\/\/<\/span><span class="ellipsis">([\x21-\x26\x28-\x7e]+)\/media\/([\x21-\x26\x28-\x7e]+)<\/span><span class="invisible">([\x21-\x26\x28-\x7e]+)<\/span><\/a>/g , "<a href='$1/media/$3' class='image-url'><ons-icon icon='fa-file-image-o'></ons-icon></a>");
    if (toot['spoiler_text']) {
        var rand = Date.now();
        content = toot['spoiler_text'] + "　<ons-button modifier=\"light\" onclick='open_cw(\"cw_"+rand+"_" + toot['id'] + "\", this);' class='cw-button'>もっと見る</ons-button><div class='invisible' id='cw_"+rand+"_" + toot['id'] + "'><p>" + toot['content'] + piccard + "</p></div>";
    } else { //CWなし
        content = toot['content'] + piccard;
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
        var min = "0";
        if (d.getMinutes() < 10) min = "0" + d.getMinutes(); else min = d.getMinutes();
        var date_text = d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+d.getHours()+":"+min;
        bt_big = "<span class='big_date'>" + date_text + "　<ons-icon icon=\"fa-bell\"></ons-icon> "+toot['favourites_count']+"　<ons-icon icon=\"fa-retweet\"></ons-icon> "+toot['reblogs_count']+"</span>" +
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
        "                            </div>" +
        "                            <div class='toot_content' data-id='"+toot['id']+"' data-dispmode='"+mode+"'>" +
        content +
        "                            </div>" +
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