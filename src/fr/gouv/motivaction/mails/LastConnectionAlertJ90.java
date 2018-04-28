package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;

import com.codahale.metrics.Timer;
import org.apache.log4j.Logger;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 04/11/2016.
 */
public class LastConnectionAlertJ90 extends AlertMail {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "026";

    public static Timer lastConnectionAlertj90Timer = Utils.metricRegistry.timer("lastConnectionAlertj90Timer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing last connection alert J90");

        // Pour limiter l'envoi de mails aux admins (envoie tous les mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreLastConnect90;
        // construction du mail et envoi aux utilisateurs 
        String body = this.buildAndSendLastConnectionAlert(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Avez-vous recherché un emploi durant le dernier trimestre ?", body);
    }
    
    /**
     * Envoie un email d'alerte lorsque l'utilisateur ne s'est pas connecté depuis 90j
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

        final Timer.Context context = lastConnectionAlertj90Timer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier trimestre" s'adresse aux utilisateurs notifiables n'ayant pas eu d'activités sur les 90 derniers jours
            con = DatabaseManager.getConnection();
            sql = "SELECT u.id, u.login, m.maxCreationTime, DATEDIFF(now(),creationTime) "
    				+ "FROM users u "
    				+ "INNER JOIN (SELECT userId,  MAX(creationTime) as maxCreationTime "
        			+ 				"FROM userLogs "
        			+ 				"WHERE DATEDIFF(now(),creationTime) <= 90 " 
        			+ 				"GROUP BY userId) m "
        			+ "ON u.id = m.userId "
        			+ "AND DATEDIFF(NOW(), maxCreationTime)=90 ";

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

                sendLastConnectionAlert(currentUser, (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 Error processing last connection alert J90. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "02");
        }
        res = "Alerte d'inactivité J90 de compte envoyés à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }
    
    private void sendLastConnectionAlert(UserSummary user, boolean test)
    {
    	String subject = "Avez-vous recherché un emploi durant le dernier trimestre ?";
    	
        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Connection_90j_alert";
        String html = MailTools.buildHtmlHeader(user);
        
        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />";

        html += "Cela fait trois mois que vous ne vous êtes pas connecté sur MEMO.<br /><br />";

        html += "Peut-être avez-vous décroché un job entre temps.<br /><br />";
        
        html += "Si vous êtes toujours en recherche d'emploi, profitez maintenant pleinement de MEMO pour accélérer votre retour à l'emploi !<br />" +
                "<ul><li><b>Accédez à toutes vos candidatures</b> en cours en 1 clin d'oeil</li>" +
                "<li>Recevez <b>des conseils personnalisés</b> pour marquer des points auprès des recruteurs</li>" +
                "<li>N'oubliez plus une relance ou un entretien avec les alertes par email</li>" +
                "</ul><br /><br />";
        
        html += "Je vous invite donc à vous connecter à ce service et à y enregistrer vos candidatures en cours : <br />";
        html += "</td></tr>";


        html += MailTools.buildHTMLSignature(source,campaign, "", false);
        html+= MailTools.buildHTMLFooter(user,source,campaign);

        boolean enBCC = false;
        // pour limiter l'envoi de mails aux admins
    	if (this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0) {
    		enBCC = true;
    	}
    	
        if ("PROD".equals(MailTools.env) || test || ("RECETTE".equals(MailTools.env) && this.cptNbEnvoi%this.moduloFiltreEnvoiMailAdmin == 0)) { 
        	// PROD ou RECETTE avec modulo OK ou mode TEST depuis le BO
        	MailService.sendMailWithImage(user.getEmail(), subject, html, test, enBCC);
        }
        this.cptNbEnvoi++;
    }
}
