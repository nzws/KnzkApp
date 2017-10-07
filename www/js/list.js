function list(mode, title, more_load, mode_toot) {
    loadNav("olist.html");
    var i = 0, reshtml = "", get = "", link;
    if (more_load) {
        get = "?max_id="+list_old_id;
        more_load.value = "読み込み中...";
        more_load.disabled = true;
    } else {
        loadNav('showtag.html');
    }
    fetch("https://"+inst+"/api/v1/"+mode+get, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            console.log(response.headers.get('Link'));
            link = response.headers.get("link");
            return response.json();
        } else {
            showtoast('cannot-load');
            return false;
        }
    }).then(function(json) {
        if (more_load) {
            more_load.className = "button button--large--quiet invisible";
            reshtml = document.getElementById("olist_main").innerHTML;
        } else {
            document.getElementById("olist_title").innerHTML = title;
        }

        while (json[i]) {
            reshtml += toot_card(json[i], "full", null);
            i++;
        }
        console.log(link);
        //if (i !== 0) list_old_id = link.match(/\?max_id=\d+/);
        reshtml += "<button class='button button--large--quiet' onclick='list(\""+mode+"\", \""+title+"\", this, \""+mode_toot+"\")'>もっと読み込む...</button>";
        document.getElementById("olist_main").innerHTML = reshtml;
        return true;
    });
}