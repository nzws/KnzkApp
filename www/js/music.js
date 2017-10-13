function music_set(id,force) {
    var obj = document.getElementById(id);
    var audio = document.getElementById("music-control");
    var mode, churl;

    if (force === true) {
        if (obj.className !== "ons-icon fa-play fa") {
            mode = 1;
        }
    } else {
        if (obj.className === "ons-icon fa-play fa") {
            obj.className = "ons-icon fa-stop fa";
            mode = 1;
        } else {
            obj.className = "ons-icon fa-play fa";
            mode = 0;
        }
    }


    var chmode = document.getElementsByName("channel");
    console.log(chmode.value);
    if (chmode.value === "ncs") churl = "http://www.agngaming.com:8000/stream/1/";
    else churl = "https://listen.moe/stream";

    if (mode === 1) {
        audio.src = churl;
        if (!force) audio.play();
    } else {
        audio.pause();
        audio.src = "";
    }
}