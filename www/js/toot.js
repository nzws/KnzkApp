function toot_card(toot, mode, note, toot_light) {
    var buf = "", piccard = "", fav = "", boost = "", namucard = "", namubt = "", p = 0, alert_text = "", content = "", button = "", e = 0, bt_big = "", light = "", q = 0, enq_item = "";
    var appname;
    try {
        if (!toot['account']['display_name']) toot['account']['display_name'] = toot['account']['username'];
    } catch (e) {
        console.log("error:display_name");
        toot['account']['display_name'] = toot['account']['username'];
    }
    if (toot['reblog']) {
        alert_text = "<p class='alert_text'><ons-icon icon=\"fa-retweet\" class='boost-active'></ons-icon> <b onclick='show_account(" + toot['account']['id'] + ")'>" + toot['account']['display_name'] + "</b>さんがブーストしました</p>";
        toot = toot['reblog'];
    }
    if (toot['enquete']) {
        toot['enquete'] = JSON.parse(toot['enquete']);
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
            var enq_comp_date = new Date(Math.floor(new Date().getTime() / 1000) - Math.floor(new Date(toot['created_at']).getTime() / 1000));
            var enq_sec_comp = toot['enquete']['duration'] - enq_comp_date;
            if (enq_sec_comp >= 0) { //受付中
                while (toot['enquete']['items'][q]) {
                    enq_item += "<div class='progress-bar enq open enquete' onclick='vote_item("+q+", this, \""+toot['id']+"\")'>\n" +
                        "           <div class='text enquete'>"+toot['enquete']['items'][q]+"</div>\n" +
                        "       </div>";
                    q++;
                }
            } else { //締め切り（投票トゥート）
                while (toot['enquete']['items'][q]) {
                    enq_item += "<div class='progress-bar enq close'>\n" +
                        "           <div class='text'>"+toot['enquete']['items'][q]+"</div>\n" +
                        "       </div>";
                    q++;
                }
            }
        }
        toot['content'] = toot['enquete']['question'] + "<div class=\"toot enq\">"+enq_item+"</div>";
    }
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
    if (toot_light === "gold") {
        light = " toot_gold";
    }
    if (toot_light === "light" || toot['visibility'] === "direct") {
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
    try {
        if (toot['media_attachments'][0] && (mode == "full" || mode == "big")) {
            while (toot['media_attachments'][p]) {
                if (toot['sensitive'] && localStorage.getItem('knzk_nsfw') != 1) { //NSFWオン
                    piccard += "<a href='"+toot['media_attachments'][p]['url']+"'><ons-card class='nsfw'><h3>回覧注意</h3><small>タップで表示</small></ons-card></a>";
                } else {
                    piccard += "<a href='"+toot['media_attachments'][p]['url']+"'><ons-card style='background-image: url("+toot['media_attachments'][p]['preview_url']+")' class='card-image'></ons-card></a>";
                }
                p++;
            }
        }
    } catch (e) {
        console.log("error_image");
    }
    date = displayTime('new', toot['created_at']);
    toot['content'] = toot['content'].replace(/<a href="((http:|https:)\/\/[\x21-\x26\x28-\x7e]+)\/media\/([\x21-\x26\x28-\x7e]+)" rel="nofollow noopener" target="_blank"><span class="invisible">(http:|https:)\/\/<\/span><span class="ellipsis">([\x21-\x26\x28-\x7e]+)\/media\/([\x21-\x26\x28-\x7e]+)<\/span><span class="invisible">([\x21-\x26\x28-\x7e]+)<\/span><\/a>/g , "<a href='$1/media/$3' class='image-url'><ons-icon icon='fa-file-image-o'></ons-icon></a>");
    if (toot['spoiler_text'] && localStorage.getItem('knzk_cw') != 1) {
        var rand = Date.now();
        content = toot['spoiler_text'] + "　<ons-button modifier=\"light\" onclick='open_cw(\"cw_"+rand+"_" + toot['id'] + "\", this);' class='cw-button'>もっと見る</ons-button><div class='invisible' id='cw_"+rand+"_" + toot['id'] + "'><p>" + toot['content'] + piccard + "</p></div>";
    } else if (toot['spoiler_text']) { //CW / 常に表示
        content = toot['spoiler_text'] + "<p>" + toot['content'] + piccard + "</p>";
    } else { //CWなし
        content = toot['content'] + piccard;
    }
    if (mode == "full") {
        button =    "                            <div class=\"toot-group\">" +
            "                                <ons-icon icon=\"fa-reply\" onclick=\"reply('"+toot['id']+"', '"+toot["account"]["acct"]+"', '"+toot["visibility"]+"')\" class=\"toot-button\"></ons-icon>" +
            "                                <ons-icon icon=\"fa-retweet\" onclick=\"toot_action('"+toot['id']+"', this, null, 'boost')\" class=\"toot-button"+boost+"\"></ons-icon>\n" +
            "                                <ons-icon icon=\"fa-bell\" onclick=\"toot_action('"+toot['id']+"', this, null, 'fav')\" class=\"toot-button"+namubt+fav+"\"></ons-icon>" +
            "                                <ons-icon icon=\"fa-ellipsis-h\" onclick=\"more('"+toot['id']+"', "+toot['account']['id']+", "+toot['pinned']+", '"+toot["url"]+"')\" class=\"toot-button\"></ons-icon>" +
            "                            </div>\n";
    }

    if (mode == "big") {
        if (toot['application']) appname = "(" + toot['application']['name'] + ")<br>"; else appname = "";
        var d = new Date(toot['created_at']);
        var min = "0";
        if (d.getMinutes() < 10) min = "0" + d.getMinutes(); else min = d.getMinutes();
        var date_text = d.getFullYear()+"年"+(d.getMonth()+1)+"月"+d.getDate()+"日 "+d.getHours()+":"+min;
        bt_big = "<span class='big_date'>"+ appname + date_text + " · <span onclick='list(\"statuses/"+toot['id']+"/reblogged_by\", \"ブーストしたユーザー\", null, \"acct\", true)'><ons-icon icon=\"fa-retweet\"></ons-icon> "+toot['reblogs_count']+"</span> · <span onclick='list(\"statuses/"+toot['id']+"/favourited_by\", \"お気に入りしたユーザー\", null, \"acct\", true)'><ons-icon icon=\"fa-bell\"></ons-icon> "+toot['favourites_count']+"</span></span>" +
            "<div class=\"row toot_big_border\">\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-reply\" onclick=\"reply('"+toot['id']+"', '"+toot["account"]["acct"]+"', '"+toot["visibility"]+"')\" class=\"showtoot-button\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-retweet\" onclick=\"toot_action('"+toot['id']+"', this, 'big', 'boost')\" class=\"showtoot-button"+boost+"\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-bell\" onclick=\"toot_action('"+toot['id']+"', this, 'big', 'fav')\" class=\"showtoot-button"+fav+"\"></ons-icon></div>\n" +
            "                    <div class=\"col-xs-3 showtoot-button\"><ons-icon icon=\"fa-ellipsis-h\" onclick=\"more('"+toot['id']+"', "+toot['account']['id']+", "+toot['pinned']+", '"+toot["url"]+"')\" class=\"showtoot-button\"></ons-icon></div>\n" +
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
        "                                <span onclick='show_account("+toot['account']['id']+")'><b>"+t_text(toot['account']['display_name'])+"</b> <small>@"+toot['account']['acct']+"</small></span> <span class='date' data-time='" + toot['created_at'] + "'>" +date+ "</span>" +
        "                            </div>" +
        "                            <div class='toot_content tootcontent_"+toot['id']+"' data-id='"+toot['id']+"' data-dispmode='"+mode+"'>" +
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

function vote_item(q, obj, id) {
    fetch("https://"+inst+"/api/v1/votes/"+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'POST',
        body: JSON.stringify({
            item_index: q
        })
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-pros');
        }
    }).then(function(json) {
        if (json.valid) {
            showtoast('vote-ok');
        } else {
            showtoast('vote-ng');
        }
        console.log(json);
    });
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
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
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

function pin_set(id, mode) {
    var pin_mode;
    if (mode) pin_mode = "/unpin"; else pin_mode = "/pin";
    fetch("https://"+inst+"/api/v1/statuses/"+id+pin_mode, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'POST'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-pros');
        }
    }).then(function(json) {
        showtoast('ok_conf_2');
    });
}

