function post_cw() {
    var cw_input = document.getElementById("cw_input");
    var cwicon = document.getElementById("cw_bt");

    if (cw_input.style.display == "block") { //CW オン→オフ
        cw_input.style.display = "none";
        cw_input.value = "";
        cwicon.className = quiet;
    } else { //CW オフ→オン
        cw_input.style.display = "block";
        cwicon.className = button;
    }
}

function post_vote() {
    var cw_input = document.getElementById("vote_new_list");
    var cwicon = document.getElementById("vote_bt");

    if (cw_input.style.display == "block") { //vote オン→オフ
        cw_input.style.display = "none";
        document.getElementById("vote_new_1").value = "";
        document.getElementById("vote_new_2").value = "";
        document.getElementById("vote_new_3").value = "";
        document.getElementById("vote_new_4").value = "";
        document.getElementById("vote_new_time").value = "30";
        cwicon.className = quiet;
    } else { //vote オフ→オン
        cw_input.style.display = "block";
        cwicon.className = button;
    }
}

function up_file(simple) {
    var simple_id = "";
    if (simple) image_mode = simple_id = "_simple"; else image_mode = simple_id = "";
    var card = document.getElementsByClassName("media-upload"+simple_id);
    if (card.length >= 4) {
        showtoast("maximum-media");
    } else {
        var file = $('#post_file'+simple_id)[0].files[0];
        var fileReader = new FileReader();
        fileReader.onloadend = function (e) {
            var arrayBuffer = e.target.result;
            blobUtil.arrayBufferToBlob(arrayBuffer, file.type).then(function (blob) {
                up_file_suc(null, blob);
                $('#post_file'+simple_id).val("");
            }).catch(console.log.bind(console));
        };
        fileReader.readAsArrayBuffer(file);
    }
}

function up_file_suc(base64, mode_blob) {
    var blob;
    if (base64 || mode_blob) {
        show('now_loading');
        if (base64) {
            var binary = atob(base64);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            blob = new Blob([new Uint8Array(array)], {type: 'image/png'});
        } else if (mode_blob) {
            blob = mode_blob;
        }

        var formData = new FormData();
        formData.append('file', blob);

        fetch("https://"+inst+"/api/v1/media", {
            headers: {'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
            method: 'POST',
            body: formData
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                sendLog("Error/media", response);
                throw new Error();
            }
        }).then(function(json) {
            if (json) {
                if (json["id"] && json["type"] !== "unknown") {
                    document.getElementById("image_list"+image_mode).innerHTML = "<ons-card onclick=\"file_del(this)\" style='background-image: url("+json["preview_url"]+")' class='card-image media-upload"+image_mode+"' data-mediaid='"+json["id"]+"'></ons-card>" + document.getElementById("image_list"+image_mode).innerHTML;
                    image_mode = "";
                    hide('now_loading');
                } else {
                    hide('now_loading');
                    showtoast('cannot-pros');
                }
            }
        }).catch(function(error) {
            showtoast('cannot-pros');
            console.log(error);
            hide('now_loading');
        });
    }
}

function file_del(card) {
    ons.notification.confirm('画像を削除してもよろしいですか？').then(function (e) {
        if (e === 1) {
            card.parentNode.removeChild(card);
        }
    });
}

function post_nsfw(simple) {
    var simple_id = "";
    if (simple) simple_id = "_simple";
    var cw_input = document.getElementById("nsfw_input"+simple_id);
    var cwicon = document.getElementById("nsfw_bt"+simple_id);

    if (simple) {
        if (cwicon.className == button + " w-max") { //選択済み→解除
            cw_input.value = "";
            cwicon.className = quiet;
        } else {
            cw_input.value = "1";
            cwicon.className = button + " w-max";
        }
    } else {
        if (cwicon.className == button) { //CW オン→オフ
            cw_input.value = "";
            cwicon.className = quiet;
        } else { //CW オフ→オン
            cw_input.value = "1";
            cwicon.className = button;
        }
    }
}

function post_localonly(simple) {
    var simple_id = "";
    if (simple) simple_id = "_simple";
    var cw_input = document.getElementById("localonly_input"+simple_id);
    var cwicon = document.getElementById("localonly_bt"+simple_id);

    if (cwicon.className == button) { //選択済み→解除
        cw_input.value = "";
        if (simple)
            cwicon.className = quiet + " no-rd";
        else
            cwicon.className = quiet;
    } else {
        cw_input.value = "1";
        cwicon.className = button;
    }
}

