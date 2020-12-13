let pageLoaded = false;
let serverResponse;
let table;

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
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/merchants',
                success: function(result) {
                    addMerchantsToFilter(result);
                }
            });
            break;
        case "products":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/products',
                success: function(result) {
                    showProductsListing(result);
                    createProductsDataTable();
                },
                error: showSalesError
            });
            break;
        case "selling":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/products/' + getUrlParameter("product"),
                success: function (result) {
                    $('input').each(function(index, item) {
                        if(item.id != "saleQuantity")
                            $("#" + item.id).focusin();
                    });
                    document.title = "Selling product '" + result.name + "' | TechStore Dashboard";
                    $("#sellingPageTitle").text("Selling product '" + result.name + "'");
                    $("#name").val(result.name);
                    $("#quantity").val(result.quantity);
                    $("#criticalQuantity").val(result.criticalQuantity);
                    $("#pricePerItem").val(result.pricePerItem);
                    $("#sellProduct").attr("onclick", "sellProduct(" + result.id + ")");
                },
                error: function(xhr, status, code) {
                    showSalesError(xhr, status, code);
                    $("#sellProduct").hide();
                    $("#cancelSale").hide();
                }
            });
            break;
        case "tweeting":
            $.ajax({
                type: 'GET',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                url: APIConfig.host + '/products/' + getUrlParameter("product"),
                success: function (result) {
                    $('input').each(function(index, item) {
                        if(item.id != "saleQuantity")
                            $("#" + item.id).focusin();
                    });
                    document.title = "Tweeting about '" + result.name + "' | TechStore Dashboard";
                    $("#tweetingPageTitle").text("Tweeting about '" + result.name + "'");
                    $("#name").val(result.name);
                    $("#pricePerItem").val(result.pricePerItem);
                    $("#tweetProduct").attr("onclick", "tweetProduct(" + result.id + ")");
                },
                error: function(xhr, status, code) {
                    showSalesError(xhr, status, code);
                    $("#tweetProduct").hide();
                    $("#cancelTweet").hide();
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
            $("#sales-merchant").find("a").first().addClass("active");
            $("#sales-merchant").find("div").first().show();
            $("#salesText").text("My sales");
            break;
        case "Administrator":
            $("#products").show();
            $("#merchants").show();
            $("#sales-admin").show();
            $("#sales-admin").find("a").first().addClass("active");
            $("#sales-admin").find("div").first().show();
            break;
    }
}

//function to send a POST request to tweet about a product
function tweetProduct(productId)
{
    $("#loader").show();
    $("#tweetProduct").hide();
    $("#cancelTweet").hide();

    $.ajax({
        type: 'POST',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/products/' + productId + '/tweet',
        success: function (result) {
            $("#loader").hide();
            $("#tweetProduct").hide();
            $("#infoMessage").hide();
            $("#cancelTweet").show();
            $("#cancelTweet").text("Back to products");
            $("#errorMessage").removeClass("alert-danger");
            $("#errorMessage").addClass("alert-success");
            $("#errorMessage").html("Tweet posted successfully to <a href='https://twitter.com/" + result.user.screenName + "' target='_blank'>@" + result.user.screenName + "</a> timeline: <p class='mt-2 mb-0'>" + result.text + "</p>");
            $("#errorMessage").show();
        },
        error: function(xhr, status, error) {
            showSalesError(xhr, status, error);
            $("#loader").hide();
            $("#tweetProduct").show();
            $("#cancelTweet").show();
        }
    });
}

//function to send a POST request to sell a product
function sellProduct(productId)
{
    if(document.getElementById('saleQuantity').checkValidity())
    {
        $("#saleQuantity").removeClass("invalid");
        $("#saleQuantity").removeClass("valid");
        $("#saleQuantity").focusin();
        $("#saleQuantity").addClass("valid");
    }
    else
    {
        $("#saleQuantity").removeClass("invalid");
        $("#saleQuantity").removeClass("valid");
        $("#saleQuantity").focusin();
        $("#saleQuantity").addClass("invalid");
    }

    if(document.getElementById('saleQuantity').checkValidity())
    {
        const dataToBeSent = {
            productId: productId,
            quantitySold: document.getElementById('saleQuantity').value
        };

        $.ajax({
            type: 'POST',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            url: APIConfig.host + '/sales',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href = "products.html"
            },
            error: function (xhr, status, error)
            {
                showSalesError(xhr, status, error);
            }
        });
    }
}


