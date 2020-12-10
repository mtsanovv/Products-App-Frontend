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

//function to fetch all products from the Rest API and perform some user-specific operations
function productsPageLoaded(pageName)
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
                url: APIConfig.host + '/products',
                success: function(result) {
                    showProductsListing(result);
                    createDataTable();
                },
                error: showProductsError
            });
            break;
        case "editing":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/products/' + getUrlParameter("product"),
                success: function (result) {
                    document.title = "Editing product '" + result.name + "'";
                    $("#editingPageTitle").text("Editing product '" + result.name + "'");
                    $("#name").val(result.name);
                    $("#quantity").val(result.quantity);
                    $("#criticalQuantity").val(result.criticalQuantity);
                    $("#pricePerItem").val(result.pricePerItem);
                    $("#saveChanges").attr("onclick", "saveProduct(" + result.id + ")");
                },
                error: function(xhr, status, code) {
                    showProductsError(xhr, status, code);
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
    $('body, .navbar').toggleClass('white-skin navy-blue-skin');
    $('#dark-mode').toggleClass('white text-dark btn-outline-black');
    $('body').toggleClass('dark-bg-admin');
    $('h6, .card, p, td, th, i, li a, h4, input, label').not(
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
    let table = $('#productsListingTable').DataTable({
        "columnDefs": [ {
            "targets": [ 5 ],
            "orderable": false
         } ]
    });
    $('#productsListingTable_wrapper').find('label').each(function () {
        $(this).parent().append($(this).children());
    });
    $('#productsListingTable_wrapper .dataTables_filter').find('input').each(function () {
        const $this = $(this);
        $this.attr("placeholder", "Search");
        $this.removeClass('form-control-sm');
    });
    $('#productsListingTable_wrapper .dataTables_length').addClass('d-flex flex-row');
    $('#productsListingTable_wrapper .dataTables_filter').addClass('md-form');
    $('#productsListingTable_wrapper select').removeClass(
    'custom-select custom-select-sm form-control form-control-sm');
    $('#productsListingTable_wrapper select').addClass('mdb-select');
    $('#productsListingTable_wrapper .mdb-select').materialSelect();
    $('#productsListingTable_wrapper .dataTables_filter').find('label').remove();

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

//function to send a POST request to add the product
function addProduct()
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
            name: document.getElementById("name").value,
            quantity: document.getElementById("quantity").value,
            criticalQuantity: document.getElementById("criticalQuantity").value,
            pricePerItem: document.getElementById("pricePerItem").value
        };

        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/products',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: showProductsError
        });
    }
}

//function called when the "Delete" button is pressed
function deleteProduct(productId)
{
    $.ajax({
        type: 'DELETE',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/products/' + productId,
        success: function(result) {
            location.reload();
        },
        error: showProductsError
    });
}

//function to send a PUT request to save the changes for a product
function saveProduct(productId)
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
            inputValidationsPassed++;
    });

    if(inputValidationsPassed === $('input').length)
    {
        const dataToBeSent = {
            name: document.getElementById("name").value,
            quantity: document.getElementById("quantity").value,
            criticalQuantity: document.getElementById("criticalQuantity").value,
            pricePerItem: document.getElementById("pricePerItem").value
        };

        $.ajax({
            type: 'PUT',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/products/' + productId,
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "index.html"
            },
            error: function (xhr, status, error)
            {
                showProductsError(xhr, status, error);
                $("#productsListing").show();
            }
        });
    }
}

//function to show the products listing
function showProductsListing(result)
{
    const columnHeaders = ["ID", "Name", "Quantity", "Critical quantity", "Price per item (USD)", "Actions"];

    $("#errorMessage").hide();
    $("#productsListing").show();

    columnHeaders.forEach((header) => {
        $("#productsTableHeaders").append("<th class='text-center'>" + header + "</th>");
        $("#productsTableFooters").append("<th class='text-center'>" + header + "</th>");
    });

    result.forEach((row) => {
        let toAppend = "<tr>";

        for (const [key, element] of Object.entries(row))
            toAppend += "<td class='text-center'>" + element + "</td>";

        toAppend += "<td class='text-center'><a href='edit.html?product=" + row.id + "'><button class='btn btn-outline-primary btn-rounded waves-effect waves-light'>Edit</button></a> <button class='btn btn-rounded btn-outline-danger waves-effect waves-light' onclick='deleteProduct(" + row.id + ")'>Delete</button></td>";
        toAppend += "</tr>";
        $("#productsTableRows").append(toAppend);
    });
}

//showing errors for products
function showProductsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#productsListing").hide();

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