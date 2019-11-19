package fr.gouv.motivaction.mails;

import java.time.LocalDateTime;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes;
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
    private static int cptNbEnvoiInvitDemandeur = 0;
    

    // envoi message création de compte via MEMO directement
    public static void sendNewAccountNotification(User user, boolean testMode) throws Exception
    {
        String subject = "Bienvenue sur MEMO";
        String body = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />Bienvenue sur MEMO de Pôle emploi, votre espace est désormais activé !<br /><br /> " +
                "Ce service vous permettra :<br /><ul>" +
                "<li>d'enregistrer et de suivre toutes vos candidatures en un seul endroit ;</li>"+
                "<li>de recevoir les alertes sur ce que vous devez faire ;</li>"+
                "<li>et de bénéficier des meilleurs conseils pour booster vos candidatures.</li></ul><br />"+
                "Pour en savoir plus sur MEMO, vous pouvez visionner la vidéo de présentation <a href='https://www.youtube.com/embed/Cr-hCaqO298'>en cliquant ici</a>."+
                "</td></tr>";

        sendNewAccountNotificationMail(user,testMode,subject,body,"");

        log.info(logCode + "-004 ACCOUNT Envoi d'un email de création de compte. userId="+ user.getId()+ " loginEmail="+user.getLogin() + " facebookId=" + user.getFacebookId()+" peId="+user.getPeId());
    }

    // envoi message création de compte via PEAM
    public static void sendNewAccountNotificationFrom(User user, boolean testMode, String from) throws Exception
    {
        // envoi un email informatif à un utilisateur ayant créé un compte via MEMO
        String subject = "Bienvenue sur MEMO de Pôle emploi";

        String name="";
        String signatureLink="";

        if(user.getFirstName()!=null)
            name+=" "+user.getFirstName();
        if(user.getLastName()!=null)
            name+=" "+user.getLastName();

        String body = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour"+name+",<br /><br />Bienvenue sur MEMO de Pôle emploi, votre espace est désormais activé !<br /><br /> " +
                "Ce service vous permettra :<br /><ul>" +
                "<li>d'enregistrer et de suivre toutes vos candidatures en un seul endroit ;</li>"+
                "<li>de recevoir les alertes sur ce que vous devez faire ;</li>"+
                "<li>et de bénéficier des meilleurs conseils pour booster vos candidatures.</li></ul><br />"+
                "Pour en savoir plus sur MEMO, vous pouvez visionner la vidéo de présentation <a href='https://www.youtube.com/embed/Cr-hCaqO298'>en cliquant ici</a>."+
                "</td></tr>";


        if(from.equals("JEPOSTULE"))
        {
            subject="Vos candidatures de La Bonne Boîte sont sur votre espace MEMO de Pôle emploi";
            body=   "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                    "Bonjour"+name+"<br /><br />Nous vous proposons de suivre les candidatures que vous avez effectuées sur le site de la Bonne Boîte sur votre espace MEMO.<br /><br /> " +
                    "Ce service vous permettra :<br /><ul>" +
                    "<li>d'enregistrer et de suivre toutes vos candidatures en un seul endroit ;</li>"+
                    "<li>de recevoir les alertes sur ce que vous devez faire ;</li>"+
                    "<li>et de bénéficier des meilleurs conseils pour booster vos candidatures.</li></ul><br />"+
                    "</td></tr>";

            signatureLink = "ACTIVER MON ESPACE MEMO";
        }

        sendNewAccountNotificationMail(user,testMode,subject,body,signatureLink);

        log.info(logCode + "-006 ACCOUNT Envoi d'un email de création de compte via " + from + ". userId="+ user.getId()+ " loginEmail="+user.getLogin() +" peId="+user.getPeId());
    }

    // envoi un email informatif à un utilisateur ayant créé un compte
    public static void sendNewAccountNotificationMail(User user, boolean testMode, String subject, String body, String signatureLink) throws Exception
    {
        String to = user.getLogin();

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(MailTools.formatter);
        String source = "bienvenue";
        UserSummary us = new UserSummary();
        us.setUserId(user.getId());
        us.setEmail(user.getLogin());

        String mailBody = MailTools.buildHtmlHeader(us);

        mailBody += body;

        mailBody += MailTools.buildHTMLSignature(source,campaign, signatureLink, false);
        mailBody += MailTools.buildHTMLFooter(us, source, campaign, true);

        boolean enBCC = false;
        // Pour limiter l'envoi de mails aux admins
        if (cptNbEnvoiCreationCompte%MailTools.moduloFiltreAccount == 0) {
            enBCC = true;
        }
        if ("PROD".equals(Constantes.env) || testMode ||("RECETTE".equals(Constantes.env) && cptNbEnvoiCreationCompte%MailTools.moduloFiltreAccount == 0)) {
            // PROD ou RECETTE avec modulo OK
            MailService.sendMailWithImage(to, subject, mailBody, testMode, enBCC);
        }
        cptNbEnvoiCreationCompte++;
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
        body += MailTools.buildHTMLFooter(us, source, campaign, true);

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
        body += MailTools.buildHTMLFooter(us, source, campaign, true);

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
        body += MailTools.buildHTMLFooter(us, source, campaign, true);

        isSent = MailService.sendMailWithImage(to, subject, body, false, false);

        if (isSent) {
        	cptNbEnvoiPassword++;
        	log.info(logCode + "-002 ACCOUNT Password refresh link sent. userId="+user.getId()+" userLogin=" + user.getLogin());
        }
        
        return isSent; 
    }

    // duplication react
    public static boolean sendPasswordRefreshLinkMailREACT(User user, String userToken)
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
                " <a href='"+ MailTools.url+"/react?resetToken=" + userToken+ "'>Lien de renouvellement de mot de passe</a><br />" +
                "</td></tr>";

        body += MailTools.buildHTMLSignature(source,campaign, "", true);
        body += MailTools.buildHTMLFooter(us, source, campaign, true);

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
        body += MailTools.buildHTMLFooter(us, source, campaign, true);
         
		MailService.sendMailWithImage(to, subject, body, false, false);
		
		cptNbEnvoiSuppressionCompte++;

        log.info(logCode + "-003 ACCOUNT Envoi d'un email de suppression de compte. userId="+user.getId()+" userLogin=" + user.getLogin());
    }

	public static boolean sendInvitationToUseMemo(String email) {
		
		String subject = "Votre conseiller Pôle emploi vous invite à activer votre espace Memo";
		String to = email;
		boolean isSent = false;
		
		LocalDateTime currentTime = LocalDateTime.now();
		String campaign = currentTime.format(MailTools.formatter);
		String source = "invit_applicant";
		UserSummary us = new UserSummary();
		us.setEmail(email);
		
		String body = MailTools.buildHtmlHeader(us);
		
		body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "<br />Bonjour,<br /><br />Votre conseiller Pôle emploi vous invite à créer votre espace Memo.<br /><br />Memo vous permet de <strong> suivre l'ensemble de vos candidatures </strong> en "
                + "un seul endroit et de <strong> booster le potentiel </strong> de chacune d'entre elles, grâce à <strong> ses conseils et alertes personnalisées !</strong><br><br>"
                + "Pour commencer il vous suffit d'y enregistrer les candidatures que vous avez récemment faites et/ou les prochaines : " +
                "</td></tr>";

        body += MailTools.buildHTMLSignatureRequestToUseMemo(source,campaign);
        body += MailTools.buildHTMLFooter(us, source, campaign, false);

        MailService.sendMailWithImage(to, subject, body, false, false);
        
        if(isSent)
        {
        	cptNbEnvoiInvitDemandeur++;	
	        log.info(logCode + "-004 Conseiller invit applicant sent. userLogin=" + email);
        }
        
		return isSent;
	}

	public static boolean sendRequestToAccessTDB(long id, String email) throws Exception {
		String subject = "Votre conseiller Pôle emploi souhaite accéder à votre espace Memo";
		String to = email;
		boolean isSent = false;
		
		LocalDateTime currentTime = LocalDateTime.now();
		String campaign = currentTime.format(MailTools.formatter);
		String source = "request_access";
		UserSummary us = new UserSummary();
		us.setUserId(id);
		us.setEmail(email);
		
		String body = MailTools.buildHtmlHeader(us);
		
		body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "<br />Bonjour,<br /><br />Votre conseiller Pôle emploi <strong>souhaite accéder à votre espace Memo : </strong><br /><br />  "
                + "En autorisant cet accès, vous permettez aux conseillers Pôle emploi de <strong>visualiser vos candidatures sur Memo. </strong>"
                + "Vous pouvez à tout moment revenir sur votre choix en cliquant sur Menu > Paramètres." +
                "</td></tr>";

		body += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>";
		body += "<table width='100%'>"+
        			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='"+MailTools.url+"/rest/account/updateConsentAndDateAccess/" + UserService.getConsentLinkForUser(us.getUserId())+ "/1" + "?utm_campaign="+campaign+"&utm_medium=email&utm_source=request_access_accepter' style='color:#fff; text-decoration:none; text-transform:uppercase;'>Autoriser</a></td><td style='width:25%;'></td></tr><br>"+
        			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px; border: 1px solid grey;'><a href='"+MailTools.url+"/rest/account/updateConsentAndDateAccess/" + UserService.getConsentLinkForUser(us.getUserId())+ "/0" + "?utm_campaign="+campaign+"&utm_medium=email&utm_source=request_access_refuser' style='color:grey; text-decoration:none; text-transform:uppercase;'>Refuser</a></td><td style='width:25%;'></td></tr>"+
        			"</table><br /><br />";

        body += MailTools.buildHTMLSignature(source,campaign, "", true);        
        body += MailTools.buildHTMLFooter(us, source, campaign, true);

        isSent = MailService.sendMailWithImage(to, subject, body, false, false);
        
        if(isSent)
        {
	        log.info(logCode + "-004 Envoie d'un email de demande d'accès au TDB. userId="+id+" userLogin=" + email);
        }
        
		return isSent;
	}
}

