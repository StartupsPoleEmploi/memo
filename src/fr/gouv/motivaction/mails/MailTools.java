package fr.gouv.motivaction.mails;

import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.DataSource;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.apache.log4j.Logger;

import com.mchange.v1.util.StringTokenizerUtils;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.dao.UserDAO;
import fr.gouv.motivaction.model.User;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.ConseillerService;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.Quartz;
import fr.gouv.motivaction.utils.Utils;

/**
 * Classe d'outils d'envoi d'emails
 * @author Alan
 *
 */

public class MailTools
{
    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "006";

    public static String host;
    public static String heloHost;
    
    // En cas de plantage du properties
    public static int moduloFiltreAccount = 100;
    public static int moduloFiltreWeekly = 1000;
    public static int moduloFiltreDaily = 50;
    public static int moduloFiltreInterviewPrep = 1;
    public static int moduloFiltreInterviewThanks = 10;
    public static int moduloFiltreLastConnect = 10;
    public static int moduloFiltreLastConnect60 = 1;
    public static int moduloFiltreLastConnect90 = 1;
    public static int moduloFiltreNudge = 50;
    public static int moduloFiltrePastInterview = 20;
    public static int moduloFiltrePastInterviewReminder = 20;
    public static int moduloFiltreAccountDisabled = 1;
    
    public static String port;
    // En cas de plantage du properties
    public static String personal = "MEMO de Pôle emploi";

    public static String noReply;
    public static String noReplyExt;
    
    public static String[] tabEmailIntra;
    public static String[] tabEmailDev;
    public static String[] tabEmailExtra;
    
    private static DataSource dsB;
    private static DataSource dsPE;

    public static String url;
    public static DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    static Properties prop;
    
    static {
        loadProperties();
    }
    
    private static void loadProperties() {
	    prop = new Properties();
	    InputStream in = null;

	    try {
	    	in = MailService.class.getResourceAsStream("/fr/gouv/motivaction/properties/mails.properties");
	    	prop.load(in);
	    	
	    	host = prop.getProperty("host");
    		url = prop.getProperty("url");
            heloHost = prop.getProperty("heloHost");
    		dsB = new FileDataSource(prop.getProperty("dsB"));
    		dsPE = new FileDataSource(prop.getProperty("dsPE"));
	    	
            try
            {
                moduloFiltreAccount = Integer.parseInt(prop.getProperty("modulo.filtre.account"));
                moduloFiltreWeekly = Integer.parseInt(prop.getProperty("modulo.filtre.weekly"));
                moduloFiltreDaily = Integer.parseInt(prop.getProperty("modulo.filtre.daily"));
                moduloFiltreInterviewPrep = Integer.parseInt(prop.getProperty("modulo.filtre.interviewPrep"));
                moduloFiltreInterviewThanks = Integer.parseInt(prop.getProperty("modulo.filtre.interviewThanks"));
                moduloFiltreLastConnect = Integer.parseInt(prop.getProperty("modulo.filtre.lastConnect"));
                moduloFiltreLastConnect60 = Integer.parseInt(prop.getProperty("modulo.filtre.lastConnect60"));
                moduloFiltreLastConnect90 = Integer.parseInt(prop.getProperty("modulo.filtre.lastConnect90"));
                moduloFiltreNudge = Integer.parseInt(prop.getProperty("modulo.filtre.nudge"));
                moduloFiltrePastInterview = Integer.parseInt(prop.getProperty("modulo.filtre.pastInterview"));
                moduloFiltrePastInterviewReminder = Integer.parseInt(prop.getProperty("modulo.filtre.pastInterviewReminder"));
                moduloFiltreAccountDisabled = Integer.parseInt(prop.getProperty("modulo.filtre.accountDisabled"));
            }
            catch(Exception e)
            {
                log.warn(logCode + "-008 MAILTOOLS properties error=" + e);
            }

	    	port = prop.getProperty("port");
	    	noReply = prop.getProperty("email.noReply");
	    	noReplyExt = prop.getProperty("email.noReplyExt");
	    	personal = prop.getProperty("email.personal");
	    	
	    	tabEmailIntra = StringTokenizerUtils.tokenizeToArray(prop.getProperty("emails.intrapreneur"), ";");
	    	tabEmailDev = StringTokenizerUtils.tokenizeToArray(prop.getProperty("emails.developpeur"), ";");
	    	tabEmailExtra = StringTokenizerUtils.tokenizeToArray(prop.getProperty("emails.extra"), ";");	    	
	    	
	    	formatter = DateTimeFormatter.ofPattern(prop.getProperty("dateFormatter"));

            in.close();
            
        } catch (IOException e) {
            log.error(logCode + "-009 MAILTOOLS properties error=" + e);
	    }
    }
    
