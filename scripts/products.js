//a script to validate all the inputs when they get clicked out
$('input').blur(function(evt) {
    evt.target.checkValidity();
});

//function to fetch all products from the Rest API
function fetchProducts()
{
    $.ajax({
        type: 'GET',
        url: APIConfig.host + '/products',
        success: showProductsListing,
        error: showProductsError
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
            url: APIConfig.host + '/products',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href="index.html"
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
        url: APIConfig.host + '/products/' + productId,
        success: showProductsListing,
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
            url: APIConfig.host + '/products/' + productId,
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                $("body").html(result);
            },
            error: function (e) {
                $("body").html(e.responseText);
            }
        });
    }
}

function showProductsListing(result)
{
    $("#errorMessage").hide();
    $("#productsListing").show();

    $("#productsTableHeaders").html("");
    $("#productsTableRows").html("");

    result.headers.forEach((header) => {
        $("#productsTableHeaders").append("<th>" + header + "</th>");
    });
    $("#productsTableHeaders").append("<th>Actions</th>");
    result.rows.forEach((row) => {
        $("#productsTableRows").append("<tr>");
        row.forEach((element) => {
            $("#productsTableRows").append("<td>" + element + "</td>");
        });
        $("#productsTableRows").append("<td><a href='" + row[0] + "'><button>Edit</button></a> <button onclick='deleteProduct(" + row[0] + ")'>Delete</button></td>");
        $("#productsTableRows").append("</tr>");
    });
}

function showProductsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#productsListing").hide();

    $("#errorMessage").html("");

    $("#errorMessage").append(JSON.parse(xhr.responseText).message);
}