//function to fetch all merchants - administrators only
function addMerchantsToFilter(result)
{
    let toAppend = "";
    const anyMerchantOption = "<a id='anyMerchant' class='dropdown-item active text-white' onclick='changeActiveMerchantFilter(\"\", true)'>Any merchant</a>";

    result.forEach((row) => {
        if(row.sales.length)
            toAppend += "<a class='dropdown-item' merchantId='" + row.id + "' value='" + row.username + "' onclick='changeActiveMerchantFilter(\"" + row.username + "\", false)'>" + row.username + "</a>";
    });

    if(toAppend.length)
    {
        $("#merchantPicker").append(anyMerchantOption + toAppend);
        $("#merchantPicker").mdbDropSearch();
        $("#filtering").show();
    }
}

//function to change the active merchant value
function changeActiveMerchantFilter(merchantUsername, isAny)
{
    $('#merchantPicker').find('a').each(function() {
        if($(this).hasClass('active'))
            $(this).removeClass('active text-white');
        if((isAny && $(this).attr('id') == 'anyMerchant') || ($(this).attr('value') === merchantUsername))
            $(this).addClass('active text-white');
    });
}

//function to apply the sales filter
function filterSales()
{
    let queryParameters = {};

    if(document.getElementById('startDatePicker').value)
        queryParameters.start_date = document.getElementById('startDatePicker').value;
    
    if(document.getElementById('endDatePicker').value)
        queryParameters.end_date = document.getElementById('endDatePicker').value;

    $('#merchantPicker').find('a').each(function() {
        if($(this).hasClass('active') && $(this).attr('id') != 'anyMerchant')
        {
            queryParameters.merchant_id = $(this).attr('merchantId');
            return false;
        }
    });

    const queryString = Object.keys(queryParameters).map(key => key + '=' + queryParameters[key]).join('&');
    
    $('#filterSales').hide();
    $('#filterLoader').show();
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/sales?' + queryString,
        success: function(result) {
            if(table)
                table.destroy();
            showSalesListing(result, true);
            createDataTable();
        },
        error: function(xhr, status, code) {
            showSalesError(xhr, status, code);
            $("#salesListing").hide();
            $('#filterSales').show();
            $('#filterLoader').hide();
        }
    });
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
        '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item, .btn-secondary, #dropdownSearch').toggleClass('text-white');
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
    table = $('#salesListingTable').DataTable({
        "order": [[ 4, "desc" ]]
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
            '#slide-out i, #slide-out a, .dropdown-item i, .dropdown-item, .text-white, .btn-secondary, #dropdownSearch').toggleClass('text-white');
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
        
        //don't add row to the table if there's nothing left of this product to sell - admins have to restock
        if(!row.quantity)
            return;
        
        let toAppend = "<tr>";

        for (const [key, element] of Object.entries(row))
            toAppend += "<td class='text-center'>" + element + "</td>";

        const sellButton = "<a href='sell.html?product=" + row.id + "'><button class='btn btn-outline-success btn-rounded waves-effect waves-light'>Sell</button></a>";
        const tweetButton = "<a href='tweet.html?product=" + row.id + "'><button class='btn btn-outline-info btn-rounded waves-effect waves-light'><i class='fab fa-twitter'></i> Tweet Offer</button></a>";
        
        //don't tweet offers when the quantity is less than the critical quantity
        if(row.quantity < row.criticalQuantity)
            toAppend += "<td class='text-center'>" + sellButton + "</td>";
        else 
            toAppend += "<td class='text-center'>" + sellButton + " " + tweetButton + "</td>";
        
        toAppend += "</tr>";
        $("#productsTableRows").append(toAppend);
    });
}

//function to create the products data table
function createProductsDataTable()
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


//function to show the sales listing
function showSalesListing(result, isRefresh)
{
    const columnHeaders = ["Product ID", "Product name", "Price per item (USD)", "Quantity sold", "Date of sale", "Selling price per item (USD)"];
    const ignoreParameters = ["id"];
    const ignoreProductParameters = ["quantity", "criticalQuantity"];

    $("#errorMessage").hide();
    $("#salesListing").show();

    $("#salesTableHeaders").html("");
    $("#salesTableFooters").html("");
    $("#salesTableRows").html("");

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
                    {
                        if(ignoreProductParameters.indexOf(productKey) == -1)
                            toAppend += "<td class='text-center'>" + productValue + "</td>";
                    }
                }
            }
        }

        toAppend += "</tr>";
        $("#salesTableRows").append(toAppend);
    });

    if(isRefresh)
    {
        $("#salesListing").show();
        $('#filterSales').show();
        $('#filterLoader').hide();
        $("#errorMessage").hide();
        $("#errorMessage").html("");
    }
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

