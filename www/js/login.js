function login_open() {
    loginref = cordova.InAppBrowser.open('https://'+inst+'/oauth/authorize?response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=read+write+follow&client_id='+knzkcid, '_blank', 'location=no');
    loginref.addEventListener('loadstop', login_callback);
}

function login_callback(params) {
    if (params.url.indexOf("https://"+inst+"/oauth/authorize/") != -1) {
        var code = params.url.match(/[^/]+$/i);
        if (code[0]) {
            loginref.close();
            show('now_loading');
            fetch("https://"+inst+"/oauth/token", {
                mode: 'cors',
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({
                    scope: 'read write follow',
                    client_id: knzkcid,
                    client_secret: knzkscr,
                    grant_type: 'authorization_code',
                    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
                    code: code[0]
                })
            }).then(function(response) {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error();
                }
            }).then(function(json) {
                localStorage.setItem('knzk_login_token',json.access_token);

                fetch("https://"+inst+"/api/v1/accounts/verify_credentials", {
                    mode: 'cors',
                    headers: {'Authorization': 'Bearer '+localStorage.getItem('knzk_login_token')}
                }).then(function(response) {
                    if(response.ok) {
                        return response.json();
                    } else {
                        throw new Error();
                    }
                }).then(function(json) {
                    console.log(json);
                    localStorage.setItem('knzk_username',json.acct);
                    localStorage.setItem('knzk_userid',json.id);
                    hide('now_loading');
                    init();
                    showtoast('loggedin_dialog');
                }).catch(function(error) {
                    show('cannot-connect-sv');
                    console.log(error);
                    hide('now_loading');
                });
            }).catch(function(error) {
                show('cannot-connect-sv');
                console.log(error);
                hide('now_loading');
            });
        } else {
            loginref.close();
            show('cannot-get-code');
        }
    }
}


function logout() {
    hide('logout_dialog');
    localStorage.clear();
    init();
    showtoast('loggedout_dialog');
}