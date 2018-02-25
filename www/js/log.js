function sendLog(name, log) {
    if (getConfig(1, "SendLog") === "1") {
        console.log("ログ送信");
        let data = JSON.stringify(log);
        if (localStorage.getItem('knzkapp_now_mastodon_token')) {
            data = data.replace(new RegExp(localStorage.getItem('knzkapp_now_mastodon_token'),"g"),"[token masked]");
        }
        window.FirebasePlugin.logEvent(name, {data: data});
    }
}

function Seterrorlog(id, text, data) {
    if (data) {
        document.getElementById(id).innerHTML = JSON.stringify(text);
    } else {
        document.getElementById(id).innerHTML = text;
    }
}