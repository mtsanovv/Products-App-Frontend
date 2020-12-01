//redirect to dashboard if the user is logged in, else ask them to log in
if(getCookie(APIConfig.sessionCookie))
    window.location.href = "dashboard.html";
else
    window.location.href = "login.html"