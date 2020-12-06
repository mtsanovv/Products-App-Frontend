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

function dashboardPageLoaded() 
{
    //switch to the theme mode accordingly
    if(getCookie("techstoreDashboardMode") == "dark")
        toggleThemeMode(false);
}

function toggleThemeMode(clicks)
{
    $('h4, button').not('.check').toggleClass('dark-grey-text text-white');
    $('.list-panel a').toggleClass('dark-grey-text');

    $('footer, .card').toggleClass('dark-card-admin');
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