function sendLog(name, log) {
    if (getConfig(1, "SendLog") === "1") {
        log = JSON.stringify(log);
        log = log.replace(/Bearer ([a-z0-9].*)/g , "[token masked]");
        console.log("ログ送信");
        if (Raven.isSetup()) {
            Raven.captureMessage(new Error(name), {
                extra: {
                    Response: log
                },
                tags: {
                    version: version,
                    userAgent: navigator.userAgent
                }
            });
        }
    }
}

function Seterrorlog(id, text, data) {
    if (data) {
        document.getElementById(id).innerHTML = JSON.stringify(text);
    } else {
        document.getElementById(id).innerHTML = text;
    }
}