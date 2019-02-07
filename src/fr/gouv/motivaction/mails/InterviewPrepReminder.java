package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import com.codahale.metrics.Timer;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 04/11/2016.
 */
public class InterviewPrepReminder extends AlertMail {

    private static final String logCode = "045";

    public static Timer interviewPrepReminderTimer = Utils.metricRegistry.timer("interviewPrepReminderTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing interview preparation reminder");

        // Pour limiter l'envoi de mails aux admins (envoie tous les mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreInterviewPrep;
        // construction du mail et envoi aux utilisateurs
        String body = buildAndSendInterviewPrepReminder(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux admins
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Pour bien préparer votre entretien", body);
    }

    /**
     * Envoie un email pour chaque entretien à venir entre 48 et 49h
     * pour lesquels il n'y a pas eu de préparation dans les 10 jours précédents l'instant présent (240 heures)
     */
    private String buildAndSendInterviewPrepReminder(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String res = "";

        long uId;
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = interviewPrepReminderTimer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Pour bien préparer votre entretien" s'adresse aux utilisateurs notifiables ayant une candidature non archivée avec un entretien prévu dans 48h et pour laquelle il n'y a pas déjà eu un evt de type 'AI_PREPARE'
            con = DatabaseManager.getConnection();
            String sql = "SELECT users.id, users.login, candidatures.nomCandidature, candidatures.nomSociete, candidatureEvents.eventTime " +
                    "FROM users LEFT JOIN candidatures on candidatures.userId = users.id " +
                    "LEFT JOIN candidatureEvents on candidatures.id = candidatureEvents.candidatureId " +
                    "WHERE candidatures.id NOT IN " +
                    "( " +
                    "SELECT candidatureId FROM candidatureEvents WHERE eventType=10 AND TIMESTAMPDIFF(HOUR, now(),eventTime)>-240  " +
                    ") " +
                    "AND candidatureEvents.eventType = 3 " +
                    "AND candidatures.archived = 0 " +
                    "AND TIMESTAMPDIFF(HOUR, now(),candidatureEvents.eventTime)>=48 " +
                    "AND TIMESTAMPDIFF(HOUR, now(),candidatureEvents.eventTime)<49 " +
                    "AND users.receiveNotification = 1";


            if(userId>0)
                sql += " AND users.id = "+userId;


            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                uId = rs.getLong("id");

                // initialisation nouvel utilisateur courant
                currentUser = new UserSummary();
                currentUser.setUserId(uId);
                currentUser.setEmail(rs.getString("login"));

                sendInterviewPrepReminder(currentUser, rs.getString("nomCandidature"), rs.getString("nomSociete"), rs.getTimestamp("eventTime"), (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-009 Error processing prep reminder alert. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.stop();
            DatabaseManager.close(con, pStmt, rs, logCode, "008");
        }

        res = "Rappels de préparation d'entretien envoyés à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    public void sendInterviewPrepReminder(UserSummary user, String nomCandidature, String nomSociete, Timestamp eventTime, boolean test)
    {
        String subject = "Pour bien préparer votre entretien";
        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Prep_reminder";
        
        String html = MailTools.buildHtmlHeader(user);
        String societe = "";

        if(nomSociete!=null && !nomSociete.equals(""))
            societe = " chez "+nomSociete;

        subject+= societe;

        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Dans 2 jours vous passez un entretien";

        html += societe;

        html += " pour le poste de "+nomCandidature+".<br /><br />";

        html += "Une bonne préparation vous permettra de maximiser vos chances de décrocher cet emploi :<br /><br />" +
                "<a style='font-size:16px' href='https://www.youtube.com/watch?v=dO6vN70ymuU'>Découvrez les 7 conseils pour réussir vos entretiens d'embauche</a>" +
                "<br /><br />" +
                "Notre Sélection de services web pour préparer votre entretien :" +
                "<ul><li><a href='http://www.emploi-store.fr/portail/services/bABaEntretien?utm_campaign=memo&utm_medium=email&utm_source=prepReminder'>B.A.-BA Entretien</a></li>" +
                "<li><a href='http://www.emploi-store.fr/portail/services/monEntretienDEmbauche?utm_campaign=memo&utm_medium=email&utm_source=prepReminder'>Mon entretien d'embauche (simulateur)</a></li>" +
                "</ul></td></tr>";


        html += MailTools.buildHTMLSignature(source, campaign, "", false);
        html += MailTools.buildHTMLFooter(user, source, campaign);

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
