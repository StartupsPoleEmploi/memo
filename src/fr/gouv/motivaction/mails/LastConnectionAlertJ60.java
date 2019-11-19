package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;

import org.apache.log4j.Logger;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 04/11/2016.
 */
public class LastConnectionAlertJ60 extends AlertMail {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "025";

    public static Timer lastConnectionAlertj60Timer = Utils.metricRegistry.timer("lastConnectionAlertj60Timer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing last connection alert J60");

        // Pour limiter l'envoi de mails aux admins (envoie tous les mails)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreLastConnect;
        // construction du mail et envoi aux utilisateurs
        String body = buildAndSendLastConnectionAlert(0);      
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + Constantes.env + " - Reprenez le fil de vos candidatures", body);
    }
    
    /**
     * Envoie un email d'alerte lorsque l'utilisateur ne s'est pas connecté depuis 60j
     */
    private String buildAndSendLastConnectionAlert(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String sql = null;
        String res = "";
        
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = lastConnectionAlertj60Timer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Reprenez le fil de vos candidatures" s'adresse aux utilisateurs notifiables n'ayant pas eu d'activités sur les 60 derniers jours
            con = DatabaseManager.getConnection();
            sql = "SELECT u.id, u.login, m.maxCreationTime, DATEDIFF(now(),creationTime) "
    				+ "FROM users u "
    				+ "INNER JOIN (SELECT userId,  MAX(creationTime) as maxCreationTime "
        			+ 				"FROM userLogs "
        			+ 				"WHERE DATEDIFF(now(),creationTime) <= 60 " 
        			+ 				"GROUP BY userId) m "
        			+ "ON u.id = m.userId "
        			+ "AND DATEDIFF(NOW(), maxCreationTime)=60 "
                    + "AND u.receiveNotification = 1 ";

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

                this.sendLastConnectionAlert(currentUser, (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 Error processing last connection alert J60. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "02");
        }
        res = "Alerte d'inactivité J60 de compte envoyés à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;
        
        return res;
    }
    
    public void sendLastConnectionAlert(UserSummary user, boolean test)
    {
        String subject = "Reprenez le fil de vos candidatures";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Connection_60j_alert";
        String html = MailTools.buildHtmlHeader(user);

        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />";

        html += "En vous connectant sur MEMO, vous pouvez voir en un clin d'oeil où en sont vos différentes candidatures.<br /><br />";

        html += "Vous n'avez pas mis à jour votre tableau de bord MEMO depuis un moment.</td></tr>";

        html += MailTools.getGotAJobButton(user,source,campaign);

       html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'><br />" +
               "Si vous êtes toujours en recherche d'emploi, nous vous invitons à mettre à jour votre tableau de bord MEMO. " +
               "Il vous permettra de reprendre le fil et de suivre les conseils pour chacune de vos candidatures " +
               "(relancer un recruteur, se préparer à un entretien…)";

        html += "</td></tr>";

        html += MailTools.buildHTMLSignature(source,campaign, "", false);
        html+= MailTools.buildHTMLFooter(user,source,campaign, true);

        boolean enBCC = false;
        // pour limiter l'envoi de mails aux admins
    	if (this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0) {
    		enBCC = true;
    	}
    	
        if ("PROD".equals(Constantes.env) || test || ("RECETTE".equals(Constantes.env) && this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0)) { 
        	// PROD ou RECETTE avec modulo OK ou mode TEST depuis le BO
        	MailService.sendMailWithImage(user.getEmail(), subject, html, test, enBCC);
        }
        this.cptNbEnvoi++;
    }
}
