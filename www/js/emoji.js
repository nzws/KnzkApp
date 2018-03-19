function searchEmoji(query) {
    var els = document.getElementsByClassName("emoji_button");

    if (query) {
        $(".emoji_cate_box").addClass("ep_search_box");
        $(".emoji_button").addClass("invisible");
        $(".ep_cate_title").addClass("invisible");
        $("#ep_search_result_title").removeClass("invisible");
        emoji_search.filter(function(value, index, array) {
            if (value.indexOf(query) !== -1) {
                els[index].className = "emoji_button button button--quiet";
            }
        });
    } else {
        $(".emoji_cate_box").removeClass("ep_search_box");
        $(".emoji_button").removeClass("invisible");
        $(".ep_cate_title").removeClass("invisible");
        $("#ep_search_result_title").addClass("invisible");
    }
}

function renderEmoji(emojiobj) {
    var i = 0, reshtml = "", list = {}, key, customreshtml = "", search = "", s = 0, search_a_custom = [];
    var locale = {
        "Custom": "カスタム絵文字",
        "People": "人々",
        "Nature": "自然",
        "Foods": "食べ物",
        "Activity": "活動",
        "Places": "場所",
        "Objects": "物",
        "Symbols": "記号",
        "Flags": "国旗"
    };
    if (emojiobj.dataset.isload === "no") {
        var xhr = new XMLHttpRequest;
        xhr.onreadystatechange = function() {
            if (this.readyState === 4) {
                emoji_search = [];
                var json = JSON.parse(this.responseText);
                while (json[i]) {
                    if (!list[json[i]["category"]]) list[json[i]["category"]] = "";
                    search = "";
                    search += json[i]["description"];
                    if (json[i]["aliases"][0]) {
                        while (json[i]["aliases"][s]) {
                            search += "/"+json[i]["aliases"][s];
                            s++;
                        }
                    }
                    if (json[i]["tags"][0]) {
                        s = 0;
                        while (json[i]["tags"][s]) {
                            search += "/"+json[i]["tags"][s];
                            s++;
                        }
                    }
                    emoji_search.push(search);
                    list[json[i]["category"]] += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\""+json[i]["emoji"]+"\")' class='ep_bt emoji_button' data-search='"+search+"'>"+twemoji.parse(json[i]["emoji"])+"</ons-button>\n";
                    i++;
                }
                for (key in list) {
                    reshtml += "<div id='emojip_"+key+"' class='emoji_cate_box'><ons-list-title class='ep_cate_title'>"+locale[key]+"</ons-list-title>"+list[key]+"</div>";
                }
                if (!getConfig(1, 'no_custom_emoji')) {
                    fetch("https://"+inst+"/api/v1/custom_emojis", {
                        headers: {'content-type': 'application/json'},
                        method: 'GET',
                    }).then(function(response) {
                        if(response.ok) {
                            return response.json();
                        } else {
                            sendLog("Error/event_toot_emoji", response.json);
                            //カスタム絵文字非対応インスタンス
                            $("#toot_emoji_bt").addClass("invisible");
                        }
                    }).then(function(json) {
                        if (json) {
                            var emoji_mode = getConfig(1, 'no_gif') ? "static_url" : "url";

                            i = 0;
                            while (json[i]) {
                                search_a_custom.push(json[i]["shortcode"]);
                                customreshtml += "<ons-button modifier=\"quiet\" onclick='add_emoji_simple(\" :"+json[i]["shortcode"]+": \")' class='emoji_button'><img draggable=\"false\" class=\"emojione\" src=\""+json[i][emoji_mode]+"\"></ons-button>\n";
                                i++;
                            }
                            emoji_search = search_a_custom.concat(emoji_search);
                            customreshtml = "<div id='emojip_custom' class='emoji_cate_box'><ons-list-title class='ep_cate_title'>"+locale["Custom"]+"</ons-list-title>"+customreshtml+"</div>";
                            emojiobj.innerHTML = "<ons-list-title class='invisible' id='ep_search_result_title'>検索結果</ons-list-title>" + customreshtml + reshtml;
                            emojiobj.dataset.isload = "yes";
                        }
                    });
                } else {
                    emojiobj.innerHTML = reshtml;
                    emojiobj.dataset.isload = "yes";
                }
            }
        };
        xhr.open('GET', 'lib/emoji.json', false);
        xhr.send(null);
    }
}

function jumpEmoji(category) {
    $("[id^=emojip_]").addClass("invisible");
    $("#emojip_"+category).removeClass("invisible");
    $(".ep_category").addClass("ep_category_r");
    $("#emoji_reset").removeClass("invisible");
    $("#emoji_list_popover").scrollTop(0);
}

function resetEmoji() {
    $("[id^=emojip_]").removeClass("invisible");
    $(".ep_category").removeClass("ep_category_r");
    $("#emoji_reset").addClass("invisible");
    $("#emoji_list_popover").scrollTop(0);
}