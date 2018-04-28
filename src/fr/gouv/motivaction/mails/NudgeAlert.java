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

public class NudgeAlert extends AlertMail {

    private static final String logCode = "020";

    public static Timer nudgeAlertTimer = Utils.metricRegistry.timer("nudgeAlertTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing nudge alert");

        // Pour limiter l'envoi de mails aux admins (envoi tous les 50 mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreNudge;
        // construction du mail et envoi aux utilisateurs
        String body = buildAndSendSpontaneousNudgeMail(0);
        body += "<br/><br/> Moludo du random d'envoie :" + moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Passez-vous trop de temps sur les offres en ligne ?", body);
    }


    private String buildAndSendSpontaneousNudgeMail(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String res = "";
        
        long uId;
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = nudgeAlertTimer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Passez-vous trop de temps sur les offres en ligne" s'adresse aux utilisateurs n'ayant pas encore  de candidatures de type 'SPONTANE mais uniquement de type 'OFFRE', 'RESEAU' ou 'AUTRE' depuis 15j, ou 75j, ou 95j...
            con = DatabaseManager.getConnection();
            String sql = "SELECT    users.login, " +
                    "    users.id as uId" +
                    "    FROM    users" +
                    "    WHERE (DATEDIFF(now(),creationTime) IN (15, 75, 135, 195, 255, 315, 375)) AND " +
                    "    id IN (select userId from candidatures where type<>1) AND " +
                    "    id NOT IN (select userId from candidatures WHERE type=1) AND " +
                    "    users.receiveNotification =1 ";

            if(userId>0)
                sql += " AND users.id = "+userId;


            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                uId = rs.getLong("uId");

                // initialisation nouvel utilisateur courant
                currentUser = new UserSummary();
                currentUser.setUserId(uId);
                currentUser.setEmail(rs.getString("login"));

                this.sendSpontaneousNudgeMail(currentUser, (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error processing spontaneous nudge. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "008");
        }
        res = "Incitations candidatures spontanées envoyées à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    private void sendSpontaneousNudgeMail(UserSummary user, boolean test)
    {
    	String subject = "Passez-vous trop de temps sur les offres en ligne ?";
    	
        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Nudge_spontanee";

        String html = MailTools.buildHtmlHeader(user);
        
        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />Cela paraît incroyable, mais 93 % des recrutements se font sans offres ! <br /><br /> " +
                "Bénéficiez vous aussi de ces 93 % en faisant plus de <b>candidatures spontanées</b>.<br /><br />" +
                "Allez dès maintenant sur <a href='https://labonneboite.pole-emploi.fr?utm_campaign=memo&utm_medium=email&utm_source=nudge'>La Bonne Boite</a> pour trouver les entreprises qui recrutent près de chez vous.<br /><br />" +
                "Vous pourrez ensuite les ajouter dans votre tableau de bord MEMO pour recevoir automatiquement des alertes sur ces candidatures spontanées." +
                "</td></tr>";

        html += MailTools.buildHTMLSignature(source, campaign, "", false);
        html+= MailTools.buildHTMLFooter(user, source, campaign);

        boolean enBCC = false;
        // Pour limiter l'envoi de mails aux admins tous les 50 mails générés
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
