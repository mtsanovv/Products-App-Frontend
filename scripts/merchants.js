//a script to validate all the inputs when they get clicked out
$('input').blur(function(evt) {
    evt.target.checkValidity();
});

//function to fetch all merchants from the Rest API
function fetchMerchants()
{
    $.ajax({
        type: 'GET',
        url: APIConfig.host + '/merchants',
        success: showMerchantsListing,
        error: showMerchantsError
    });
}

//function to send a POST request to add the merchant
function addMerchant()
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
            inputValidationsPassed++;
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
            url: APIConfig.host + '/merchants',
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href="index.html"
            },
            error: showMerchantsError
        });
    }
}


//setting up the merchant editing page
function editingPageLoaded()
{
    $.ajax({
        type: 'GET',
        url: APIConfig.host + '/merchants/' + getUrlParameter("merchant"),
        success: function (result) {
            document.title = "Editing merchant '" + result.merchant.displayName + "'";
            $("#editingPageTitle").text("Editing merchant '" + result.merchant.displayName + "'");
            $("#username").val(result.merchant.username);
            $("#displayName").val(result.merchant.displayName);
            $("#saveChanges").attr("onclick", "saveMerchant(" + result.merchant.id + ")");
        },
        error: function(xhr, status, code) {
            showMerchantsError(xhr, status, code);
            $("#saveChanges").hide();
            $("#cancelEditing").hide();
        }
    });
}

//function called when the "Delete" button is pressed
function deleteMerchant(merchantId)
{
    $.ajax({
        type: 'DELETE',
        url: APIConfig.host + '/merchants/' + merchantId,
        success: showMerchantsListing,
        error: showMerchantsError
    });
}

//function to send a PUT request to save the changes for a merchant
function saveMerchant(merchantId)
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
            inputValidationsPassed++;
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
            url: APIConfig.host + '/merchants/' + merchantId,
            data: JSON.stringify(dataToBeSent),
            contentType: "application/json",
            success: function (result) {
                window.location.href="index.html"
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
    $("#errorMessage").hide();
    $("#merchantsListing").show();

    $("#merchantsTableHeaders").html("");
    $("#merchantsTableRows").html("");

    result.headers.forEach((header) => {
        $("#merchantsTableHeaders").append("<th>" + header + "</th>");
    });
    $("#merchantsTableHeaders").append("<th>Actions</th>");
    result.rows.forEach((row) => {
        $("#merchantsTableRows").append("<tr>");
        row.forEach((element) => {
            $("#merchantsTableRows").append("<td>" + element + "</td>");
        });
        $("#merchantsTableRows").append("<td><a href='edit.html?merchant=" + row[0] + "'><button>Edit</button></a> <button onclick='deleteMerchant(" + row[0] + ")'>Delete</button></td>");
        $("#merchantTableRows").append("</tr>");
    });
}

//showing errors for merchants
function showMerchantsError(xhr, status, error)
{
    $("#errorMessage").show();
    $("#merchantsListing").hide();

    $("#errorMessage").html("");

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