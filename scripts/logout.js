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
                window.location.href = "login.html";
            }
            else 
            {
                $("#logoutMessage").removeClass("alert-primary");
                $("#logoutMessage").addClass("alert-danger");
                $("#logoutMessage").text("An error has occurred during the log out procedure.");
            }
        }
    });
}