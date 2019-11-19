package fr.gouv.motivaction;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Timestamp;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.exception.EmailLoginException;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.mails.UserAccountMail;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.service.APIService;
import fr.gouv.motivaction.service.CandidatureService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Utils;

import static fr.gouv.motivaction.service.UserService.getUserIdFromVisitorLink;

@Path("/account")
public class AccountAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "001";

    public static Timer userLoginTimer = Utils.metricRegistry.timer("userLogin");
//    public static Timer facebookLoginTimer = Utils.metricRegistry.timer("facebookLogin");


    @POST
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String createAccount(@FormParam("accountLoginEmail") String accountLoginEmail,
                               @FormParam("accountLoginPassword") String accountLoginPassword,
                                @Context HttpServletResponse servletResponse,
                                @Context HttpServletRequest servletRequest,
                                MultivaluedMap<String,String> form)
    {
        String res = "";
        long userId = 0;

        try
        {
            User user = UserService.loadUserFromLogin(accountLoginEmail);
            if(user==null)
            {
                //pas de user, on peut donc en créer un
                String source = form.getFirst("source");
                user = UserService.createNewUser(accountLoginEmail,accountLoginPassword,source);
                UserService.setUserAuthenticationToken(user,servletRequest,servletResponse);
                // pour les logs
                userId = user.getId();

                String csrf = UserService.getEncryptedToken(user);

                Utils.logUserAction(user.getId(), "User", "Création", 0);
                Utils.logUserAction(user.getId(), "User", "Connexion", 0);

                res = "{ \"result\" : \"ok\", \"msg\" : \"userCreated\", \"user\" : "+user.toJSON()+", \"csrf\" : \""+csrf+"\"  }";
            }
            else
            {
            	// pour les logs
                userId = user.getId();
                
                user = UserService.loadUserFromCredentials(accountLoginEmail, accountLoginPassword);
                if (user != null)
                {
                	// Connexion du user si ces id sont OK
                	UserService.setUserAuthenticationToken(user, servletRequest, servletResponse);
                    Utils.logUserAction(user.getId(), "User", "Connexion", 0);
                    String csrf = UserService.getEncryptedToken(user);
                    res = "{ \"result\" : \"ok\", \"msg\" : \"userAuthentified\", \"user\" : "+user.toJSON()+", \"csrf\" : \""+csrf+"\" }";
                }
                else
                {
                	res = "{ \"result\" : \"error\", \"msg\" : \"userExists\" }";
                }
            }
        }
        catch(Exception e)
        {
            log.error(logCode+"-001 ACCOUNT Error creating account. userId="+userId+" login="+accountLoginEmail+" error="+e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }


    @POST
    @Path("accountLogin")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String accountAuthentication(@FormParam("loginEmail") String loginEmail,
                                         @FormParam("loginPassword") String loginPassword,
                                        @Context HttpServletResponse servletResponse,
                                        @Context HttpServletRequest servletRequest)
    {
        String res = "";
        long userId = 0;
        
        final Timer.Context context = userLoginTimer.time();

        try
        {
            User user = UserService.loadUserFromCredentials(loginEmail, loginPassword);
            //boolean authOK = true;
            if (user == null)
            {
                res = "{ \"result\" : \"error\", \"msg\" : \"wrongCredentials\" }";
                //authOK = false;
            }
            else
            {
            	userId = user.getId();
                UserService.setUserAuthenticationToken(user, servletRequest, servletResponse);
                Utils.logUserAction(user.getId(), "User", "Connexion", 0);
                String csrf = UserService.getEncryptedToken(user);
                // On réactive les notifications pour les utilisateurs désactivés automatiquement
                UserService.reactivateNotification(user);
                res = "{ \"result\" : \"ok\", \"msg\" : \"userAuthentified\", \"user\" : "+user.toJSON()+", \"csrf\" : \""+csrf+"\" }";
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-003 ACCOUNT Auth error. userId="+userId+" loginEmail="+loginEmail+" error="+e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }
        finally {
            context.stop();
        }

        return res;
    }

    @GET
    @Path("user")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String getUserFromCookie(    @Context HttpServletResponse servletResponse,
                                        @Context HttpServletRequest servletRequest) {
        String res = "";

        long userId = UserService.checkUserAuth(servletRequest);

        if (userId > 0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);

                if(user!=null)
                {
                    Utils.logUserAction(user.getId(), "User", "Connexion implicite", 0);
                    String csrf = UserService.getEncryptedToken(user);
                    // On réactive les notifications pour les utilisateurs désactivés automatiquement
                    UserService.reactivateNotification(user);
                    res = "{ \"result\" : \"ok\", \"msg\" : \"userAuthentified\", \"user\" : " + user.toJSON() + ", \"csrf\" : \"" + csrf + "\" }";
                }
                else
                {   // utilisateur inconnu
                    res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
                }

            } catch (Exception e) {
                log.error(logCode + "-035 ACCOUNT Error loading user from cookie. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        } else {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
        }

        return res;
    }

    @GET
    @Path("user/link/{link}")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String getUserFromLink(    @Context HttpServletRequest servletRequest, @PathParam("link")String link) {
        String res = "";
        long userId = getUserIdFromVisitorLink(link);

        if (userId > 0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);

                if(user!=null)
                {
                    Utils.logUserAction(user.getId(), "User", "Visite par lien", 0);
                    String csrf = UserService.getEncryptedToken(user);

                    res = "{ \"result\" : \"ok\", \"msg\" : \"userAuthentified\", \"user\" : " + user.toVisitorJSON() + ", \"csrf\" : \"" + csrf + "\" }";
                }
                else
                {
                    // utilisateur inconnu
                    res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
                }

            } catch (Exception e) {
                log.error(logCode + "-039 ACCOUNT Error loading user from visitor link. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        } else {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
        }

        return res;
    }

    @GET
    @Path("user/linkConseiller/{link}")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String getUserFromLinkConseiller(    @Context HttpServletRequest servletRequest, @PathParam("link")String link) {
        String res = "";

        boolean isIpConseiller = Utils.isIpConseiller(servletRequest);

        long userId = getUserIdFromVisitorLink(link);

        if(isIpConseiller)
        {
            if (userId > 0)
            {
                try
                {
                    User user = UserService.loadUserFromId(userId);

                    if(user!=null)
                    {
                        Utils.logUserAction(user.getId(), "User", "Visite par conseiller", 0);
                        String csrf = UserService.getEncryptedToken(user);

                        res = "{ \"result\" : \"ok\", \"msg\" : \"userAuthentified\", \"user\" : " + user.toVisitorJSON() + ", \"csrf\" : \"" + csrf + "\" }";
                    }
                    else
                    {   // utilisateur inconnu
                        res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
                    }

                } catch (Exception e) {
                    log.error(logCode + "-040 ACCOUNT Error loading user from conseiller link. userId=" + userId + " error=" + e);
                    res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
                }
            } else {   // message de reconnexion
                res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
            }
        }
        else {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"accessNotAllowed\" }";
        }

        return res;
    }

    @POST
    @Path("logout")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String logoutUser(@Context HttpServletResponse servletResponse,@Context HttpServletRequest servletRequest)
    {
        String res = "";

        long userId = UserService.checkUserAuth(servletRequest);

        try
        {
            UserService.logoutUser(servletResponse, servletRequest);

            if(userId>0)
                Utils.logUserAction(userId, "User", "Déconnexion", 0);

            res = "{ \"result\" : \"ok\" }";
        }
        catch (Exception e)
        {
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }
        return res;
    }

    @POST
    @Path("password")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String resetPassword(@FormParam("loginEmail") String loginEmail)     // MOT DE PASSE OUBLIE
    {
        String res = "";
        boolean isSent = false;
        long userId= 0;

        try
        {
            User user = UserService.loadUserFromLogin(loginEmail);

            if (user == null)
            {
                res = "{ \"result\" : \"error\", \"msg\" : \"wrongCredentials\" }";
            }
            else
            {
            	userId = user.getId();
                String token = UserService.getPasswordRefreshLinkForUser(userId);
                UserService.saveUserRefreshLink(userId,token);

                // Envoi du mail à l'utilisateur
                isSent = UserAccountMail.sendPasswordRefreshLinkMail(user, token);
                
                if (isSent)
                	res = "{ \"result\" : \"ok\" }";
                else
                	res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
                
                //UserAccountMail
                log.info(logCode + "-004 ACCOUNT Forgotten password refresh link sent. userId="+userId+" login=" + loginEmail);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-005 ACCOUNT Error getting forgotten password refresh link. userId="+userId+" login="+loginEmail+" error="+e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    @POST
    @Path("passwordREACT")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String resetPasswordREACT(@FormParam("loginEmail") String loginEmail)     // MOT DE PASSE OUBLIE, duplication temporaire pour la beta REACT
    {
        String res = "";
        boolean isSent = false;
        long userId= 0;

        try
        {
            User user = UserService.loadUserFromLogin(loginEmail);

            if (user == null)
            {
                res = "{ \"result\" : \"error\", \"msg\" : \"wrongCredentials\" }";
            }
            else
            {
                userId = user.getId();
                String token = UserService.getPasswordRefreshLinkForUser(userId);
                UserService.saveUserRefreshLink(userId,token);

                // Envoi du mail à l'utilisateur
                isSent = UserAccountMail.sendPasswordRefreshLinkMailREACT(user, token);

                if (isSent)
                    res = "{ \"result\" : \"ok\" }";
                else
                    res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";

                log.info(logCode + "-004 ACCOUNT Forgotten password refresh link sent. userId="+userId+" login=" + loginEmail);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-005 ACCOUNT Error getting forgotten password refresh link. userId="+userId+" login="+loginEmail+" error="+e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    @POST
    @Path("resetPassword")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.TEXT_PLAIN)
    public String saveNewPassword(@Context HttpServletRequest servletRequest,@FormParam("newPassword") String newPassword,@FormParam("resetToken") String resetToken)
    {
        String res = "";

        long userId = UserService.getUserIdFromPasswordRefreshLink(resetToken);

        if(userId>0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);

                if(user.getChangePasswordToken().equals(resetToken))
                {
                    user.setPassword(newPassword);
                    user.setChangePasswordToken("");
                    user.setLastPasswordChange(new Timestamp(System.currentTimeMillis()));

                    UserService.save(user);

                    // Envoi du mail à l'utilisateur
                    UserAccountMail.sendPasswordMail(user);

                    Utils.logUserAction(userId, "User", "Mot de passe renouvelé", 0);

                    res = "{ \"result\" : \"ok\" }";

                    log.info(logCode + "-006 ACCOUNT User renewed its password. userId=" + userId + " userLogin="+user.getLogin());
                }
                else
                {   // token déjà consommé
                    res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
                }
            }
            catch (Exception e)
            {
                log.error(logCode+"-007 ACCOUNT Error renewing password. userId="+userId+" error="+e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"tokenExpired\" }";
        }

        return res;
    }

    // retourne l'id de l'utilisateur
    @GET
    @Path("userId")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUserId(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);
        if(userId>0)
        {
            res = "{ \"result\" : \"ok\", \"userId\" : " + userId+ " }";
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // retourne un lien d'accès au site pour un visiteur
    @GET
    @Path("visitorLink")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getVisitorLink(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0)
        {
            log.info(logCode+"-008 ACCOUNT Getting visitor link. userId="+userId);
            res = "{ \"result\" : \"ok\", \"visitorLink\" : \"" + UserService.getVisitorLinkForUser(userId)+ "\" }";
        }
        else
        {   // message de reconnexion
            log.warn(logCode+"-009 ACCOUNT Unauthentified try to get visitor link. userId="+userId);
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // désinscrit un utilisateur des envois de mail
    @GET
    @Path("unsubscribe/{userKey}")
    @Produces({ MediaType.TEXT_HTML })
    public String unsubscribe(@Context HttpServletRequest servletRequest,@PathParam("userKey")String userKey)
    {
        String res = "<html><head><title>MEMO</title>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> " +
                "<meta http-equiv='X-UA-Compatible' content='IE=edge'>" +
                "<script>setTimeout('window.location.replace(\""+MailTools.url+"\")',10000);</script>" +
                "</head><body style='margin:auto; text-align:center; margin-top:150px'><div style='margin:auto; text-align:center; font-weight: bold; font-family:verdana; font-size:24px'>";

        long userId = UserService.getUserIdFromUnsubscribeLink(userKey);

        if(userId>0)
        {
            try {
                UserService.setUserSubscription(userId, 0, "Désabonnement depuis Mail");

                res += "Vous vous êtes désinscrit des notifications de MEMO";

                log.info(logCode+"-012 ACCOUNT User unsubscribed. userId="+userId);
            }
            catch (Exception e)
            {
                log.error(logCode+"-013 ACCOUNT Error unsubscribing. userId="+userId+" error="+e);
                res += "Une erreur s'est produite lors de votre désinscription";
            }
        }
        else
        {   // message de reconnexion
            res += "Le lien cliqué ne fonctionne pas";
        }

        res+="<br /><br />Vous allez être redirigé sur le site de MEMO</body></html>";

        return res;
    }
    
    // récupère les paramètres
    @GET
    @Path("parametres")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getParametres(@Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);
                res = "{ \"result\" : \"ok\", \"receiveEmail\" : "+user.getReceiveNotification()+", \"consentAccess\" : "+user.getConsentAccess()+",\"login\" : \""+user.getLogin()+"\" }";
            }
            catch (Exception e)
            {
                log.error(logCode+"-014 ACCOUNT Error getting user parametres. userId="+userId+" error="+e);
                res = "{ \"result\" : \"error\", \"msg\" : \"sysError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    // enregistre les parametres
    @POST
    @Path("parametres")
    @Produces({ MediaType.APPLICATION_JSON })
    public String setParametres(@FormParam("receiveEmail") int receiveEmail, @Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try {
            	if(receiveEmail==0)
            		UserService.setUserSubscription(userId, receiveEmail, "Désabonnement depuis Param");
            	else
            		UserService.setUserSubscription(userId, receiveEmail, "Abonnement depuis Param");

                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-015 ACCOUNT Error updating user email subscriptions. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"sysError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    @POST
    @Path("newPassword")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String setNewPassword(@FormParam("login") String login,
    								@FormParam("lastPassword") String password, 
    									@FormParam("newPassword") String newPassword,
                                        	@Context HttpServletResponse servletResponse,
                                        	@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res = "";

        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0) {

            try {
                User user = UserService.loadUserFromCredentials(login, password);
                if (user == null) {
                    res = "{ \"result\" : \"error\", \"msg\" : \"wrongPassword\" }";
                }
                else if(userId!=user.getId())
                {
                    res = "{ \"result\" : \"error\", \"msg\" : \"wrongPassword\" }";
                    log.error(logCode + "-022 ACCOUNT New password error. userId=" + userId + " login=" + login + " error=User attempting to change someone else password");
                }
                else
                {
                    userId = user.getId();
                    user.setPassword(newPassword);
                    user.setLastPasswordChange(new Timestamp(System.currentTimeMillis()));
                    UserService.save(user);

                    res = "{ \"result\" : \"ok\", \"msg\" : \"passwordModified\" }";

                    // Envoi du mail à l'utilisateur
                    UserAccountMail.sendPasswordMail(user);
                    log.info(logCode + "-024 ACCOUNT User changed its password. userId=" + userId + " userLogin=" + user.getLogin());
                    Utils.logUserAction(userId, "User", "Mot de passe modifié", 0);
                }
            } catch (Exception e) {
                log.error(logCode + "-016 ACCOUNT New password error. userId=" + userId + " login=" + login + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @POST
    @Path("newEmail")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String setNewEmailLogin(@FormParam("login") String login,
                                 @FormParam("password") String password,
                                 @FormParam("newEmail") String newEmail,
                                 @Context HttpServletResponse servletResponse,
                                 @Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res = "";

        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                User user;

                if(password==null || password.equals(""))
                {
                    user = UserService.loadUserFromId(userId);
                    if( user!=null && (user.getPeId()==null || user.getPeId().equals("")) ) // le changement d'email sans mot de passe n'est autorisé que pour les PE connectés
                        user = null;    // sinon on rejette la demande
                }
                else
                    user = UserService.loadUserFromCredentials(login, password);

                if (user == null)
                {
                    res = "{ \"result\" : \"error\", \"msg\" : \"wrongPassword\" }";
                }
                else if(userId!=user.getId())
                {
                    res = "{ \"result\" : \"error\", \"msg\" : \"wrongPassword\" }";
                    log.error(logCode + "-023 ACCOUNT New e-mail error. userId=" + userId + " login=" + login + " error=User attempting to change someone else e-mail");
                }
                else
                {
                    User user2 = UserService.loadUserFromLogin(newEmail);   // on vérifie que l'adresse email est libre

                    if(user2==null)
                    {
                        userId = user.getId();

                        user.setLogin(newEmail);
                        user.setPassword(password); // user ne contenait aucun mdp suite au load d'où le besoin de le repositionner avant un save

                        UserService.save(user);
                        res = "{ \"result\" : \"ok\", \"msg\" : \"emailModified\" }";

                        UserAccountMail.sendChangeLoginMail(user,login);
                        log.info(logCode + "-020 ACCOUNT New login saved. userId=" + userId + " oldLogin=" + login + " newLogin=" + newEmail);
                        Utils.logUserAction(userId, "User", "Email modifié", 0);
                    }
                    else
                        res = "{ \"result\" : \"error\", \"msg\" : \"userExists\" }";
                }
            }
            catch (Exception e)
            {
                log.error(logCode + "-016 ACCOUNT New email error. userId=" + userId + " login=" + login + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    // envoie du mail de suppression de compte
    @POST
    @Path("mailSupprimerCompte")
    @Produces({ MediaType.TEXT_PLAIN })
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String sendMailSupprimerCompte(@Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res;
        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);
                // Envoi du mail à l'utilisateur
                UserAccountMail.sendSuppressionCompteMail(user);
                res = "{ \"result\" : \"ok\", \"login\" : \""+user.getLogin()+"\" }";
            }
            catch (Exception e)
            {
                log.error(logCode+"-017 ACCOUNT Error sending email de suppression de compte. userId="+userId+" error="+e);
                res = "{ \"result\" : \"error\", \"msg\" : \"sysError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }
    
    // suppression de compte
    @GET
    @Path("supprimerCompte/{userToken}")
    @Produces({ MediaType.TEXT_HTML })
    public String supprimerCompte(@Context HttpServletResponse servletResponse, @Context HttpServletRequest servletRequest, @PathParam("userToken")String userToken)
    {
    	String res = "<html><head><title>MEMO</title>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> " +
                "<meta http-equiv='X-UA-Compatible' content='IE=edge'>" +
                "<script>setTimeout('window.location.replace(\""+MailTools.url+"\")',10000);</script>" +
                "</head><body style='margin:auto; text-align:center; margin-top:150px'><div style='margin:auto; text-align:center; font-weight: bold; font-family:verdana; font-size:24px'>";

        long userId = UserService.getUserIdFromSuppressionCompteLink(userToken);

        if(userId>0)
        {
            try {
                
            	UserService.logoutUser(servletResponse,servletRequest);

            	UserService.prepareUserForDeletion(userId);

                Utils.logUserAction(userId, "User", "SuppressionCompte", 0);

                res += "Vous avez supprimé votre compte MEMO<br/>";

                log.info(logCode+"-018 ACCOUNT User account deleted. userId="+userId);
            }
            catch (Exception e)
            {
                log.error(logCode+"-019 ACCOUNT Error deleting account. userId="+userId+" error="+e);
                res += "Une erreur s'est produite lors de votre suppression de compte";
            }
        }
        else
        {   // message de reconnexion
            res += "Le lien cliqué ne fonctionne pas, veuillez contacter l'équipe de MEMO.<br/>";
        }
        res+="<br /><br />Vous allez être redirigé sur le site de MEMO</body></html>";
        
        return res;
    }


    // ctrl du besoin de modifier le mot de passe
    @GET
    @Path("checkPasswordChange")
    @Produces({ MediaType.APPLICATION_JSON })
    public String checkPasswordChange(@Context HttpServletResponse servletResponse, @Context HttpServletRequest servletRequest)
    {
        String res;
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0)
        {
            try
            {
                res = "{ \"result\" : \""+UserService.checkPasswordChange(userId)+"\" }";
            }
            catch (Exception e)
            {
                log.error(logCode+"-021 ACCOUNT Error checking last password change. userId="+userId+" error="+e);
                res = "{ \"result\" : \"error\", \"msg\" : \"sysError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    // redirection vers la mire PEConnect
    @GET
    @Path("peConnect")
    public javax.ws.rs.core.Response showPeConnectForm(@Context HttpServletRequest request) throws Exception
    {
        String noPrompt = request.getParameter("noPrompt");

        boolean noPromptBoolean = false;

        if(noPrompt!=null)
            noPromptBoolean = true;

        URI uri = APIService.getPEConnectFormURI(noPromptBoolean);
        return javax.ws.rs.core.Response.temporaryRedirect(uri).build();
    }

    // redirection vers la mire PEConnect duplication version react
    @GET
    @Path("peConnect/react")
    public javax.ws.rs.core.Response showPeConnectFormREACT(@Context HttpServletRequest request) throws Exception
    {
        String noPrompt = request.getParameter("noPrompt");

        boolean noPromptBoolean = false;

        if(noPrompt!=null)
            noPromptBoolean = true;

        URI uri = APIService.getPEConnectFormURIREACT(noPromptBoolean);

        return javax.ws.rs.core.Response.temporaryRedirect(uri).build();
    }

    // redirection depuis la mire PE après une authentification correcte
    @GET
    @Path("/peConnect/openidconnectok")
    public javax.ws.rs.core.Response getPeConnectUser(@Context HttpServletResponse servletResponse, @Context HttpServletRequest servletRequest) throws Exception
    {
        String errorCode="";
        try
        {
            User user = APIService.getUserFromPEConnect(servletRequest);

            if(user!=null)
            {
                UserService.setUserAuthenticationToken(user, servletRequest, servletResponse);
                Utils.logUserAction(user.getId(), "User", "Connexion PE Connect", 0);

                // On réactive les notifications pour les utilisateurs désactivés automatiquement
                UserService.reactivateNotification(user);
            }
            else {
                throw new Exception("Could not get MEMO user");
            }
        }
        catch (Exception e)
        {
            if (e.getClass() == EmailLoginException.class)
            	errorCode="&PEAMError=2"; // cas d'erreur d'un utilisateur sans adresse email valide de PE.FR
            else
            	errorCode="&PEAMError=1";
            log.error(logCode+"-025 ACCOUNT Error connecting user with PEAM ("+errorCode+"). error="+e);
        }

        URI uri = new URI(APIService.memoHost+"/?PEAMConnect=1"+errorCode);
        return javax.ws.rs.core.Response.temporaryRedirect(uri).build();
    }

    // redirection depuis la mire PE après une authentification correcte duplication REACT
    @GET
    @Path("/peConnect/react/openidconnectok")
    public javax.ws.rs.core.Response getPeConnectUserREACT(@Context HttpServletResponse servletResponse, @Context HttpServletRequest servletRequest) throws Exception
    {
        String errorCode="";
        try
        {
            User user = APIService.getUserFromPEConnectREACT(servletRequest);

            if(user!=null)
            {
                UserService.setUserAuthenticationToken(user, servletRequest, servletResponse);
                Utils.logUserAction(user.getId(), "User", "Connexion PE Connect", 0);

                // On réactive les notifications pour les utilisateurs désactivés automatiquement
                UserService.reactivateNotification(user);
            }
            else
                throw new Exception("Could not get MEMO user");
        }
        catch (Exception e)
        {
            if (e.getClass() == EmailLoginException.class)
                errorCode="&PEAMError=2"; // cas d'erreur d'un utilisateur sans adresse email valide de PE.FR
            else
                errorCode="&PEAMError=1";
            log.error(logCode+"-025 ACCOUNT Error connecting user with PEAM ("+errorCode+"). error="+e);
        }

        URI uri = new URI(APIService.memoHost+"/react?PEAMConnect=1"+errorCode);
        return javax.ws.rs.core.Response.temporaryRedirect(uri).build();
    }

    @POST
    @Path("accountSource")
    @Produces(MediaType.TEXT_PLAIN)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public String setAccountSource(@FormParam("source") String source,
                                   @Context HttpServletResponse servletResponse,
                                   @Context HttpServletRequest servletRequest, MultivaluedMap<String,String> form)
    {
        String res = "";

        long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

        if(userId>0)
        {
            try
            {
                User user = UserService.loadUserFromId(userId);
                if (user == null)
                {
                    res = "{ \"result\" : \"error\", \"msg\" : \"wrongPassword\" }";
                    log.error(logCode + "-026 ACCOUNT Error saving user source. userId=" + userId + " error=User not found");
                }
                else
                {
                    user.setSource(source);
                    UserService.save(user);
                    res = "{ \"result\" : \"ok\", \"msg\" : \"sourceSaved\" }";
                    Utils.logUserAction(userId, "User", "Source saved", 0);
                }
            }
            catch (Exception e)
            {
                log.error(logCode + "-027 ACCOUNT Error saving user source. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        else
        {   // message de reconnexion
            res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
        }

        return res;
    }

    @GET
    @Path("extractTDB")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getExtractTDB(@Context HttpServletResponse servletResponse, @Context HttpServletRequest servletRequest)
    {
        String res = null;
        long userId = UserService.checkUserAuth(servletRequest);

        if(userId>0) {
            try { 
            	log.info(logCode+"-028 ACCOUNT User extract TDB started. userId="+userId);
            	UserService.getExtractTDB(userId);
            	log.info(logCode+"-029 ACCOUNT User extract TDB completed. userId="+userId);
            	res = "{ \"result\" : \"ok\", \"userId\" : " + userId+ ", \"msg\" : \"extractTDBOk\" }";
            } catch (Exception e) {
            	log.error(logCode + "-027 ACCOUNT Error saving user source. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
            }
        }
        return res;
    }


    @GET
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    @Path("exportFile")
    public Response getExportFile(@Context HttpServletRequest servletRequest, @Context HttpServletResponse servletResponse)
    {
        long userId = UserService.checkUserAuth(servletRequest,true);
        byte[] document = null;
        String fileName="";

        if(userId>0)
        {
            try
            {
                fileName = "extractTDB-"+userId+".csv";
                String aFile = Constantes.pathCSV+fileName;
                document = Files.readAllBytes(Paths.get(aFile));
            }
            catch (Exception e)
            {
                log.error(logCode + "-010 Error downloading user export. userId="+userId+" error=" + e);
            }
        }

        return Response.ok(document, MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .build();
    }

    @GET
    @Path("/gotAJob/{token}")
    @Produces({ MediaType.TEXT_HTML })
    public String saveGotAJobNotification(@Context HttpServletRequest servletRequest, @PathParam("token")String token) throws IOException
    {
        String res = "<html><head><title>MEMO</title>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> " +
                "<meta http-equiv='X-UA-Compatible' content='IE=edge'>" +
                "<script>setTimeout('window.location.replace(\""+MailTools.url+"\")',10000);</script>" +
                "</head><body style='margin:auto; text-align:center; margin-top:150px'><div style='margin:auto; text-align:center; font-weight: bold; font-family:verdana; font-size:24px'>";
        long userId;

        // A partir du token, on récupère le userId
        userId = UserService.getUserIdFromUpdateCandidatureEmail(token);
        if(userId>0)
        {
            try
            {
                Utils.logUserAction(userId, "User", "Reprise d'emploi", 0);
                CandidatureService.createDummySuccesfulApplication(userId);
                UserService.setUserSubscription(userId, 0, "Désabonnement nouvel emploi");
                res += "Toutes nos félicitations !<br /><br />Nous mettons à jour votre compte MEMO en conséquence.<br /><br />";

                log.info(logCode+"-030 USER User got a job. userId="+userId);
            }
            catch (Exception e)
            {
                log.error(logCode+"-031 USER Error updating user state from got a job. userId="+userId+" error="+e);
                res += "Une erreur s'est produite lors de la mise à jour de votre compte.";
            }
        }
        else
        {   // message de reconnexion
            res += "Le lien a expiré";
        }

        res+="<br /><br />Vous allez être redirigé sur le site de MEMO</body></html>";
        return res;
    }

    // update du parametre de consentement d'accès à son TDB par un conseiller depuis MEMO
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("consentAccessState")
    public String updateConsentAccess(@Context HttpServletRequest servletRequest, @FormParam("consentAccess") int consentAccess, MultivaluedMap<String,String> form) throws Exception
    {
    	String res = null;
    	long c = 0 ;
    	long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

    	if(userId >0) {
    		try {
    			UserService.updateConsentAccess(userId, consentAccess, false);
    			res = "{ \"result\" : \"ok\"}";
    		}

    		catch (Exception e)
    		{
    			log.error(logCode + "-036 Error  . error=" + e);
    			res = "{ \"result\" : \"error\", \"msg\" : \"systemError\"}";
    		}
    	}
    	else {
    		log.warn(logCode + "-037 User  not authentified");
    		res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
    	}
    	return res ;
    }

    // update du parametre de consentement d'accès à son TDB par un conseiller depuis un email de demande d'accès
    @GET
    @Path("updateConsentAndDateAccess/{consentLink}/{consentAccess}")
    @Produces({ MediaType.TEXT_HTML })
    public String updateConsentAndDateAccess(@Context HttpServletRequest servletRequest, @PathParam("consentLink")String consentLink,  @PathParam("consentAccess")int consentAccess)
    {
    	String res = "<html><head><title>MEMO</title>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' /> " +
                "<meta http-equiv='X-UA-Compatible' content='IE=edge'>" +
                "<script>setTimeout('window.location.replace(\""+MailTools.url+"\")',10000);</script>" +
                "</head><body style='margin:auto; text-align:center; margin-top:150px'><div style='margin:auto; text-align:center; font-weight: bold; font-family:verdana; font-size:24px'>";

        boolean withDate = false;
        long userId = UserService.getUserIdFromConsentLink(consentLink);

        if(userId >0) {
    		try {
    			if (consentAccess == 1)
    				withDate = true;
    			UserService.updateConsentAccess(userId, consentAccess, withDate);
    			if (consentAccess == 0) {
    				// On enregistre la date du refus
    				UserService.updateLastAccessRefuserDate(userId);
    			}
                res += "Merci pour votre réponse !";
    		}

    		catch (Exception e)
    		{
    			log.error(logCode + "-032 Error  . error=" + e);
    			res += "Un problème technique est survenu, veuillez renouveler votre réponse !";
    		}
    	}
    	else {
    		log.warn(logCode + "-033 User  not authentified");
    		res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
    	}
        res+="<br /><br />Vous allez être redirigé sur le site de MEMO</body></html>";

    	return res ;
    }

    // update du parametre de notifications par email
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Path("notificationState")
    public String updateNotificationState(@Context HttpServletRequest servletRequest, @FormParam("notificationState") int notificationState, MultivaluedMap<String,String> form) throws Exception
    {
    	String res = null;
    	long userId = UserService.checkUserAuthWithCSRF(servletRequest, form);

    	if(userId >0)
    	{
			try
			{
            	if(notificationState==0)
            	{
            		UserService.setUserSubscription(userId, notificationState, "Désabonnement depuis Param");
            	}
            	else
            	{
            		UserService.setUserSubscription(userId, notificationState, "Abonnement depuis Param");
            	}

                res = "{ \"result\" : \"ok\" }";
            }
            catch (Exception e)
            {
                log.error(logCode + "-038 ACCOUNT Error updating user email subscriptions. userId=" + userId + " error=" + e);
                res = "{ \"result\" : \"error\", \"msg\" : \"sysError\" }";
            }
    	}
    	else {
    		log.warn(logCode + "-034 User  not authentified");
    		res = "{ \"result\" : \"error\", \"msg\" : \"userAuth\" }";
    	}
    	return res ;
      }

}
