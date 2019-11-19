package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;

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
public class InterviewThanksReminder extends AlertMail {

    private static final String logCode = "022";

    public static Timer interviewThanksReminderTimer = Utils.metricRegistry.timer("interviewThanksReminderTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing interview thanks reminder");

        // Pour limiter l'envoi de mails aux admins (envoie tous les 10 mails générés)
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreInterviewThanks;
        // construction du mail et envoi aux utilisateurs
        String body = this.buildAndSendInterviewThanksReminder(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux admins
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + Constantes.env + " - Avez-vous pensé à remercier après votre entretien ?", body);
    }

    /**
     * Envoie un email pour chaque entretien passé la veille
     * pour lesquels il n'y a pas eu de remerciement le jour même
     */
    private String buildAndSendInterviewThanksReminder(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String res = "";

        long uId;
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = interviewThanksReminderTimer.time();

        try
        {
        	// @RG - EMAIL : la campagne de mail "Avez-vous pensé à remercier après votre entretien ?" s'adresse aux utilisateurs notifiables ayant une candidature non archivée avec un rappel de type 'REMERCIER' ce jour et pour laquelle il n'y a pas déjà eu un evt de type 'AI_REMERCIE'
            con = DatabaseManager.getConnection();
            String sql = "SELECT users.id, users.login, candidatures.nomCandidature, candidatures.nomSociete, candidatureEvents.eventTime " +
                    "FROM users LEFT JOIN candidatures on candidatures.userId = users.id " +
                    "LEFT JOIN candidatureEvents on candidatures.id = candidatureEvents.candidatureId " +
                    "WHERE candidatures.id NOT IN " +
                    "( " +
                    "SELECT candidatureId FROM candidatureEvents WHERE eventType=11 AND DATEDIFF(now(),eventTime)=0  " +
                    ") " +
                    "AND candidatureEvents.eventType = 7 " +
                    "AND candidatureEvents.eventSubType = 14 " +
                    "AND candidatures.archived = 0 " +
                    "AND DATEDIFF(now(),candidatureEvents.eventTime)=0 " +
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

                this.sendInterviewThanksReminder(currentUser, rs.getString("nomCandidature"), rs.getString("nomSociete"), rs.getTimestamp("eventTime"), (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-002 Error processing thank reminder alert. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "003");
        }
        res = "Incitations à remercier suite à un entretien envoyées à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;		

        return res;
    }

    public void sendInterviewThanksReminder(UserSummary user, String nomCandidature, String nomSociete, Timestamp eventTime, boolean test)
    {
        String subject = "Avez-vous pensé à remercier après votre entretien ?";
        
        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Prep_reminder";

        String html = MailTools.buildHtmlHeader(user);
        String societe = "";
        
        if(nomSociete!=null && !nomSociete.equals(""))
            societe = " chez "+nomSociete;

        subject+= societe+" ?";

        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />Vous avez passé un entretien pour le poste de "+nomCandidature+societe+".";


        html+= "<br /><br />Le recruteur va prochainement faire un choix ! Pour maximiser vos chances de décrocher ce job, nous " +
                "vous conseillons de <strong>remerciez votre interlocuteur</strong> : c'est le moment idéal pour réaffirmer votre motivation." +
                "<br /><br />ASTUCE : retrouvez des conseils et modèles pour rédiger votre mail de remerciement depuis votre tableau de bord, " +
                "il vous faudra simplement cliquer sur <strong>Conseil : \"REMERCIER\"</strong> </td></tr>";


        html += MailTools.buildHTMLSignature(source, campaign, "", false);
        html+= MailTools.buildHTMLFooter(user, source, campaign, true);
        
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
