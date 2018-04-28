package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;
import java.util.ArrayList;

import org.apache.log4j.Logger;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Julien on 27/09/2017.
 */
public class AccountDisabledAlert extends AlertMail {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "037";
    private static ArrayList<Long> lstIdUserReport = null;
    
    public static Timer accountDisabledAlertTimer = Utils.metricRegistry.timer("AccountDisabledAlertTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing account disabled alert");

        // Pour limiter l'envoi de mails aux admins (envoie tous les mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreAccount;
        // construction du mail et envoi aux utilisateurs 
        String body = this.buildAndSendEmail(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Comptes désactivés (6mois d'inactivité)", body);
        // on log l'envoie d'email
        this.updateUserLog(0);
        // désactivation automatique des notifications pour les users
        this.desactivateNotifications(0);
    }
    
    /**
     * Envoie un email d'alerte lorsque l'utilisateur ne s'est pas connecté depuis 6mois
     */
    public String buildAndSendEmail(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String sql = null;
        String res = "";
        String html;
        boolean isSent = false;
        
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = accountDisabledAlertTimer.time();

        try
        {
            // init de la liste d'id des user notifiés
        	lstIdUserReport = new ArrayList<Long>();
        	// @RG - EMAIL : la campagne de mail "Désactivation du compte" s'adresse aux utilisateurs notifiables ne s'étant pas connectés depuis 6mois et qui ne sont pas déjà inactifs
            con = DatabaseManager.getConnection();
            sql = "SELECT u.id, u.login, maxTime "
    				+ "FROM users u "
    				+ "INNER JOIN (SELECT userId, max(creationTime) as maxTime "
        			+ 				"FROM userLogs "
        			+ 				"GROUP BY userId) m "
        			+ "ON u.id = m.userId "
        			+ "AND DATEDIFF(now(),maxTime) >= 180 "
            		+ "AND receiveNotification=1 "
            		+ "AND autoDisableNotification=0 ";

            if(userId>0)
                sql += "AND u.id = "+userId;

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                // initialisation nouvel utilisateur courant
                currentUser = new UserSummary();
                currentUser.setUserId(rs.getLong("id"));
                currentUser.setEmail(rs.getString("login"));

                html = buildEmail(currentUser);
                isSent = sendEmail(currentUser.getEmail(), html, (userId > 0) ? true : false);
                if(isSent)
                	lstIdUserReport.add(currentUser.getUserId());
                
                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 Error processing account disabled alert. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "02");
        }
        res = "Alerte de compte désactivé envoyés à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }
    
    private String buildEmail(UserSummary user)
    {   	
        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Account_disabled_alert";
        String html = MailTools.buildHtmlHeader(user);
        
        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />";

        html += "Nous avons constaté que vous ne vous étiez pas connecté sur votre espace MEMO depuis un long moment.<br /><br />";

        html += "Je vous informe que nous avons désactivé l'envoi de notifications de conseils car vous n'en avez vraisemblablement plus besoin.<br /><br />";
        
        html += "Rassurez-vous votre compte reste toujours actif !<br /><br />";
        
        html += "Pour réactiver les notifications de conseils, il vous suffit de vous reconnecter sur votre espace MEMO.<br /><br />";
        
        html += "</td></tr>";


        html += MailTools.buildHTMLSignature(source,campaign, "", false);
        html+= MailTools.buildHTMLFooter(user,source,campaign);
        
        return html;     
    }
    
    private boolean sendEmail(String email, String html, boolean test) {
    	String subject = "Désactivation automatique des notifications de conseils";
    	boolean enBCC = false;
    	boolean isSent = false;
    	
        // pour limiter l'envoi de mails aux admins
    	if (this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0) {
    		enBCC = true;
    	}
    	
        if ("PROD".equals(MailTools.env) || test || ("RECETTE".equals(MailTools.env) && this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0)) { 
        	// PROD ou RECETTE avec modulo OK ou mode TEST depuis le BO
        	isSent = MailService.sendMailWithImage(email, subject, html, test, enBCC);
        }
        this.cptNbEnvoi++;
        return isSent;
    }
    
    /**
     * MAJ en bdd de la table userLog pr tracer l'envoie de l'email
     */
    public void updateUserLog(long userId) {
    	if (userId>0) {
			lstIdUserReport.clear();
			lstIdUserReport.add(userId);
		}
    	if(lstIdUserReport != null && lstIdUserReport.size()>0) {
	    	for(Long idUser : lstIdUserReport) {
	    		// On log dans la table userLog la désactivation auto
				Utils.logUserAction(idUser, "User", "Email désabonnement auto", 0);
	    	}
    	}
    }
    	
    /**
     * MAJ en bdd des champs reveiveNotification et autoDisableNotification
     * @param userId
     */
    public void desactivateNotifications(long userId)
    {
    	try
        {
    		if (userId>0) {
    			lstIdUserReport.clear();
    			lstIdUserReport.add(userId);
    		}
    		UserService.desactivateNotifications(lstIdUserReport);
        } 
    	catch(Exception e)
        {
            log.error(logCode+"-03 ACCOUNT Error autoDisableNotification user. error="+e);
        }
    }
}
