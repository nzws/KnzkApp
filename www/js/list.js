function list(mode, title, more_load, mode_toot, navmode) {
        if (navmode === true) {
            $.when(
                document.querySelector('#navigator').bringPageTop("olist_nav.html", {animation: "slide"})
            ).done(function () {
                list_n(mode, title, more_load, mode_toot, true)
            });
        } else {
            var menu = document.getElementById('splitter-menu');
            $.when(
                document.querySelector('#navigator').resetToPage("olist.html", {animation: "none"}).then(menu.close.bind(menu))
            ).done(function () {
                list_n(mode, title, more_load, mode_toot)
            });
        }
}

function list_n(mode, title, more_load, mode_toot, navmode) {
    var i = 0, reshtml = "", get = "", pin;
    var id_title, id_main;
    if (more_load) {
        get = "?"+list_old_id;
        more_load.value = "読み込み中...";
        more_load.disabled = true;
    }
    if (mode === "pin") {
        pin = true;
        mode = "/accounts/" + localStorage.getItem('knzk_userid') + "/statuses?pinned=true";
    }
    if (navmode === true) {
        id_title = "olist_nav_title";
        id_main = "olist_nav_main";
    } else {
        id_title = "olist_title";
        id_main = "olist_main";
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 304) {
                var json = JSON.parse(xhr.responseText);
                if (more_load) {
                    more_load.className = "button button--large--quiet invisible";
                    reshtml = document.getElementById(id_main).innerHTML;
                } else {
                    document.getElementById(id_title).innerHTML = title;
                }

                while (json[i]) {
                    if (mode_toot === "toot") {
                        reshtml += toot_card(json[i], "full", null);
                    } else if (mode_toot === "acct") {
                        if (!json[i]['display_name']) json[i]['display_name'] = json[i]['username'];

                        if (localStorage.getItem('knzk_acct_list_small') == 1) {
                            reshtml += "<div onclick='show_account(" + json[i]['id'] + ")' class=\"toot toot-small\">\n" +
                                "    <img src=\"" + json[i]['avatar'] + "\" class=\"icon-img-small\" align=\"middle\">\n" +
                                "    <span class=\"toot-group toot-card-right\">\n" +
                                "      <b>" + json[i]['display_name'] + "</b> <small>@" + json[i]['acct'] + "</small>\n" +
                                "    </span>\n" +
                                "</div>";
                        } else {
                            reshtml += "<div class=\"toot\" onclick='show_account(" + json[i]['id'] + ")'>\n" +
                                "                    <div class=\"row\">\n" +
                                "                        <div class=\"col-xs-2\">\n" +
                                "                            <p><img src=\"" + json[i]['avatar'] + "\" class=\"icon-img\"></p>\n" +
                                "                        </div>\n" +
                                "                        <div class=\"col-xs-9 toot-card-right\">\n" +
                                "                            <div class=\"toot-group\">\n" +
                                "                                <h3><b>" + json[i]['display_name'] + "</b></h3><small>@" + json[i]['acct'] + "</small>\n" +
                                "                            </div>\n" +
                                "                        </div>\n" +
                                "                    </div>\n" +
                                "            </div>";
                        }
                    }
                    i++;
                }
                if (i !== 0 && xhr.getResponseHeader("link").indexOf("max_id") !== -1)
                    list_old_id = xhr.getResponseHeader("link").match(/max_id=\d+/);
                else
                    list_old_id = "";

                if (pin === true) mode = "pin";
                if (list_old_id !== "")
                    reshtml += "<button class='button button--large--quiet' onclick='list_n(\""+mode+"\", \""+title+"\", this, \""+mode_toot+"\")'>もっと読み込む...</button>";
                document.getElementById(id_main).innerHTML = reshtml;
                return true;
            } else {
                showtoast('cannot-load');
                return false;
            }
        }
    };
    xhr.open('GET', "https://"+inst+"/api/v1/"+mode+get, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer '+localStorage.getItem('knzk_login_token'));
    xhr.send();
}
