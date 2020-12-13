let pageLoaded = false;
let serverResponse;

//check if the user is logged in
$.ajax({
    type: 'GET',
    xhrFields: {
        withCredentials: true
    },
    crossDomain: true,
    url: APIConfig.host + '/user',
    success: function(result) {
        serverResponse = result;
        if(pageLoaded)
            establishUser();
    },
    error: function(xhr) {
        if(xhr.status == 401)
            window.location.href = "login.html";
        else 
            window.location.href = "dashboard.html";
    }
});

//function called when the tweet page has loaded
function tweetPageLoaded()
{
    pageLoaded = true;
    //switch to the theme mode accordingly
    if(getCookie("techstoreDashboardMode") == "dark")
        toggleThemeMode(false);
    
    //establish an authenticated user
    if(serverResponse)
        establishUser();
}

//function to establish the user with their rank
function establishUser()
{
    if(serverResponse)
        $("#profileDropdown").text(serverResponse.rank);

    switch(serverResponse.rank)
    {
        case "Merchant":
            $("#clients").show();
            $("#sales-merchant").show();
            break;
        case "Administrator":
            $("#products").show();
            $("#merchants").show();
            $("#sales-admin").show();
            break;
    }
}

//function to switch between light & dark mode
function toggleThemeMode(clicks)
{
    $('h4, button').not('.check, .btn-primary, .btn-default, .btn-secondary, .btn-success, .btn-info, .btn-warning, .btn-danger').toggleClass('dark-grey-text text-white');
    $('.list-panel a').toggleClass('dark-grey-text');

    $('footer, .card').toggleClass('dark-card-admin');
    $('#welcomeCard').removeClass('dark-card-admin'); //welcome card should not be darkened
    $('.blue-gradient').toggleClass('pinot-noir-gradient');
    $('.calm-darya-gradient').toggleClass('ash-gradient');
    $('body, .navbar, .modal-content').toggleClass('white-skin navy-blue-skin');
    $('#dark-mode').toggleClass('white text-dark btn-outline-black');
    $('body, .modal-content').toggleClass('dark-bg-admin');
    $('h6, .card, p, td, th, i, li a, h4, input, label, h5, textarea').not(
        '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item, .btn-secondary').toggleClass('text-white');
    $('.btn-dash').toggleClass('grey blue').toggleClass('lighten-3 darken-3');
    $('.gradient-card-header').toggleClass('white black lighten-4');
    $('.list-panel a').toggleClass('navy-blue-bg-a text-white').toggleClass('list-group-border');

    if(clicks && (!getCookie("techstoreDashboardMode") || getCookie("techstoreDashboardMode") == "bright"))
        setCookie("techstoreDashboardMode", "dark", 365);

    else if(clicks && (getCookie("techstoreDashboardMode") == "dark"))
        setCookie("techstoreDashboardMode", "bright", 365);
}

//function to POST a text to be tweeted by the backend
function tweet()
{
    $("#loader").show();
    $("#tweetBtn").hide();
    $("#cancelBtn").hide();

    const dataToBeSent = {
        text: document.getElementById("text").value
    };

    $.ajax({
        type: 'POST',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/user/tweet',
        data: JSON.stringify(dataToBeSent),
        contentType: "application/json",
        success: function (result) {
            $("#loader").hide();
            $("#tweetBtn").hide();
            $("#cancelBtn").show();
            $("#tweetArea").hide();
            $("#cancelBtn").text("Back to dashboard");
            $("#errorMessage").removeClass("alert-danger");
            $("#errorMessage").addClass("alert-success");
            $("#errorMessage").html("Tweet posted successfully to <a href='https://twitter.com/" + result.user.screenName + "' target='_blank'>@" + result.user.screenName + "</a> timeline: <p class='mt-2 mb-0'>" + result.text + "</p>");
            $("#errorMessage").show();
        },
        error: showTweetError
    });
}

//showing errors for tweet
function showTweetError(xhr, status, error)
{
    $("#loader").hide();
    $("#tweetBtn").show();
    $("#cancelBtn").show();

    $("#errorMessage").show();

    $("#errorMessage").html("");

    if(xhr.status == 401)
        window.location.href = "login.html";
    else if(xhr.status == 403)
        window.location.href = "dashboard.html";
    else
        $("#errorMessage").append(JSON.parse(xhr.responseText).message);
}