package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;

import com.codahale.metrics.Timer;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

public class DailyAlert extends AlertMail {

    private static final String logCode = "016";

    public static Timer dailyAlertTimer = Utils.metricRegistry.timer("dailyAlertTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing daily alert");
        
        // Pour limiter l'envoi de mails aux admins (envoi tous les 50 mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreDaily;
        // construction du mail et envoi aux utilisateurs
        String body = this.buildAndSendWeeklyTaskReminderNoCandidature(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux admins
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Avis de relance", body);
    }

    // email de relance pour les utilisateurs sans fiches actives
    public String buildAndSendWeeklyTaskReminderNoCandidature(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        String res="";
        int ok =0;
        int err=0;
        String errs="";
        String oks = "";

        UserSummary currentUser;

        final Timer.Context context = dailyAlertTimer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Avis de relance" s'adresse aux utilisateurs n'ayant pas encore  de candidatures afin de les inciter à s'en créer
            con = DatabaseManager.getConnection();
            String sql = "SELECT   login, " +
                    "    id "+
                    "    FROM    users" +
                    "    WHERE id NOT IN (SELECT userId FROM candidatures) " +
                    "    AND  users.receiveNotification=1 ";//" WHERE archived=0) ";

            if(userId>0)
                sql += " AND id = "+userId;
            else
                sql += " AND (DATEDIFF(now(),creationTime)=7 OR DATEDIFF(now(),creationTime)=14) ";
            //sql += " AND (creationTime <'20160729' OR (creationTime>='20160804' AND creationTime < '20160805' )) ";

            sql +=  "    ORDER BY    login";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                currentUser = new UserSummary();
                currentUser.setUserId(rs.getLong("id"));
                currentUser.setEmail(rs.getString("login"));

                this.sendNoCandidatureMail(currentUser, (userId > 0) ? true : false);

                ok++;
                oks += " - "+currentUser.getEmail()+" ("+currentUser.getUserId()+")\r\n";
            }
        }
        catch (Exception e)
        {
            err++;
            errs+=" - "+userId+"\r\n";
            log.error(logCode + "-003 Error processing weekly reminder email no candidature. userId=" + userId +" error=" + e);
        }
        finally
        {
            context.stop();
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        res+="Rappel 7/14 envoyé à "+ok+" utilisateurs : "+oks;
        if(err>0)
        {
            res+="<br/>Erreurs pour "+err+" utilisateur : "+errs;
        }
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    private String buildWeeklyReportNoCandidature()
    {

        String res = "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>";

        res+="Bonjour,<br /><br />Il y a quelques jours vous vous êtes inscrit sur le service <b><a href='"+MailTools.url+"' style='color:black;text-decoration:none'>MEMO</a></b> afin de centraliser vos candidatures.<br /><br />";
        res+="A ce jour vous n'avez cependant enregistré aucune candidature.<br /><br />";
        res+="Si vous êtes toujours en recherche d'emploi, sachez que ce service vous permet de suivre les avancements de votre recherche d'emploi et vous fait bénéficier de conseils personnalisés.<br /><br />";
        res+="Je vous invite donc à vous connecter à ce tout nouveau service et à y enregistrer les candidatures que vous avez récemment faites.</td></tr>";

        return res;
    }

    private void sendNoCandidatureMail(UserSummary user, boolean test)
    {
    	String subject = "Avis de relance";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Relance_7-14";
        
    	String html = MailTools.buildHtmlHeader(user);

        html += this.buildWeeklyReportNoCandidature();
        html += MailTools.buildHTMLSignature(source, campaign, "", false);
        html+= MailTools.buildHTMLFooter(user, source, campaign);

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