    public static Properties getProperties() {
    	Properties res = new Properties();

    	res.put("mail.smtp.host", host);
        res.put("mail.smtp.port", port);
        res.put("mail.smtp.localhost", heloHost);
        //res.put("mail.smtp.localhost", "pole-emploi.fr"); trouver le nom précis de chaque machine et lui caser un nom pointant sur l'ip, si /etc/hostname suffisant ne pas décommenter
        //res.put("mail.smtp.localhost", "92.ip-167-114-255.eu");


        return res;
    }
    
    public static String buildSubject(boolean test, String subject, String to) {
    	String res = subject;
    	if ("RECETTE".equals(Constantes.env)) {
	    	// pour différencier les mails de la RE7, on ajoute le login au sujet du mail
    		res = subject + " " + to + "(" + Constantes.env + ")";
    	}
    	if(test) {
    		// pour différencier les mails de test
    		res = subject + " " + to + " - mail de test" + "(" + Constantes.env + ")";
    	}
    	return res;
    }
    
    private static InternetAddress buildInternetAdresseFrom(String to) {
    	InternetAddress res = null;
    	String from = MailTools.noReply;
    	  
		// spécificité du from si le domaine de l'email destinataire est du domaine pole-emploi.fr
        if (MailTools.isDomainePoleEmploi(to)) {
        	from = MailTools.noReplyExt;
        }    	 
    	try {
			res = new InternetAddress(from);
			res.setPersonal(personal);
    	}
    	catch (Exception e) {
            log.error(logCode + "-004 MAILTOOLS Error building Internet adresse (FROM) TO =" + to + " error=" + e);
        }
    	return res;
    }
    
