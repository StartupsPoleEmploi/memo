import { MEMO } from '../index.js';
import { navigate } from '@reach/router';

export const createAccount = function(values)
{
    return fetch(MEMO.rootURL + '/rest/account', {
        method: 'POST',
        headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: "accountLoginEmail="+values.loginEmail+"&accountLoginPassword="+values.loginPassword
        
    });
}

export const loadUserFromCredentials = function(values)
{
    return fetch(MEMO.rootURL + '/rest/account/accountLogin', {
        method: 'POST',
        headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: "loginEmail="+values.loginEmail+"&loginPassword="+values.loginPassword
        
    });
}

export const loadUserFromCookie = function() {
    return fetch(MEMO.rootURL + '/rest/account/user', {
        method: 'GET',
        headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
        })
    });   
}

export const loadUserFromVisitorLink = function(link) {
    return fetch(MEMO.rootURL + '/rest/account/user/link/'+link, {
        method: 'GET',
        headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
        })
    });   
}

export const loadUserFromConseillerLink = function(link) {
    return fetch(MEMO.rootURL + '/rest/account/user/conseillerLink/'+link, {
        method: 'GET',
        headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
        })
    });   
}

export const logoutUser = function() {
    return fetch(MEMO.rootURL + '/rest/account/logout', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    });
}

export const getShareLink = function()  {
    return fetch(MEMO.rootURL + '/rest/account/visitorLink', {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    });
}

export const saveReceiveNotification = function(newValue) {

    let p = "notificationState="+(newValue?"1":"0")+"&csrf="+MEMO.user.csrf;

    return fetch(MEMO.rootURL + '/rest/account/notificationState', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });
}

export const sendForgottenPasswordMail = function(values) {
    // TODO ci-dessous remplacer passwordREACT par password
    return fetch(MEMO.rootURL + '/rest/account/passwordREACT', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body: "loginEmail="+values.loginEmail
    });
}
export const saveConsentAccess = function(newValue) {

    let p = "consentAccess="+(newValue?"1":"0")+"&csrf="+MEMO.user.csrf;

    return fetch(MEMO.rootURL + '/rest/account/consentAccessState', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });
}

export const deactivateAccount = function() {

    let p = "csrf="+MEMO.user.csrf;

    return fetch(MEMO.rootURL + '/rest/account/mailSupprimerCompte', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });
}

export const saveNewEmail = function(values) {

    let p = "login="+MEMO.user.login+"&newEmail="+values.newEmail;

    if(values.password)
        p += "&password="+values.password;

    p+="&csrf="+MEMO.user.csrf;    

    return fetch(MEMO.rootURL + '/rest/account/newEmail', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });

}

export const savePassword = function(values) {

    let p = "login="+MEMO.user.login+
            "&lastPassword="+values.password+
            "&newPassword="+values.newPassword+
            "&csrf="+MEMO.user.csrf;    

    return fetch(MEMO.rootURL + '/rest/account/newPassword', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });

}

export const resetPassword = function(values) {

    let p = "resetToken="+MEMO.resetToken+
            "&newPassword="+values.newPassword;    

    return fetch(MEMO.rootURL + '/rest/account/resetPassword', {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        }),
        body:p
    });

}

// redirige un utilisateur sur la page de démarrage après connexion (dashboard par défaut, faq ou actions)
export const redirectToStartPage = function() {

    //console.log("redirectToStartPage ",MEMO);

    //window.history.replaceState({},"Tableau de bord MEMO", "/dashboard");

    //console.log("aa ",MEMO);

    if(MEMO.redirectDestination)
    {
        navigate(MEMO.redirectDestination);
        MEMO.redirectDestination = "";      // remise à 0 car ne doit se produire qu'une fois
        //console.log("redirect one shot");
    }
    else 
    {
        if(MEMO.cId && MEMO.user && MEMO.user.candidatures && MEMO.user.candidatures[MEMO.cId])      // redirection vers pages 
        {
            //console.log("GO TO CANDIDATURE");
            navigate("/dashboard/candidature/"+MEMO.cId);
            MEMO.cId="";
        }
        else
        {
            if(MEMO.url && MEMO.user)
            {
                //console.log("import candidature ",MEMO.url,MEMO.jobTitle);
                return "importUrl";
            }            
        }
    }

    return "";
}


export const checkPasswordChange = function() {
    
    return fetch(MEMO.rootURL + '/rest/account/checkPasswordChange', {
        method: 'GET',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    });
}