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

//function to fetch all clients from the Rest API
function fetchClients()
{
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/clients',
        success: showClientsListing,
        error: showClientsError
    });
}

//function to send a POST request to add the client
function addClient()
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity())
            inputValidationsPassed++;
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

//setting up the client editing page
function editingPageLoaded()
{
    $.ajax({
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        url: APIConfig.host + '/clients/' + getUrlParameter("client"),
        success: function (result) {
            document.title = "Editing client '" + result.name + "'";
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
}

//function to send a PUT request to save the changes for a client
function saveClient(clientId)
{
    let inputValidationsPassed = 0;

    $('input').each(function(index, item) {
        if(item.checkValidity() || (item.id === "password" && !item.value))
            inputValidationsPassed++;
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

//function to show the clients listing
function showClientsListing(result)
{
    const columnHeaders = ["ID", "Name"];

    $("#errorMessage").hide();
    $("#clientsListing").show();

    columnHeaders.forEach((header) => {
        $("#clientsTableHeaders").append("<th>" + header + "</th>");
    });

    result.forEach((row) => {
        $("#clientsTableRows").append("<tr>");
        for (const [key, element] of Object.entries(row))
        {
            $("#clientsTableRows").append("<td>" + element + "</td>");
        }

        $("#clientsTableRows").append("<td><a href='edit.html?client=" + row.id + "'><button>Edit</button></a> <button onclick='deleteClient(" + row.id + ")'>Delete</button></td>");
        $("#clientsTableRows").append("</tr>");
    });
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