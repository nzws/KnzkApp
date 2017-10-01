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

function up_file() {
    if (media_id[4]) {
        showtoast("maximum-media");
    } else {
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
        show('now_loading');

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
                media_id[media_num] = json["id"];
                document.getElementById("nsfw_bt").className = quiet;
                document.getElementById("image_list").innerHTML = "<ons-card onclick=\"file_del(" + media_num + ", 'media_"+json["id"]+"')\" style='background-image: url("+json["preview_url"]+")' class='card-image' id='media_"+json["id"]+"'></ons-card>" + document.getElementById("image_list").innerHTML;
                media_num++;
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

function file_del(id, card) {
    tmp_media_del_obj = card;
    tmp_media_del_id = id;
    show('media-del');
}

function file_del_suc() {
    var card = document.getElementById(tmp_media_del_obj);
    card.parentNode.removeChild(card);

    if (tmp_media_del_id === 0) {
        media_id.shift();
    } else {
        media_id.splice(tmp_media_del_id-1, 1);
    }
    media_num--;
    tmp_media_del_id = 0;
    tmp_media_del_obj = null;
    hide('media-del');
}

function file_error(msg) {
    console.log(msg);
}

function post_nsfw() {
    var cw_input = document.getElementById("nsfw_input");
    var cwicon = document.getElementById("nsfw_bt");

    if (cwicon.className == button) { //選択済み→解除
        cw_input.value = "";
        cwicon.className = quiet;
    } else {
        cw_input.value = "1";
        cwicon.className = button;
    }
}

function post_mode() {
    var input_obj = document.getElementById("post_mode");
    var bt_obj = document.getElementById("post_mode_bt");

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
    var limit = 500 - value.length;
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

function post(id, mode, option) {
    show('now_loading');
    console.log(option);
    if (!option.cw) {
        option.cw = "";
    }
    if (option.sensitive && option.media_ids) {
        option.cw = true;
    }
    if (!option.in_reply_to_id) {
        option.in_reply_to_id = "";
    }
    if (!media_id[0]) {
        media_id = "";
    }
    fetch("https://"+inst+"/api/v1/statuses", {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'POST',
        body: JSON.stringify({
            status: document.getElementById(id).value,
            spoiler_text: option.cw,
            visibility: option.visibility,
            in_reply_to_id: option.in_reply_to_id,
            media_ids: media_id
        })
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        hide('now_loading');
        //document.querySelector('#navigator').resetToPage('init.html');
        BackTab('down');
        showTL(null, null, null, true);
        media_id = Array();
        media_num = 0;
    }).catch(function(error) {
        showtoast('cannot-post');
        console.log(error);
        hide('now_loading');
    });
}