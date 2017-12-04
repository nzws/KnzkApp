function SearchKey() {
    if (window.event.keyCode==13) SearchLoad();
}

function SearchLoad() {
    loadNav("olist_nav.html", null, true, true);
    var q = document.getElementById("nav-search").value;
    fetch("https://"+inst+"/api/v1/search?q="+q, {
        headers: {'content-type': 'application/json', 'Authorization': 'Bearer '+localStorage.getItem('knzk_account_token')},
        method: 'GET'
    }).then(function(response) {
        if(response.ok) {
            return response.json();
        } else {
            throw new Error();
        }
    }).then(function(json) {
        var reshtml = "", i = 0;
        document.getElementById("olist_nav_title").innerHTML = q+"の検索結果";
        reshtml += "<ons-list><ons-list-header>アカウント</ons-list-header></ons-list>";
        while (json['accounts'][i]) {
            if (!json['accounts'][i]['display_name']) json['accounts'][i]['display_name'] = json['accounts'][i]['username'];
            reshtml += AccountCard(json['accounts'][i]);
            i++;
        }

        i = 0;
        reshtml += "<ons-list><ons-list-header>タグ</ons-list-header></ons-list>";
        while (json['hashtags'][i]) {
            reshtml += "<div onclick='showTagTL(\"" + json['hashtags'][i] + "\")' class=\"toot toot-small\">\n" +
                "    <div class=\"hashtag-card\">\n" +
                "    <span class=\"toot-group\">\n" +
                "      <b>#" + json['hashtags'][i] + "</b>\n" +
                "    </span>\n" +
                "    </div>\n" +
                "</div>";
            i++;
        }

        document.getElementById("olist_nav_main").innerHTML = reshtml;
    }).catch(function(error) {
        showtoast('cannot-pros');
        console.log(error);
    });
}