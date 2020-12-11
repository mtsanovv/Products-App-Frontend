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

//function to fetch all clients from the Rest API and perform some user-specific operations
function clientsPageLoaded(pageName)
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
                url: APIConfig.host + '/clients',
                success: function(result) {
                    showClientsListing(result);
                    createDataTable();
                },
                error: showClientsError
            });
            break;
        case "editing":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/clients/' + getUrlParameter("client"),
                success: function (result) {
                    $('input').each(function(index, item) {
                        $("#" + item.id).focusin();
                    });
                    document.title = "Editing client '" + result.name + "' | TechStore Dashboard";
                    $("#editingPageTitle").text("Editing client '" + result.name + "'");
                    $("#name").val(result.name);
                    $("#saveChanges").attr("onclick", "saveClient(" + result.id + ")");
                },
                error: function(xhr, status, code) {
                    showClientsError(xhr, status, code);
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
    let table = $('#clientsListingTable').DataTable({
        "columnDefs": [ {
            "targets": [ 2 ],
            "orderable": false
         } ]
    });
    $('#clientsListingTable_wrapper').find('label').each(function () {
        $(this).parent().append($(this).children());
    });
    $('#clientsListingTable_wrapper .dataTables_filter').find('input').each(function () {
        const $this = $(this);
        $this.attr("placeholder", "Search");
        $this.removeClass('form-control-sm');
    });
    $('#clientsListingTable_wrapper .dataTables_length').addClass('d-flex flex-row');
    $('#clientsListingTable_wrapper .dataTables_filter').addClass('md-form');
    $('#clientsListingTable_wrapper select').removeClass(
    'custom-select custom-select-sm form-control form-control-sm');
    $('#clientsListingTable_wrapper select').addClass('mdb-select');
    $('#clientsListingTable_wrapper .mdb-select').materialSelect();
    $('#clientsListingTable_wrapper .dataTables_filter').find('label').remove();

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

//function to send a POST request to add the client
function addClient()
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
            name: document.getElementById("name").value
        };

        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/clients',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: showClientsError
        });
    }
}

//function called when the "Delete" button is pressed
function deleteClient(clientId)
{
    $.ajax({
        type: 'DELETE',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/clients/' + clientId,
        success: function(result) {
            location.reload();
        },
        error: showClientsError
    });
}

//function to send a PUT request to save the changes for a client
function saveClient(clientId)
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
            name: document.getElementById("name").value
        };

        $.ajax({
            type: 'PUT',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/clients/' + clientId,
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: function (xhr, status, error)
            {
                showClientsError(xhr, status, error);
                $("#clientsListing").show();
            }
        });
    }
}

//function to show the clients listing
function showClientsListing(result)
{
    const columnHeaders = ["ID", "Name", "Actions"];

    $("#errorMessage").hide();
    $("#clientsListing").show();

    columnHeaders.forEach((header) => {
        $("#clientsTableHeaders").append("<th class='text-center'>" + header + "</th>");
        $("#clientsTableFooters").append("<th class='text-center'>" + header + "</th>");
    });

    result.forEach((row) => {
        let toAppend = "<tr>";

        for (const [key, element] of Object.entries(row))
            toAppend += "<td class='text-center'>" + element + "</td>";

        toAppend += "<td class='text-center'><a href='edit.html?client=" + row.id + "'><button class='btn btn-outline-primary btn-rounded waves-effect waves-light'>Edit</button></a> <button class='btn btn-rounded btn-outline-danger waves-effect waves-light' data-toggle='modal' data-target='#deleteModal' onclick='changeClientDeleteModal(" + row.id + ", \"" + row.name + "\")'>Delete</button></td>";
        toAppend += "</tr>";
        $("#clientsTableRows").append(toAppend);
    });
}

//function to change what the delete client modal does
function changeClientDeleteModal(clientId, clientName)
{
    $('#deleteModalLongTitle').html("Deleting <b>" + clientName + "</b>");
    $('#deleteModalBody').html("Are you sure that you want to delete the client <b>" + clientName + "</b>? <p class='mt-2'></p>");
    $('#modalConfirmDeletion').attr("onclick", "deleteClient(" + clientId + ")");
}

//showing errors for clients
function showClientsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#clientsListing").hide();

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