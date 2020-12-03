//check if the user is logged in
$.ajax({
    type: 'GET',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    url: APIConfig.host + '/user',
    error: function(xhr) {
        if(xhr.status == 401)
            window.location.href = "login.html";
    }
});