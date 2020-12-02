//a script to validate all the inputs when they get clicked out
$('input').blur(function(evt) {
    evt.target.checkValidity();
});

//redirect to the dashboard if the user is logged in
if(getCookie(APIConfig.sessionCookie))
    window.location.href = "dashboard.html";


function attemptLogin()
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
            inputValidationsPassed++;
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
                setSessionCookie(APIConfig.sessionCookie, "true");
                window.location.href = "dashboard.html"
            },
            error: function (xhr, status, error)
            {
                $("#errorMessage").show();

                $("#errorMessage").html("");

                if(xhr.status == 401)
                    $("#errorMessage").append("Invalid username or password");
            }
        });
    }
}