function post_mode(simple) {
    var simple_id = "";
    if (simple) simple_id = "_simple";
    var input_obj = document.getElementById("post_mode"+simple_id);
    var bt_obj = document.getElementById("post_mode_icon"+simple_id);
    var icon_base = "ons-icon fa-fw fa fa-";

    ons.openActionSheet({
        cancelable: true,
        buttons: [
            {label: '公開', icon: 'fa-globe'},
            {label: '未収載', icon: 'fa-unlock-alt'},
            {label: '非公開', icon: 'fa-lock'},
            {label: 'ダイレクト', icon: 'fa-envelope'},
            {
                label: 'キャンセル',
                icon: 'md-close'
            }
        ]
    }).then(function (index) {
        if (index == 0) {
            input_obj.value = "public";
            bt_obj.className = icon_base+"globe";
        } else if (index == 1) {
            input_obj.value = "unlisted";
            bt_obj.className = icon_base+"unlock-alt";
        } else if (index == 2) {
            input_obj.value = "private";
            bt_obj.className = icon_base+"lock";
        } else if (index == 3) {
            input_obj.value = "direct";
            bt_obj.className = icon_base+"envelope";
        }
    });
}


function check_limit(value, id, tb_id, cw_id) {
    var limit = 0;
    if (cw_id) {
        var cw = document.getElementById(cw_id).value;
        limit = toot_limit - value.length - cw.length;
    } else {
        limit = toot_limit - value.length;
    }
    document.getElementById(id).innerHTML = limit;
    if (limit < 0) {
        document.getElementById(id).setAttribute('style', 'color: red');
    } else {
        document.getElementById(id).setAttribute('style', '');
    }
}

function show_bbcodegen(id, limit, button) {
    tmp_bbcode_limit = limit;
    tmp_bbcode_tootbutton = button;
    tmp_bbcode_id = id;
    tmp_post_text = document.getElementById(id).value;
    loadNav("bbcode.html");
}

function bbcodegen(force) {
    var text = document.getElementById("bbcode_text").value;
    var base = document.getElementById("bbcode_base").value;
    var color = document.getElementById("bbcode_color").value;
    var large = document.getElementById("bbcode_large").value;
    var spin = parseInt(document.getElementById("bbcode_spin").value);
    var pulse = parseInt(document.getElementById("bbcode_pulse").value);
    var pre = "", suf = "", buf = "", value = "";
    if (spin > 9 && !force) {
        ons.notification.confirm('回転を多く指定すると、TLが重くなる原因となり、警告を受ける可能性があります。続行しますか？', {title: '注意:TLが重くなります'}).then(function (e) {
            if (e === 1) {
                bbcodegen(true);
            }
        });
    } else {
        if (spin) {
            for (var i = 0; i < spin; i++) {
                pre += "[spin]";
                suf = "[/spin]" + suf;
            }
        }
        if (base) {
            pre += "["+base+"]";
            suf = "[/"+base+"]" + suf;
        }
        if (color) {
            pre += "[colorhex="+color+"]";
            suf = "[/colorhex]" + suf;
        }
        if (pulse) {
            for (var p = 0; p < pulse; p++) {
                pre += "[pulse]";
                suf = "[/pulse]" + suf;
            }
        }

        if (large) {
            /* sizeは潰れた
            large = large * 16;
            pre += "[size="+large+"]";
            suf = "[/size]" + suf;
            */
            pre += "[large="+large+"x]";
            suf = "[/large]" + suf;
        }
        buf = pre + text + suf;
        value = tmp_post_text + buf;
        var limit = toot_limit - value.length;
        if (limit < 0) {
            showtoast('bbcode-limit');
        } else {
            document.querySelector('#navigator').popPage();
            document.getElementById(tmp_bbcode_id).value = value;
            check_limit(value, tmp_bbcode_limit, tmp_bbcode_tootbutton);
        }
    }
}

function bbcode_color(color) {
    BackTab();
    var color_s = "#" + color;
    if (color_mode) {
        var d_box = document.getElementById("doodle-color-box-mini");
        if (color) {
            doodle_old_color = color_s;
            sketcher.color = color_s;
            d_box.style.backgroundColor = color_s;
        } else {
            sketcher.color = color_s;
            d_box.style.backgroundColor = "#000000";
        }
    } else {
        var b_color = document.getElementById("bbcode_color");
        var b_box = document.getElementById("color-box-mini");
        if (color) {
            b_color.value = color;
            b_box.style.backgroundColor = color_s;
        } else {
            b_color.value = "";
            b_box.style.backgroundColor = "";
        }
    }
}

