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
        window.location.href = "login.html";
    }
});

//function to take care of setting up UI after the page is ready loading all the assets
function dashboardPageLoaded() 
{
    pageLoaded = true;
    //switch to the theme mode accordingly
    if(getCookie("techstoreDashboardMode") == "dark")
        toggleThemeMode(false);
    
    //establish an authenticated user
    if(serverResponse)
        establishUser();

    clockUpdate();
    setInterval(clockUpdate, 1000);
}

//interval function called to update the clock
function clockUpdate()
{
    let date = new Date();
    $("#clockTime").text(new Intl.DateTimeFormat('en-GB', { timeStyle: 'medium' }).format(date));
    $("#dateTime").text(new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date));
}

//function to establish the user with a given rank
function establishUser()
{
    if(serverResponse)
    {
        $("#rankText").text(serverResponse.rank);
        $("#profileDropdown").text(serverResponse.rank);
        $("#welcomeText").append(serverResponse.displayName + "!");
    }
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
    $('body, .navbar').toggleClass('white-skin navy-blue-skin');
    $('#dark-mode').toggleClass('white text-dark btn-outline-black');
    $('body').toggleClass('dark-bg-admin');
    $('h6, .card, p, td, th, i, li a, h4, input, label').not(
        '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item').toggleClass('text-white');
    $('.btn-dash').toggleClass('grey blue').toggleClass('lighten-3 darken-3');
    $('.gradient-card-header').toggleClass('white black lighten-4');
    $('.list-panel a').toggleClass('navy-blue-bg-a text-white').toggleClass('list-group-border');

    if(clicks && (!getCookie("techstoreDashboardMode") || getCookie("techstoreDashboardMode") == "bright"))
        setCookie("techstoreDashboardMode", "dark", 365);

    else if(clicks && (getCookie("techstoreDashboardMode") == "dark"))
        setCookie("techstoreDashboardMode", "bright", 365);
}