function more(id, acctid, pin_mode, url) {
    var pin;
    more_status_id = id;
    more_acct_id = acctid;
    if (localStorage.getItem('knzk_userid') == more_acct_id) {
        if (pin_mode === true) pin = "ピン留め解除"; else pin = "ピン留め";
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                '詳細を表示',
                'ブラウザで表示',
                '元のトゥートを表示',
                '近くのトゥートを表示',
                {
                    label: pin,
                    modifier: 'fa-thumb-tack'
                },
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
            if (index == 0) show_post(more_status_id);
            else if (index == 1) window.open(url, "_blank", "enableViewportScale=yes");
            else if (index == 2) disp_before(more_status_id, url);
            else if (index == 3) show_post(more_status_id, true);
            else if (index == 4) pin_set(more_status_id, pin_mode);
            else if (index == 5) show('delete-post');
        })
    } else {
        ons.openActionSheet({
            cancelable: true,
            buttons: [
                '詳細を表示',
                'ブラウザで表示',
                '元のトゥートを表示',
                '近くのトゥートを表示',
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
            if (index == 0) show_post(more_status_id);
            else if (index == 1) window.open(url, "_blank", "enableViewportScale=yes");
            else if (index == 2) disp_before(more_status_id, url);
            else if (index == 3) show_post(more_status_id, true);
            else if (index == 4) report();
        })
    }
}