    public static InternetAddress[] buildInternetAdressesTo(boolean test, String to) {
    	InternetAddress[] tabRes = null;
    	String[] tabTo = null;
    	try {
			if (("PROD_BATCH".equals(Constantes.env) || "PROD".equals(Constantes.env)) && !test) {  
		        	tabRes = new InternetAddress[] {new InternetAddress(to)};
			} else {
				tabTo = Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra);
		        if (tabTo != null && tabTo.length > 0) {
		        	tabRes = new InternetAddress[tabTo.length];
		        	int i = 0;
		            for (String email : tabTo) {
		            	tabRes[i] = new InternetAddress(email.trim());
		            	i++;
					} 
		        }	
			}
    	} 
    	catch (Exception e) {
            log.error(logCode + "-005 MAILTOOLS Error building Internet adresse (TO) TO =" + to + " error=" + e);
        }
    	return tabRes;
    }
    
    public static InternetAddress[] buildInternetAdressesBcc(boolean test) {
    	InternetAddress[] tabRes = null;
    	String[] tabBcc = null;
    	try {
			if ("PROD".equals(Constantes.env) && !test) {  
				tabBcc = Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra);
		        if (tabBcc != null && tabBcc.length > 0) {
		        	tabRes = new InternetAddress[tabBcc.length];
		        	int i = 0;
		            for (String email : tabBcc) {
		            	tabRes[i] = new InternetAddress(email.trim());
		            	i++;
					} 
		        }
			} 
    	} 
    	catch (Exception e) {
            log.error(logCode + "-006 MAILTOOLS Error building Internet adresse (BCC), error=" + e);
        }
    	return tabRes;
    }
    
    public static String buildHtmlHeader(UserSummary user)
    {
        String res = "<html><head><title>MEMO</title>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />" +
                "</head><body style='background:#f7f8fa;color:#20314d; font-family:verdana;font-size:16px'>";

        res+="<br /><div style='width:75%; min-width:300px; max-width:800px; margin:auto;'>";
        res+="<table style='width:100%; font-family:verdana;font-size:16px; background-color:#fff' border='0' cellpadding='0' cellspacing='0' >" +
                "<tr><td style='border:1px solid #c1c1c1; padding: 5px 10px; border-bottom: 0; font-size: 24px; font-weight: bold;'>" +
                "<table width='100%' border='0' cellpadding='0' cellspacing='0'>" +
                "<td style='text-align:left'><a href='"+url+"' style='color:black;text-decoration:none'><img src='cid:logoMEMO' alt='Logo MEMO'/></a></td>" +
                "<td style='text-align:right'><a href='http://www.pole-emploi.fr' style='float:right;color:black;text-decoration:none'><img src='cid:logoPoleEmploi' alt='logo pole emploi'/></a></td>" +
                "</table></td></tr>";

        return res;
    }

    public static String buildHTMLFooter(UserSummary user, String source, String campaign, boolean withFaqUnsubscribeSmallLink)
    {
        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        String res="";

        res+="<tr style='background:#20314d;'><td style='color:#fff;text-align: center; padding:25px 10px;'>MEMO un service propulsé par Pôle emploi - <a href='"+url+params+"' style='color:#fff; text-decoration:none; white-space:nowrap'>memo.pole-emploi.fr</a></td></tr>";
        
        if (withFaqUnsubscribeSmallLink)
        	res+="<tr style='background:#f7f8fa;'><td style='text-align: center; font-size:12px; padding:15px 10px;'><a href='"+url+"/faq"+params+"' style='color:#20314d'>FAQ</a> - <a href='"+url+"/rest/account/unsubscribe/"+UserService.getUnsubscribeLinkForUser(user.getUserId())+params+"' style='color:#20314d'>Se désinscrire des notifications</a></td></tr>";
        
        res+="</table></div></body></html>";

        return res;
    }

    // construit le bloc HTML du bouton J'ai obtenu un poste pouvant être positionné dans certains emails
    public static String getGotAJobButton(UserSummary user, String source, String campaign)
    {
        String token = UserService.getUpdateCandidatureEmailLinkForUser(user.getUserId());
        String path = url + "/rest/account/gotAJob/"+token;
        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;
        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'><table width='100%'>" +
                "<tr><td colspan='3'>Peut être avez vous repris un emploi ? Si oui indiquez le en cliquant sur le bouton : <br /><br /></td></tr>" +
                "<tr><td style='width:25%;'></td>" +
                "<td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'>" +
                "<a href='"+path+params+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>J'ai repris un emploi</a></td>" +
                "<td style='width:25%;'></td></tr>"+
                "</table></td></tr>";

        return res;
    }

    public static String buildCustomTextButton(String text, String path)
    {
        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>" +
                "<table width='100%'>" +
                "<tr><td style='width:25%;'></td>" +
                "<td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'>" +
                "<a href='"+path+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>"+text+"</a></td>" +
                "<td style='width:25%;'></td></tr>"+
                "</table></td></tr>";

        return res;
    }


    public static String buildHTMLSignature(String source, String campaign, String lien, boolean topLight)
    {
        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>";

        if (!topLight)
        {
            // Signature complète
            if (lien == null || "".equals(lien))
                // Par défaut
                lien = "Aller sur mon espace MEMO";

            res+="<table width='100%'>"+
        			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='"+url+params+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>" + lien + "</a></td><td style='width:25%;'></td></tr>"+
        		"</table><br /><br />";
	        res+="A vos côtés pour réussir ensemble !<br />";
	        res+="L'équipe MEMO<br /><br />";
        }
        else
        {
        	// Signature light
        	res+="A vos côtés pour réussir ensemble !<br />";
            res+="L'équipe MEMO<br /><br />";
        }

        res+="<hr /><div style='text-align:center'>Besoin d'aide ?<br />Rendez-vous sur notre rubrique <strong><a href='"+url+"/faq"+params+"'>Aide / Support</a></strong></div><hr /></td></tr>";

        return res;
    }
    
    public static String buildHTMLSignatureRequestToUseMemo(String source, String campaign)
    {
        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>";

        res+="<table width='100%'>"+
    			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='"+url+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>Activer mon espace</a></td><td style='width:25%;'></td></tr>"+
    		"</table><br /><br />";
        
        res+="En cliquant sur \"Activer mon espace\", vous autorisez l’accès à votre espace Memo "
        		+ "aux conseillers de Pôle emploi. Vous pouvez à tout moment revenir sur votre choix en cliquant sur Menu > Paramètres.<br/><br/>";
        res+="A vos côtés pour réussir ensemble !<br />";
        res+="L'équipe MEMO<br /><br />";

        res+="<hr /><div style='text-align:center'>Besoin d'aide ?<br />Rendez-vous sur notre rubrique <strong><a href='"+url+"/faq"+params+"'>Aide / Support</a></strong></div><hr /></td></tr>";

        return res;
    }
    
    public static String buildHTMLSignatureRequestToAccessTDB(String to , String source, String campaign, String lien1 , String lien2 , boolean topLight) throws Exception
    {
        String params = "?utm_campaign="+campaign+"&utm_medium=email&utm_source="+source;

        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>";

        if (!topLight)
        {
            // Signature complète
            if (lien1 == null && lien2 == null || "".equals(lien1) && "".equals(lien2))
            {    // Par défaut
                lien1 = "Autoriser";
            	lien2 = "Refuser";
            }
            res+="<table width='100%'>"+
        			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#3C8123; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='"+url+"/rest/conseiller/accessAccepter/"+to+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>" + lien1 + "</a></td><td style='width:25%;'></td></tr><br>"+
        			"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#CE3616; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='"+url+"/rest/conseiller/accessRefuser/"+to+"' style='color:#fff; text-decoration:none; text-transform:uppercase;'>" + lien2 + "</a></td><td style='width:25%;'></td></tr><br>"+
        			"</table><br /><br />";
	        res+="A vos côtés pour réussir ensemble !<br />";
	        res+="L'équipe MEMO<br /><br />";
        }
        else
        {
        	// Signature light
        	res+="A vos côtés pour réussir ensemble !<br />";
            res+="L'équipe MEMO<br /><br />";
        }

        res+="<hr /><div style='text-align:center'>Besoin d'aide ?<br />Rendez-vous sur notre rubrique <strong><a href='"+url+"/faq"+params+"'>Aide / Support</a></strong></div><hr /></td></tr>";

        return res;
    }

    public static boolean isDomainePoleEmploi(String email) {
    	boolean res = false;

    	if (email != null && email.contains("@")) {
    		String domaine = email.substring(email.indexOf("@")+1);
    		if (domaine.equalsIgnoreCase("pole-emploi.fr")) {
    			res = true;
    		}
    	}
    	return res;
    }

    public static void sendTestMail(String localhostName)
    {
        // Create a mail session
        Properties props = getProperties();
        if(localhostName!=null)
            props.put("mail.smtp.localhost", localhostName); //"92.ip-167-114-255.eu"
        Session session = Session.getDefaultInstance(props, null);

        // Construct the message
        MimeMessage msg = new MimeMessage(session);

        try
        {
            // FROM
            msg.setFrom(new InternetAddress("memo@pole-emploi.fr"));
            // TO
            msg.addRecipients(RecipientType.TO, new InternetAddress[] {
                    new InternetAddress("alan.leruyet@free.fr"),
                    new InternetAddress("allgenda@outlook.fr"),
                    new InternetAddress("allgenda@laposte.net"),
                    new InternetAddress("allgenda@gmx.com"),
                    new InternetAddress("alan.leruyet@sfr.fr"),
                    new InternetAddress("julienracine.pe@yahoo.com"),
                    new InternetAddress("racine.julien@gmail.com"),
                    new InternetAddress("julien.racine@pole-emploi.fr")/*,
                    new InternetAddress("...")*/
            });


            // SUBJECT
            msg.setSubject("Test Localhostname : " + localhostName);

            // Fill the message
            msg.setHeader("Content-Type", "text/html; charset=\"utf-8\"");
            msg.setContent("Corps de message sans intérêt", "text/html; charset=utf-8");

            // send message
            Transport.send(msg);
        }
        catch (Exception e)
        {
            log.error(logCode + "-012 MAILTOOLS Error building localhostname test message. error=" + e);
        }

    }


    public static void sendTestEmailNotifications(String localhostName)
    {
        UserSummary user = UserDAO.loadUserSummary(7);  // alan.leruyet@free.fr

        WeeklyReport wr = new WeeklyReport();
        wr.buildAndSendWeeklyTaskReminder(user.getUserId());

        DailyAlert da = new DailyAlert();
        da.sendNoCandidatureMail(user, true);

        NudgeAlert na = new NudgeAlert();
        na.sendSpontaneousNudgeMail(user, true);

        InterviewPrepReminder ipr = new InterviewPrepReminder();
        ipr.sendInterviewPrepReminder(user, "nom Candidature", "nom Société", new Timestamp(System.currentTimeMillis()), true);

        InterviewThanksReminder itr = new InterviewThanksReminder();
        itr.sendInterviewThanksReminder(user, "nom Candidature", "nom Société", new Timestamp(System.currentTimeMillis()), true);

        LastConnectionAlert lca = new LastConnectionAlert();
        lca.sendLastConnectionAlert(user, true);

        LastConnectionAlertJ60 lca60 = new LastConnectionAlertJ60();
        lca60.sendLastConnectionAlert(user, true);

        LastConnectionAlertJ90 lca90 = new LastConnectionAlertJ90();
        lca90.sendLastConnectionAlert(user, true);

        PastInterview pi = new PastInterview();
        pi.sendPastInterview(user, "nom Candidature", "nom Société", new Long(0), true);

        PastInterviewReminder pir = new PastInterviewReminder();
        pir.sendPastInterviewReminder(user, "nom Candidature", "nom Société", new Timestamp(System.currentTimeMillis()), true);

        User u = new User();
        u.setId(user.getUserId());
        u.setLogin("memo.alr@free.fr");

        try
        {
            UserAccountMail.sendNewAccountNotification(u, true);
            UserAccountMail.sendSuppressionCompteMail(u);
            UserAccountMail.sendPasswordRefreshLinkMail(u,"tatatatata");

            AccountDisabledAlert ada = new AccountDisabledAlert();
            String html = ada.buildEmail(user);
            ada.sendEmail(user.getEmail(), html, true);
        }
        catch (Exception e)
        {
            log.info(logCode+"-XXX Erreur lors des tests d'envoi");
        }
    }

    /**
     * Envoie d'un mail sans images
     * @param subject
     * @param body
     */
    public static MimeMessage buildHTMLMail(String to, String subject, String body, boolean testMode, boolean enBcc) {
        // Create a mail session
        Properties props = getProperties();
        Session session = Session.getDefaultInstance(props, null);

        // Construct the message
        MimeMessage msg = new MimeMessage(session);

        try {
            msg.setHeader("Content-Type", "text/html; charset=\"UTF-8\"");

            // FROM
            msg.setFrom(buildInternetAdresseFrom(to));

            /*// REPLYTO    -->
            msg.setReplyTo(new InternetAddress[]{new InternetAddress(MailTools.noReply)});*/

            // TO
            msg.addRecipients(RecipientType.TO, buildInternetAdressesTo(testMode, to));
            // BCC
            if (enBcc) {
            	msg.addRecipients(RecipientType.BCC, buildInternetAdressesBcc(testMode));
            }
            // SUBJECT
            msg.setSubject(buildSubject(testMode, subject, to));
            // BODY
            msg.setText(body,"utf-8","html");
        }
        catch (Exception e) {
        	msg = null;
            log.error(logCode + "-003 MAILTOOLS Error building HTML email for admin. subject=" + subject + " error=" + e);
        }
        return msg;
    }

    /**
     * Envoie d'un mail sans images
     * @param subject
     * @param body
     */
    public static MimeMessage buildHTMLMailReport(String[] to, String subject, String body) {
        // Create a mail session
        Properties props = getProperties();
        Session session = Session.getDefaultInstance(props, null);

        // Construct the message
        MimeMessage msg = new MimeMessage(session);

        try {
            msg.setHeader("Content-Type", "text/html; charset=\"UTF-8\"");

            // FROM
            msg.setFrom(new InternetAddress(MailTools.noReply));
            // TO
            msg.addRecipients(RecipientType.TO, buildInternetAdressesTo(true, ""));
            // SUBJECT
            msg.setSubject(subject);
            // BODY
            msg.setText(body,"utf-8","html");
        }
        catch (Exception e) {
        	msg = null;
            log.error(logCode + "-007 MAILTOOLS Error building HTML email for admin. subject=" + subject + " error=" + e);
        }
        return msg;
    }
    
    public static MimeMessage buildHTMLMailWithImage(String to, String subject, String body, boolean testMode, boolean enBcc) {

        // Create a mail session
        Properties props = getProperties();

        Session session = Session.getDefaultInstance(props, null);

        // Construct the message
        MimeMessage msg = new MimeMessage(session);

        try
        {
            msg.setHeader("Content-Type", "text/html; charset=\"UTF-8\"");

            // FROM
            msg.setFrom(buildInternetAdresseFrom(to));
            // TO
            msg.addRecipients(RecipientType.TO, buildInternetAdressesTo(testMode, to));

            /*// REPLYTO
            msg.setReplyTo(new InternetAddress[]{new InternetAddress(MailTools.noReply)});*/

            // BCC
            if (enBcc) {
            	msg.addRecipients(RecipientType.BCC, buildInternetAdressesBcc(testMode));
            }
            // SUBJECT
            msg.setSubject(buildSubject(testMode, subject, to));
            // BODY
            MimeMultipart mp = new MimeMultipart("related");
            // le html
            BodyPart bp = new MimeBodyPart();
            bp.setHeader("Content-Type","text/html; charset=\"utf-8\"");
            bp.setContent(body, "text/html; charset=utf-8");
            mp.addBodyPart(bp);

            // les images
            try {
                bp = new MimeBodyPart();
                bp.setDataHandler(new DataHandler(dsB));
                bp.setHeader("Content-ID", "<logoMEMO>");
                mp.addBodyPart(bp);

                bp = new MimeBodyPart();
                bp.setDataHandler(new DataHandler(dsPE));
                bp.setHeader("Content-ID", "<logoPoleEmploi>");
                mp.addBodyPart(bp);
            }
            catch(Exception imgE)
            {
                log.warn(logCode+"-010 Error attaching images to email. error=" + imgE);
            }

            msg.setContent(mp);
        }
        catch (Exception e)
        {
        	msg = null;
            log.error(logCode + "-003 MAILTOOLS Error building HTML email. subject=" + subject + " error=" + e);
        }

        return msg;
    }

    /**
     * Action d'envoi d'un email. Séparée du reste des fonctions pour log
     */
    public static void sendMail(Message msg,String to,String subject)
    {
        try
        {
            //log.info(logCode+"- sendMail01");
            //msg.setHeader("Content-type", "text/plain; charset=UTF-8");
            Transport.send(msg);
            //log.info(logCode+"- sendMail02");
        }
        catch(Exception e) {
            log.error(logCode + "-002 MAILTOOLS Error sending email. subject="+subject+" to="+to+" error="+e);
        }
    }


    public static void sendInterviewCalendar(User user, String event, String subject, String description) throws Exception
    {
        // Create a mail session
        Properties props = getProperties();
        Session session = Session.getDefaultInstance(props, null);

        // Construct the message
        MimeMessage msg = new MimeMessage(session);

        try
        {
            msg.setHeader("Content-Type", "text/calendar; method=REQUEST;\n charset=\"UTF-8\"");
            msg.setHeader("Content-Language", "fr");
            msg.setHeader("Content-Transfer-Encoding", "8bit");

            // FROM
            msg.setFrom(buildInternetAdresseFrom(user.getLogin()));
            // TO
            msg.addRecipients(RecipientType.TO, buildInternetAdressesTo(false, user.getLogin()));

            // SUBJECT
            msg.setSubject(buildSubject(false, subject, user.getLogin()));

            // Fill the message
            msg.setContent(event, "text/calendar; method=REQUEST;\n charset=\"UTF-8\"");

            // send message
            Transport.send(msg);
        }
        catch (Exception e)
        {
            log.error(logCode + "-011 MAILTOOLS Error building ITW email. subject=" + subject + " error=" + e);
            throw new Exception(e);
        }
    }
    
    public static String getHostname() {
    	String result = null;
    	try {
	    	InetAddress addr = InetAddress.getLocalHost();
		    String ipAddress = addr.getHostAddress();    
		    String hostname = addr.getHostName();
		    result = hostname;
    	}
    	catch(Exception e) {
    		log.error(logCode + "-012 MAILTOOLS Error getHostname error=" + e);
    	}
    	return result;
    }
    
    public static String getQuartzRunning() {
    	String result;
    	if (Quartz.isRunning()) 
    		result = "en cours";
    	else
    		result = "stop";
    	return result;
    }
    
}
