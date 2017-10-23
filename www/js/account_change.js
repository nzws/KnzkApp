function account_change_panel() {
    var music_menu = document.getElementById("music-form");
    var list = document.getElementById("account-list");
    var menu = document.getElementById("menu-list");
    if (list.style.display === "none") {
        list.style.display = "block";
        menu.style.display = "none";
        music_menu.style.display = "none";
    } else {
        list.style.display = "none";
        music_menu.style.display = "none";
        menu.style.display = "block";
    }
}