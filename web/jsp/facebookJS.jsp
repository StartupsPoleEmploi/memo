<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<script>

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response,noLogin)
{
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected')
    {
        // Logged into your app and Facebook.
        lBR.facebookAuthentication(noLogin);
    }
    else if (response.status === 'not_authorized')
    {
        // The person is logged into Facebook, but not your app.
        $(".fbStatus").html("Veuillez vous connecter sur votre outil.");
    }
    else
    {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        $(".fbStatus").html("Veuillez vous connecter à Facebook.");
    }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState()
{
    FB.getLoginStatus(function(response)
    {
    statusChangeCallback(response);
    });
}

<%
    String appId = "494216964112744";

    /*if(request.getServerName().toLowerCase().indexOf("boomerang")>-1)
        appId = "516176311916809";*/
%>

window.fbAsyncInit = function()
{
    FB.init({
        appId      : '<%=appId%>',     // '494216964112744', // classtonjob
        cookie     : true,  // enable cookies to allow the server to access the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.12' // use graph api version 2.12
    });

    // Now that we've initialized the JavaScript SDK, we call
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.

    if(!memoVars.uLI)
    {
        FB.getLoginStatus(function (response) {
            statusChangeCallback(response,1);
        });
    }

};

    // Load the SDK asynchronously
    (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/fr_FR/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    </script>