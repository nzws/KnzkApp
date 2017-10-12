function music_set(obj) {
    var audio = document.getElementById("music-control");
    var bt = obj.checked;
    var mode;

    if (isios) { //iOS
        if (bt == true) mode = 0;
        else mode = 1;
    } else {
        if (bt == true) mode = 1;
        else mode = 2;
    }

    if (mode === 1) {
        audio.src = "http://www.agngaming.com:8000/stream/1/";
        audio.play();
    } else {
        audio.pause();
        audio.src = "";
    }
}