function post(id, option, simple) {
    var media_id = Array(), i, simple_id = "", optiondata = {
        status: document.getElementById(id).value,
        visibility: option.visibility
    };
    if (simple) {
        simple_close();
        show('post_now');
        simple_id = "_simple";
    } else
        show('now_loading');

    var media = document.getElementsByClassName("media-upload"+simple_id);

    var vote1 = document.getElementById("vote_new_1"+simple_id).value;
    var vote2 = document.getElementById("vote_new_2"+simple_id).value;
    var vote3 = document.getElementById("vote_new_3"+simple_id).value;
    var vote4 = document.getElementById("vote_new_4"+simple_id).value;
    var votem = document.getElementById("vote_new_time"+simple_id).value;

    if (vote1 != "" && vote2 != "") {
        optiondata.isEnquete = true;
        optiondata.enquete_duration = parseInt(votem);
        optiondata.enquete_items = [vote1, vote2, vote3, vote4];
    }
    if (option.cw) {
        optiondata.spoiler_text = option.cw;
    }
    if (option.local_only) {
        optiondata.status += " 👁️";
    }
    if (option.sensitive && media[0]) {
        optiondata.sensitive = true;
    }
    if (option.in_reply_to_id) {
        optiondata.in_reply_to_id = option.in_reply_to_id;
    }
    if (media[0]) {
        i = 0;
        while (media[i]) {
            media_id[i] = media[i].dataset.mediaid;
            i++;
        }
        optiondata.media_ids = media_id;
    }
    fetch("https://"+inst+"/api/v1/statuses", {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzkapp_now_mastodon_token')},
        method: 'POST',
        body: JSON.stringify(optiondata)
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            sendLog("Error/post", response);
            throw new Error();
        }
    }).then(function(json) {
        if (json["id"]) {
            if (simple) {
                $("#simple_toot_form").find("textarea, input, select").val("").end().find(":checked").prop("checked", false);
                $("#simple_vote").find("textarea, input, select").val("").end().find(":checked").prop("checked", false);
                $("#simple_toot_cw").val("");
                check_limit(document.getElementById("simple_toot_TL_input").value, 'toot_limit_simple', 'toot-button_simple', 'simple_toot_cw');
                document.getElementById("image_list_simple").innerHTML = "";
                $("#post_mode_simple").val(default_post_visibility);
                document.getElementById("post_mode_icon_simple").className = "ons-icon fa-fw fa fa-"+visibility_name(default_post_visibility);
                hide('post_now');
            } else {
                hide('now_loading');
                BackTab('down');
            }
        } else {
            showtoast('cannot-post');
            if (simple) hide('post_now');
            else hide('now_loading');
        }
    }).catch(function(error) {
        showtoast('cannot-post');
        console.log(error);
        if (simple) hide('post_now');
        else hide('now_loading');
    });
}

function simple_open() {
    if (!instance_config[inst]["enquete"]) $("#vote_bt_simple").addClass("invisible");
    if (!instance_config[inst]["bbcode"]) $("#bbcode_bt_simple").addClass("invisible");
    if (!instance_config[inst]["enquete_duration"]) $("#vote_new_time_simple").addClass("invisible");
    if (!instance_config[inst]["glitch_soc"]) $("#localonly_bt_simple").addClass("invisible");
    if (!instance_config[inst]["markdown"]) $("#md_note_simple").addClass("invisible");

    document.getElementById("simple_toot_TL_input").rows = 3;
    $("#simple_toot_TL_toolbar").addClass("simple_toot_open");
    $("#simple_more").removeClass("invisible");

    $("#dial_main").addClass("fab_simple_toot_open");
    $("#dial_TL").addClass("fab_simple_toot_open");
    var emoji = document.getElementById("emoji_list_popover"), i = 0, reshtml = "";
    if (emoji.dataset.isload === "no" && !getConfig(1, 'no_custom_emoji')) {
        fetch("https://"+inst+"/api/v1/custom_emojis", {
            headers: {'content-type': 'application/json'},
            method: 'GET',
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                //カスタム絵文字非対応インスタンス
                $("#simple_emoji_bt").addClass("invisible");
                sendLog("Error/simple_open_emoji", response);
            }
        }).then(function(json) {
            if (json) {
                var emoji_mode = getConfig(1, 'no_gif') ? "static_url" : "url";

                while (json[i]) {
                    reshtml += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\" :"+json[i]["shortcode"]+": \")'><img draggable=\"false\" class=\"emojione\" src=\""+json[i][emoji_mode]+"\"></ons-button>\n";
                    i++;
                }
                emoji.innerHTML = reshtml;
                emoji.dataset.isload = "yes";
            }
        });
    }
}

function simple_close() {
    document.getElementById("simple_toot_TL_input").rows = 1;
    $("#simple_toot_TL_toolbar").removeClass("simple_toot_open");
    $("#simple_more").addClass("invisible");

    $("#dial_main").removeClass("fab_simple_toot_open");
    $("#dial_TL").removeClass("fab_simple_toot_open");
}

function add_emoji_simple(addtext, mode) {
    // https://qiita.com/noraworld/items/d6334a4f9b07792200a5
    var id = "simple_toot_TL_input";
    if (mode) id = "toot_textarea";
    var textarea = document.getElementById(id);
    var sentence = textarea.value;
    var len      = sentence.length;
    var pos      = textarea.selectionStart;
    var before   = sentence.substr(0, pos);
    var word     = addtext;
    var after    = sentence.substr(pos, len);
    sentence = before + word + after;
    textarea.value = sentence;
    hidePopover('emoji_popover');
}