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
    error: function(xhr) {
        if(xhr.status == 401)
            window.location.href = "../login.html";
        else 
            window.location.href = "../dashboard.html";
    }
});

//function to fetch all merchants from the Rest API
function fetchMerchants()
{
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
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


//setting up the merchant editing page
function editingPageLoaded()
{
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/merchants/' + getUrlParameter("merchant"),
        success: function (result) {
            document.title = "Editing merchant '" + result.displayName + "'";
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
        $("#merchantsTableHeaders").append("<th>" + header + "</th>");
    });

    result.forEach((row) => {
        $("#merchantsTableRows").append("<tr>");
        for (const [key, element] of Object.entries(row))
        {
            if(ignoreParameters.indexOf(key) == -1)
                $("#merchantsTableRows").append("<td>" + element + "</td>");
        }

        $("#merchantsTableRows").append("<td><a href='edit.html?merchant=" + row.id + "'><button>Edit</button></a> <button onclick='deleteMerchant(" + row.id + ")'>Delete</button></td>");
        $("#merchantsTableRows").append("</tr>");
    });
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