function delete_post() {
    hide('delete-post');
    fetch("https://"+inst+"/api/v1/statuses/"+more_status_id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'DELETE'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        var card = document.getElementById("post_"+more_status_id);
        card.parentNode.removeChild(card);
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

function show_post(id, near) {
    var reshtml = "", d = 0, i = 0;
    loadNav('showtoot.html');
    fetch("https://"+inst+"//api/v1/statuses/"+id, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            showtoast('cannot-pros');
        }
    }).then(function(json_stat) {
        if (near) {
            i = 0;
            reshtml += toot_card(json_stat, "big", null, "gold");
            fetch("https://"+inst+"/api/v1/timelines/public?local=true&limit=10&max_id="+id, {
                headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
                method: 'GET'
            }).then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    showtoast('cannot-load');
                    return false;
                }
            }).then(function(json_shita) {
                while (json_shita[i]) {
                    reshtml += toot_card(json_shita[i], "full", null);
                    i++;
                }
                document.getElementById("show_toot").innerHTML = reshtml;
            });
        } else {
            fetch("https://"+inst+"//api/v1/statuses/"+id+"/context", {
                headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
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
        }
    });
}

function report() {
    var rep = ons.notification.prompt('通報のコメントを記入してください<br>(空欄でキャンセル)', {title: '通報'}).then(function (repcom) {
        if (repcom) {
            fetch("https://"+inst+"/api/v1/reports", {
                headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
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
        }
    });
}

function disp_before(id, url) {
    fetch(url, {
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.text();
        } else {
            throw new Error();
        }
    }).then(function(text) {
        var t = text.match(/content="(.*)" property="og:description"/);
        var i = 0;
        var card = document.getElementsByClassName("tootcontent_"+id);

        while (card[i]) {
            if (card[i].innerHTML.indexOf("<pre class='disp_before'>") == -1) {
                card[i].innerHTML = card[i].innerHTML + "<pre class='disp_before'>" + t[1] + "</pre>";
            }
            i++;
        }
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}
