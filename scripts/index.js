//check if the user is logged in
$.ajax({
    type: 'GET',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    url: APIConfig.host + '/user',
    success: function(result) {
        window.location.href = "dashboard.html";
    },
    error: function(xhr) {
        window.location.href = "login.html";
    }
});