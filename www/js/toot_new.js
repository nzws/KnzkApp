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
    if (simple) image_mode = simple_id = "_simple";
    var card = document.getElementsByClassName("media-upload"+simple_id);
    if (card.length >= 4) {
        showtoast("maximum-media");
    } else {
        show('now_loading');
        navigator.camera.getPicture(up_file_suc, file_error,
            { quality: 100,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                encodingType: 1
            });
    }
}

function up_file_suc(base64) {
    if (base64) {
        var binary = atob(base64);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        var blob = new Blob([new Uint8Array(array)], {type: 'image/png'});

        var formData = new FormData();
        formData.append('file', blob);

        fetch("https://"+inst+"/api/v1/media", {
            headers: {'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
            method: 'POST',
            body: formData
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                throw new Error();
            }
        }).then(function(json) {
            if (json["id"] && json["preview_url"] != "https://knzk.me/files/small/missing.png") {
                document.getElementById("nsfw_bt"+image_mode).className = "no-rd "+quiet;
                document.getElementById("image_list"+image_mode).innerHTML = "<ons-card onclick=\"file_del(this)\" style='background-image: url("+json["preview_url"]+")' class='card-image media-upload"+image_mode+"' data-mediaid='"+json["id"]+"'></ons-card>" + document.getElementById("image_list"+image_mode).innerHTML;
                image_mode = "";
                hide('now_loading');
            } else {
                hide('now_loading');
                showtoast('cannot-pros');
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

function file_error(msg) {
    console.log(msg);
}

function post_nsfw(simple) {
    var simple_id = "";
    if (simple) simple_id = "_simple";
    var cw_input = document.getElementById("nsfw_input"+simple_id);
    var cwicon = document.getElementById("nsfw_bt"+simple_id);

    if (cwicon.className == button) { //選択済み→解除
        cw_input.value = "";
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
    var bt_obj = document.getElementById("post_mode_bt"+simple_id);

    ons.openActionSheet({
        cancelable: true,
        buttons: [
            {label: '公開', icon: 'fa-globe'},
            {label: '非収載', icon: 'fa-unlock-alt'},
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
            bt_obj.innerHTML = "公開";
        } else if (index == 1) {
            input_obj.value = "unlisted";
            bt_obj.innerHTML = "非収載";
        } else if (index == 2) {
            input_obj.value = "private";
            bt_obj.innerHTML = "非公開";
        } else if (index == 3) {
            input_obj.value = "direct";
            bt_obj.innerHTML = "ダイレクト";
        }
    });
}


function check_limit(value, id, tb_id, cw_id) {
    var limit = 0;
    if (cw_id) {
        var cw = document.getElementById(cw_id).value;
        limit = 4096 - value.length - cw.length;
    } else {
        limit = 4096 - value.length;
    }
    document.getElementById(id).innerHTML = limit;
    if (limit < 0) {
        document.getElementById(id).setAttribute('style', 'color: red');
        document.getElementById(tb_id).disabled = "true";
    } else {
        document.getElementById(id).setAttribute('style', '');
        document.getElementById(tb_id).disabled = "";
    }
}

function show_bbcodegen(id, limit, button) {
    tmp_bbcode_limit = limit;
    tmp_bbcode_tootbutton = button;
    tmp_bbcode_id = id;
    tmp_post_text = document.getElementById(id).value;
    loadNav("bbcode.html");
}

function bbcodegen() {
    var text = document.getElementById("bbcode_text").value;
    var base = document.getElementById("bbcode_base").value;
    var color = document.getElementById("bbcode_color").value;
    var large = document.getElementById("bbcode_large").value;
    var spin = parseInt(document.getElementById("bbcode_spin").value);
    var pulse = parseInt(document.getElementById("bbcode_pulse").value);
    var pre = "", suf = "", buf = "", value = "";
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
    var limit = 4096 - value.length;
    if (limit < 0) {
        showtoast('bbcode-limit');
    } else {
        document.querySelector('#navigator').popPage();
        document.getElementById(tmp_bbcode_id).value = value;
        check_limit(value, tmp_bbcode_limit, tmp_bbcode_tootbutton);
    }
}

function bbcode_color(color) {
    BackTab();
    if (color) {
        document.getElementById("bbcode_color").value = color;
        document.getElementById("color-box-mini").style.backgroundColor = "#" + color;
    } else {
        document.getElementById("bbcode_color").value = "";
        document.getElementById("color-box-mini").style.backgroundColor = "";
    }
}

function post(id, option, simple) {
    var media_id = Array(), i, simple_id = "", optiondata = {
        status: document.getElementById(id).value,
        visibility: option.visibility
    };
    if (simple) {
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
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'POST',
        body: JSON.stringify(optiondata)
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        if (json["id"]) {
            if (simple) {
                $("#simple_toot_form").find("textarea, input, select").val("").end().find(":checked").prop("checked", false);
                $("#simple_vote").find("textarea, input, select").val("").end().find(":checked").prop("checked", false);
                $("#simple_toot_cw").val("");
                $("#post_mode_simple").val("public");
                simple_close();
                check_limit(document.getElementById("simple_toot_TL_input").value, 'toot_limit_simple', 'toot-button_simple', 'simple_toot_cw');
                document.getElementById("post_mode_bt_simple").innerHTML = "公開";
                document.getElementById("image_list_simple").innerHTML = "";
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
        showTL(null, null, null, true);
    }).catch(function(error) {
        showtoast('cannot-post');
        console.log(error);
        if (simple) hide('post_now');
        else hide('now_loading');
    });
}

function simple_open() {
    document.getElementById("simple_toot_TL_input").rows = 3;
    $("#simple_toot_TL_toolbar").addClass("simple_toot_open");
    $("#simple_more").removeClass("invisible");

    $("#dial_main").addClass("fab_simple_toot_open");
    $("#dial_TL").addClass("fab_simple_toot_open");
    var emoji = document.getElementById("emoji_list_popover"), i = 0, reshtml = "";
    if (emoji.innerHTML == "load") {
        fetch("https://"+inst+"/api/v1/custom_emojis", {
            headers: {'content-type': 'application/json'},
            method: 'GET',
        }).then(function(response) {
            if(response.ok) {
                return response.json();
            } else {
                showtoast('cannot-pros');
            }
        }).then(function(json) {
            while (json[i]) {
                reshtml += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\""+json[i]["shortcode"]+"\")'><img draggable=\"false\" class=\"emojione\" src=\""+json[i]["url"]+"\"></ons-button>\n";
                i++;
            }
            emoji.innerHTML = reshtml;
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

function add_emoji_simple(addtext) {
    // https://qiita.com/noraworld/items/d6334a4f9b07792200a5
    var textarea = document.getElementById("simple_toot_TL_input");
    var sentence = textarea.value;
    var len      = sentence.length;
    var pos      = textarea.selectionStart;
    var before   = sentence.substr(0, pos);
    var word     = " :" + addtext + ": ";
    var after    = sentence.substr(pos, len);
    sentence = before + word + after;
    textarea.value = sentence;
    hidePopover('emoji_popover');
}