<%@ page import="fr.gouv.motivaction.service.UserService" %>
<%@ page import="fr.gouv.motivaction.model.User" %>
<%@ page import="fr.gouv.motivaction.dao.UserDAO" %>
<%@ page import="fr.gouv.motivaction.utils.Utils" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    long userId =0;
    User user = null;
    String userLogin = "";
    String csrf = "";
    boolean isAdmin = false;
    String visitorLink = request.getParameter("link");
    if(visitorLink!=null)
        visitorLink = StringEscapeUtils.escapeXml11(visitorLink);

    boolean isVisitor = false;
    
    boolean isResetPasswd = false;
    if (request.getParameter("resetToken") != null) {
    	isResetPasswd = true;
    }

    if(request.getParameter("link")!=null)
    {
        userId = UserService.getUserIdFromLink(request);

        if(userId>0)
        {
            isVisitor = true;
            Utils.logUserAction(userId, "User", "Accès visiteur", 0);
        }
        else
            visitorLink="";
    }
    else
    {
        userId = UserService.checkUserAuth(request);

        if(userId > 0)
        {
            try
            {
                isAdmin = UserDAO.isAdmin(userId);
            }
            catch(Exception e){
                // erreur déjà loguée côté serveur
            }
        }
    }

    if(userId > 0)
    {
        try
        {
            user = UserService.loadUserFromId(userId);
        }
        catch (Exception e)
        {
            // erreur déjà loguée côté serveur
        }

        if (user != null && !isResetPasswd)
        {
            userLogin = user.getLogin();

            if(!isVisitor)
            {
            	// Connexion automatique s'il ne s'agit pas d'un visiteur, ni d'un renouvellement de mdp
                Utils.logUserAction(user.getId(), "User", "Connexion implicite", 0);
                csrf = UserService.getEncryptedToken(user);
             	// On réactive les notifications uniquement pour les utilisateurs désactivés automatiquement
                UserService.reactivateNotification(user);
            }
        }
        else
            userId=0;
    }

%>