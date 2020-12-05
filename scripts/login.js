//a script to validate all the inputs when they get clicked out
$('input').blur(function(evt) {
    evt.target.checkValidity();
});

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
    }
});

function loginFormLoaded()
{
    $("#errorMessage").hide();
}


function attemptLogin()
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
        {
            inputValidationsPassed++;
            $("#" + item.id).removeClass("invalid");
            $("#" + item.id).removeClass("valid");
            $("#" + item.id).focusin();
            $("#" + item.id).addClass("valid");
        }
        else
        {
            $("#" + item.id).removeClass("invalid");
            $("#" + item.id).removeClass("valid");
            $("#" + item.id).focusin();
            $("#" + item.id).addClass("invalid");
        }
    });

    if(inputValidationsPassed === $('input').length)
    {
        $.ajax({
            type: 'GET',
            url: APIConfig.host + '/user',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa(document.getElementById("username").value + ":" + document.getElementById("password").value));
            },
            success: function (result) {
                window.location.href = "dashboard.html";
            },
            error: function (xhr, status, error)
            {
                $("#errorMessage").show();

                $("#errorMessage").html("");

                if(xhr.status == 401)
                    $("#errorMessage").append("Invalid username or password.");
                else
                    $("#errorMessage").append("An error has occurred. Please try again later.");
            }
        });
    }
}