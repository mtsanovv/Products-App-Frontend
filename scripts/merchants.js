let pageLoaded = false;
let serverResponse;

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

//function to fetch all merchants from the Rest API and perform some user-specific operations
function merchantsPageLoaded(pageName)
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
                url: APIConfig.host + '/merchants',
                success: function(result) {
                    showMerchantsListing(result);
                    createDataTable();
                },
                error: showMerchantsError
            });
            break;
        case "editing":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/merchants/' + getUrlParameter("merchant"),
                success: function (result) {
                    $('input').each(function(index, item) {
                        $("#" + item.id).focusin();
                    });
                    document.title = "Editing merchant '" + result.displayName + "' | TechStore Dashboard";
                    $("#editingPageTitle").text("Editing merchant '" + result.displayName + "'");
                    $("#username").val(result.username);
                    $("#displayName").val(result.displayName);
                    $("#saveChanges").attr("onclick", "saveMerchant(" + result.id + ")");
                },
                error: function(xhr, status, code) {
                    showMerchantsError(xhr, status, code);
                    $("#saveChanges").hide();
                    $("#cancelEditing").hide();
                }
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
    let table = $('#merchantsListingTable').DataTable({
        "columnDefs": [ {
            "targets": [ 3 ],
            "orderable": false
         } ]
    });
    $('#merchantsListingTable_wrapper').find('label').each(function () {
        $(this).parent().append($(this).children());
    });
    $('#merchantsListingTable_wrapper .dataTables_filter').find('input').each(function () {
        const $this = $(this);
        $this.attr("placeholder", "Search");
        $this.removeClass('form-control-sm');
    });
    $('#merchantsListingTable_wrapper .dataTables_length').addClass('d-flex flex-row');
    $('#merchantsListingTable_wrapper .dataTables_filter').addClass('md-form');
    $('#merchantsListingTable_wrapper select').removeClass(
    'custom-select custom-select-sm form-control form-control-sm');
    $('#merchantsListingTable_wrapper select').addClass('mdb-select');
    $('#merchantsListingTable_wrapper .mdb-select').materialSelect();
    $('#merchantsListingTable_wrapper .dataTables_filter').find('label').remove();

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

//function to send a POST request to add the merchant
function addMerchant()
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
        const dataToBeSent = {
            username: document.getElementById("username").value,
            displayName: document.getElementById("displayName").value,
            password: document.getElementById("password").value
        };

        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/merchants',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: showMerchantsError
        });
    }
}

//function called when the "Delete" button is pressed
function deleteMerchant(merchantId)
{
    $.ajax({
        type: 'DELETE',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/merchants/' + merchantId,
        success: function(result) {
            location.reload();
        },
        error: showMerchantsError
    });
}

//function to send a PUT request to save the changes for a merchant
function saveMerchant(merchantId)
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity() || (item.id === "password" && !item.value))
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
        const dataToBeSent = {
            username: document.getElementById("username").value,
            displayName: document.getElementById("displayName").value,
            password: document.getElementById("password").value
        };

        $.ajax({
            type: 'PUT',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/merchants/' + merchantId,
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: function (xhr, status, error)
            {
                showMerchantsError(xhr, status, error);
                $("#merchantsListing").show();
            }
        });
    }
}


//function to show the merchants listing
function showMerchantsListing(result)
{
    const columnHeaders = ["ID", "Username", "Display name", "Actions"];
    const ignoreParameters = ["password", "rank", "clients", "sales", "email"];

    $("#errorMessage").hide();
    $("#merchantsListing").show();

    columnHeaders.forEach((header) => {
        $("#merchantsTableHeaders").append("<th class='text-center'>" + header + "</th>");
        $("#merchantsTableFooters").append("<th class='text-center'>" + header + "</th>");
    });

    result.forEach((row) => {
        let toAppend = "<tr>";

        for (const [key, element] of Object.entries(row))
        {
            if(ignoreParameters.indexOf(key) == -1)
                toAppend += "<td class='text-center'>" + element + "</td>";
        }

        toAppend += "<td class='text-center'><a href='edit.html?merchant=" + row.id + "'><button class='btn btn-outline-primary btn-rounded waves-effect waves-light'>Edit</button></a> <button class='btn btn-rounded btn-outline-danger waves-effect waves-light' data-toggle='modal' data-target='#deleteModal' onclick='changeMerchantDeleteModal(" + row.id + ", \"" + row.displayName + "\", \"" + row.username + "\")'>Delete</button></td>";
        toAppend += "</tr>";

        $("#merchantsTableRows").append(toAppend);
    });
}

//function to change what the delete merchant modal does
function changeMerchantDeleteModal(merchantId, merchantDisplayName, merchantUsername)
{
    $('#deleteModalLongTitle').html("Deleting <b>" + merchantUsername + "</b>");
    $('#deleteModalBody').html("Are you sure that you want to delete the merchant <b>" + merchantUsername + "</b> (<b>\"" + merchantDisplayName + "\"</b>)? <p class='mt-2'><b>This operation will delete any linked sales and clients to this merchant, so proceed with caution.</b></p>");
    $('#modalConfirmDeletion').attr("onclick", "deleteMerchant(" + merchantId + ")");
}

//showing errors for merchants
function showMerchantsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#merchantsListing").hide();

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
};