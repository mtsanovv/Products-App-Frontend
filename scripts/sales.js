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
            window.location.href = "../login.html";
        else 
            window.location.href = "../dashboard.html";
    }
});

//function to fetch all products from the Rest API and perform some user-specific operations
function salesPageLoaded(pageName)
{
    pageLoaded = true;
    //switch to the theme mode accordingly
    if(getCookie("techstoreDashboardMode") == "dark")
        toggleThemeMode(false);
    
    //establish an authenticated user
    if(serverResponse)
        establishUser();

    switch(pageName)
    {
        case "listing":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/sales',
                success: function(result) {
                    showSalesListing(result);
                    createDataTable();
                },
                error: showSalesError
            });
            break;

    }
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
            $("#sales-merchant").find("a").first().addClass("active");
            $("#sales-merchant").find("div").first().show();
            $("#salesText").text("My sales");
            break;
        case "Administrator":
            $("#products").show();
            $("#merchants").show();
            $("#sales-admin").show();
            $("#sales-admin").find("a").first().addClass("active");
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
    $('h6, .card, p, td, th, i, li a, h4, input, label, h5').not(
        '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item, .btn-secondary').toggleClass('text-white');
    $('.btn-dash').toggleClass('grey blue').toggleClass('lighten-3 darken-3');
    $('.gradient-card-header').toggleClass('white black lighten-4');
    $('.list-panel a').toggleClass('navy-blue-bg-a text-white').toggleClass('list-group-border');

    if(clicks && (!getCookie("techstoreDashboardMode") || getCookie("techstoreDashboardMode") == "bright"))
        setCookie("techstoreDashboardMode", "dark", 365);

    else if(clicks && (getCookie("techstoreDashboardMode") == "dark"))
        setCookie("techstoreDashboardMode", "bright", 365);
}

//function to create the data table
function createDataTable()
{
    let table = $('#salesListingTable').DataTable({
        "order": [[ 6, "desc" ]]
    });
    $('#salesListingTable_wrapper').find('label').each(function () {
        $(this).parent().append($(this).children());
    });
    $('#salesListingTable_wrapper .dataTables_filter').find('input').each(function () {
        const $this = $(this);
        $this.attr("placeholder", "Search");
        $this.removeClass('form-control-sm');
    });
    $('#salesListingTable_wrapper .dataTables_length').addClass('d-flex flex-row');
    $('#salesListingTable_wrapper .dataTables_filter').addClass('md-form');
    $('#salesListingTable_wrapper select').removeClass(
    'custom-select custom-select-sm form-control form-control-sm');
    $('#salesListingTable_wrapper select').addClass('mdb-select');
    $('#salesListingTable_wrapper .mdb-select').materialSelect();
    $('#salesListingTable_wrapper .dataTables_filter').find('label').remove();

    //add dark mode to all newly added components as well
    darkModeSwitchTextCompletely();

    table.on('draw', function (e) {
        darkModeSwitchTextCompletely();
    });
}

//function to make sure all new content is also in dark mode
function darkModeSwitchTextCompletely()
{
    if(getCookie("techstoreDashboardMode") == "dark")
        $('h6, .card, p, td, th, i, li a, h4, input, label').not(
            '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item, .text-white, .btn-secondary').toggleClass('text-white');
}

//function to show the sales listing
function showSalesListing(result)
{
    const columnHeaders = ["Product ID", "Product name", "Product quantity", "Critical product quantity", "Price per item (USD)", "Quantity sold", "Date of sale", "Selling price per item (USD)"];
    const ignoreParameters = ["id"];

    $("#errorMessage").hide();
    $("#salesListing").show();

    columnHeaders.forEach((header) => {
        $("#salesTableHeaders").append("<th class='text-center'>" + header + "</th>");
        $("#salesTableFooters").append("<th class='text-center'>" + header + "</th>");
    });

    result.forEach((row) => {
        let toAppend = "<tr>";

        for (const [key, element] of Object.entries(row))
        {
            if(ignoreParameters.indexOf(key) == -1)
            {
                if(key != "product")
                    toAppend += "<td class='text-center'>" + element + "</td>";
                else
                {
                    for (const [productKey, productValue] of Object.entries(element))
                        toAppend += "<td class='text-center'>" + productValue + "</td>";
                }
            }
        }

        toAppend += "</tr>";
        $("#salesTableRows").append(toAppend);
    });
}

//showing errors for sales
function showSalesError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#salesListing").hide();

    $("#errorMessage").html("");

    if(xhr.status == 401)
        window.location.href = "../login.html";
    else if(xhr.status == 403)
        window.location.href = "../dashboard.html";
    else
        $("#errorMessage").append(JSON.parse(xhr.responseText).message);
}

//function to get url parameter
function getUrlParameter(sParam) 
{
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) 
    {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) 
        {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

