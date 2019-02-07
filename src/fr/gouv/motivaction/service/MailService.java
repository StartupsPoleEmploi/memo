package fr.gouv.motivaction.service;


import javax.mail.Transport;
import javax.mail.internet.MimeMessage;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.mails.MailTools;

public class MailService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "018";  

    public static void sendMail(String to, String subject, String body, boolean testMode, boolean enBcc) {
    	// construction du mail
    	MimeMessage msg = MailTools.buildHTMLMail(to, subject, body, testMode, enBcc);
    	if (msg != null) {
    		try { 
    			// envoi du mail
	            Transport.send(msg);
	        }
	        catch(Exception e) {
	            log.error(logCode + "-001 MailService Error sending email. subject="+subject+" to="+to+" error="+e);
	        }
    	}
    }
    
    public static boolean sendMailWithImage(String to, String subject, String body, boolean testMode, boolean enBcc) {
    	boolean isSent = false;
    	// construction du mail

		if(to!=null && to.length()>0)
		{
			MimeMessage msg = MailTools.buildHTMLMailWithImage(to, subject, body, testMode, enBcc);
			if (msg != null) {
				try {
					// envoi du mail
					Transport.send(msg);
					isSent = true;
				}
				catch(Exception e) {
					log.error(logCode + "-002 MailService Error sending email with image. subject="+subject+" to="+to+" error="+e);
				}
			}
		}

		return isSent;
    }
    
    public static void sendMailReport(String[] to, String subject, String body) {
    	// construction du mail
    	MimeMessage msg = MailTools.buildHTMLMailReport(to, subject, body);
    	if (msg != null) {
    		try { 
    			// envoi du mail
	            Transport.send(msg);
	        }
	        catch(Exception e) {
	            log.error(logCode + "-003 MailService Error sending email. subject="+subject+" to="+to+" error="+e);
	        }
    	}
    }
}
