function startWatching() {
  if (Notification_ws) {
    try {Notification_ws.close()} catch (e) {}
    Notification_ws = null;
  }
  if (!getConfig(1, 'no_unread_label')) {
    Notification_ws = new WebSocket("wss://" + inst + "/api/v1/streaming/?access_token=" + localStorage.getItem('knzkapp_now_mastodon_token') + "&stream=user");
    Notification_ws.onopen = function () {
      Notification_ws.onmessage = function (message) {
        var ws_resdata = JSON.parse(message.data);

        if (ws_resdata.event === "notification") {
          Notification_num++;
          var noti = $(".noti_unread");
          noti.removeClass("invisible");
          noti.html(Notification_num);
        }
      };
    };
  }
}

function resetLabel() {
  var noti = $(".noti_unread");
  noti.addClass("invisible");
  Notification_num = 0
}