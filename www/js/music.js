function music_set(id,force) {
    var obj = document.getElementById(id);
    var audio = document.getElementById("music-control");
    var mode, churl, fmode;

    if (force === true) {
        if (audio.src) { //再生中
            audio.pause();
            audio.src = "";
            fmode = true;
        }
        if (obj.className !== "ons-icon fa-play fa") {
            mode = 1;
        }
    } else {
        fmode = true;
        if (obj.className === "ons-icon fa-play fa") {
            obj.className = "ons-icon fa-stop fa";
            mode = 1;
        } else {
            obj.className = "ons-icon fa-play fa";
            mode = 0;
        }
    }

    var chmode = document.getElementById("music-form").channel;
    if (chmode.value === "ncs") churl = "http://www.agngaming.com:8000/stream/1/";
    else if (chmode.value === "listen-moe") churl = "https://listen.moe/stream";
    else if (chmode.value === "Poolside-fm") churl = "http://stream.radio.co/s98f81d47e/listen";
    else if (chmode.value === "dubplate-fm") churl = "http://sc2.dubplate.fm:5000/DnB/192";
    else if (chmode.value === "FUTURE-BASS-MIX") churl = "http://stream.zenolive.com/am16uk1f4k5tv";
    else if (chmode.value === "TOP-40-RU") churl = "http://stream.europeanhitradio.com:8000/Stream_35.aac";
    else if (chmode.value === "REMIXES-RU") churl = "http://stream.europeanhitradio.com:8000/Stream_33.aac";
    else if (chmode.value === "danceradiouk") churl = "http://uk2.internet-radio.com:8145/";

    if (mode === 1) {
        audio.src = churl;
        if (fmode) audio.play();
    } else {
        audio.pause();
        audio.src = "";
    }
}