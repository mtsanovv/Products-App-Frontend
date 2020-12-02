function logoutUser()
{
    $.ajax({
        type: 'GET',
        url: APIConfig.host + '/user',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(":"));
        },
        success: function (result) {
            $("#logoutMessage").text("Log out not successful.");
        },
        error: function (xhr, status, error)
        {
            if(xhr.status == 401)
            {
                setSessionCookie(APIConfig.sessionCookie, "");
                window.location.href = "login.html";
            }
            else 
                $("#logoutMessage").text("An error has occurred during the log out procedure.");
        }
    });
}