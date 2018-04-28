package fr.gouv.motivaction.mails;

import java.time.LocalDateTime;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;


public class UserAccountMail {

	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "028";
    
    // compteur pour dénombrer le nombre de mails envoyés
    private static int cptNbEnvoiPassword = 0;
    private static int cptNbEnvoiLoginChange = 0;
    private static int cptNbEnvoiSuppressionCompte = 0;
    private static int cptNbEnvoiCreationCompte = 0;
    
    public static void sendNewAccountNotification(User user, boolean testMode) throws Exception
    {
        // envoie un email avec un code de validation pour

    	String to = user.getLogin();
        String subject = "Bienvenue sur MEMO";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "bienvenue";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(user.getLogin());

        String body = MailTools.buildHtmlHeader(us);

        body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />Vous venez de créer votre compte sur MEMO.<br /><br /> " +
                "MEMO vous permet de <strong>suivre l'ensemble de vos candidatures</strong> en un seul endroit et de <strong>booster le potentiel</strong> de chacune d'entre elles, grâce à ses <strong>conseils et alertes personnalisées !</strong><br /><br />" +
                "Pour découvrir ce service, vous pouvez visionner la vidéo de présentation <a href='https://www.youtube.com/embed/Cr-hCaqO298'>en cliquant ici</a>.<br /><br />" +   
                "Pour commencer il vous suffit d'y enregistrer les candidatures que vous avez récemment faites et/ou les prochaines : " +
                "</td></tr>";

        body += MailTools.buildHTMLSignature(source,campaign, "", false);
        body += MailTools.buildHTMLFooter(us, source, campaign);
        
        boolean enBCC = false;
        // Pour limiter l'envoi de mails aux admins
    	if (cptNbEnvoiCreationCompte%MailTools.moduloFiltreAccount == 0) {
    		enBCC = true;
    	}
    	if ("PROD".equals(MailTools.env) || testMode ||("RECETTE".equals(MailTools.env) && cptNbEnvoiCreationCompte%MailTools.moduloFiltreAccount == 0)) { 
        	// PROD ou RECETTE avec modulo OK 
    		MailService.sendMailWithImage(to, subject, body, testMode, enBCC);
        }
    	cptNbEnvoiCreationCompte++;

        log.info(logCode + "-004 ACCOUNT Envoi d'un email de création de compte. userId="+ user.getId()+ " loginEmail="+user.getLogin() + " facebookId=" + user.getFacebookId()+" peId="+user.getPeId());
    }

    public static void sendPasswordMail(User user)
    {
        String to = user.getLogin();
        String subject = "Nouveau mot de passe";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "lost_password";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(user.getLogin());

        String body = MailTools.buildHtmlHeader(us);

        body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "<br />Bonjour,<br /><br />votre nouveau mot de passe a bien été enregistré.<br /><br />Si vous n'avez pas effectué ce genre d'opération veuillez contacter le support MEMO." +
                "</td></tr>";

        body += MailTools.buildHTMLSignature(source,campaign, "", false);
        body += MailTools.buildHTMLFooter(us, source, campaign);

        MailService.sendMailWithImage(to, subject, body, false, false);

        cptNbEnvoiPassword++;

        log.info(logCode + "-001 ACCOUNT New password sent. userId="+user.getId()+" userLogin=" + user.getLogin());
    }

    public static void sendChangeLoginMail(User user, String oldLogin)
    {
        String to = user.getLogin();
        String subject = "Nouvelle adresse de login";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "new_login";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(oldLogin);

        String body = MailTools.buildHtmlHeader(us);

        body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "<br />Bonjour,<br /><br />votre nouvel email de login a bien été enregistré pour : "+user.getLogin()+".<br /><br />Si vous n'avez pas effectué ce genre d'opération veuillez contacter le support MEMO." +
                "</td></tr>";

        body += MailTools.buildHTMLSignature(source,campaign, "", false);
        body += MailTools.buildHTMLFooter(us, source, campaign);

        MailService.sendMailWithImage(to, subject, body, false, false);

        cptNbEnvoiLoginChange++;

        log.info(logCode + "-005 ACCOUNT New login email sent. userId="+user.getId()+" userLogin=" + user.getLogin());
    }

    public static boolean sendPasswordRefreshLinkMail(User user, String userToken)
    {
        boolean isSent = false;
    	String to = user.getLogin();
        String subject = "Mot de passe oublié";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "lost_password";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(user.getLogin());

        String body = MailTools.buildHtmlHeader(us);

        body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "<br />Bonjour,<br /><br />vous avez demandé à recevoir un nouveau mot de passe pour accéder à votre compte MEMO. <br /><br /> Vous devez cliquer sur le lien suivant pour confirmer votre demande : <br /><br />" +
                " <a href='"+ MailTools.url+"/?resetToken=" + userToken+ "'>Lien de renouvellement de mot de passe</a><br />" +
                "</td></tr>";

        body += MailTools.buildHTMLSignature(source,campaign, "", true);
        body += MailTools.buildHTMLFooter(us, source, campaign);

        isSent = MailService.sendMailWithImage(to, subject, body, false, false);

        if (isSent) {
        	cptNbEnvoiPassword++;
        	log.info(logCode + "-002 ACCOUNT Password refresh link sent. userId="+user.getId()+" userLogin=" + user.getLogin());
        }
        
        return isSent; 
    }
    
    public static void sendSuppressionCompteMail(User user)
    {
        // envoie un email avec un code de validation pour supprimer le compte

    	String to = user.getLogin();
        String subject = "Supprimer votre compte";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "delete_account";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(user.getLogin());

        String body = MailTools.buildHtmlHeader(us);

        body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";

        body += "Bonjour,<br /><br />Vous avez demandé la suppression de votre compte, si ce n'est pas le cas ou que vous avez changé d'avis, veuillez ignorer cet email.<br /><br />";

        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;
        body += "Si vous le souhaitez, vous pouvez uniquement <a href='"+MailTools.url+"/rest/account/unsubscribe/"+UserService.getUnsubscribeLinkForUser(us.getUserId())+params+"'>vous désinscrire des notifications</a>.<br /><br />";

        body += "Sinon, vous pouvez <a href='"+ MailTools.url+"/rest/account/supprimerCompte/"+UserService.getSuppressionCompteLinkForUser(us.getUserId())+"'>confirmer la suppression définitive de votre compte</a> <i>(par mesure de sécurité ce lien n'est valable qu'une heure)</i><br /><br /></td></tr>";
        body += MailTools.buildHTMLSignature(source,campaign, "", true);
        body += MailTools.buildHTMLFooter(us, source, campaign);
         
		MailService.sendMailWithImage(to, subject, body, false, false);
		
		cptNbEnvoiSuppressionCompte++;

        log.info(logCode + "-003 ACCOUNT Envoi d'un email de suppression de compte. userId="+user.getId()+" userLogin=" + user.getLogin());
    } 
}

