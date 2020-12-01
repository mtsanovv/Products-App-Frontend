//a script to validate all the inputs when they get clicked out
$('input').blur(function(evt) {
    evt.target.checkValidity();
});

//redirect to the login page if the user is not logged in
if(!getCookie(APIConfig.sessionCookie))
    window.location.href = "../login.html";

//function to fetch all products from the Rest API
function fetchProducts()
{
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/products',
        success: showProductsListing,
        error: showProductsError
    });
}

//setting up the product editing page
function editingPageLoaded()
{
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
}

//function to send a POST request to add the product
function addProduct()
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
    const columnHeaders = ["ID", "Name", "Quantity", "Critical quantity", "Price per item (BGN)", "Actions"];

    $("#errorMessage").hide();
    $("#productsListing").show();

    columnHeaders.forEach((header) => {
        $("#productsTableHeaders").append("<th>" + header + "</th>");
    });

    result.forEach((row) => {
        $("#productsTableRows").append("<tr>");

        for (const [key, element] of Object.entries(row))
            $("#productsTableRows").append("<td>" + element + "</td>");

        $("#productsTableRows").append("<td><a href='edit.html?product=" + row.id + "'><button>Edit</button></a> <button onclick='deleteProduct(" + row.id + ")'>Delete</button></td>");
        $("#productsTableRows").append("</tr>");
    });
}

//showing errors for products
function showProductsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#productsListing").hide();

    $("#errorMessage").html("");

    if(xhr.status == 403 || xhr.status == 401)
        $("#errorMessage").append("You are not allowed to access this page");
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