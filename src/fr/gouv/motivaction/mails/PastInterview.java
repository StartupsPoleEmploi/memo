package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

public class PastInterview extends AlertMail {

    private static final String logCode = "027";

    public static Timer pastInterviewTimer = Utils.metricRegistry.timer("pastInterviewTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing past interview");

        // pour limiter l'envoi de mails aux admins 
        this.moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltrePastInterview;
        // construction du mail et envoi aux utilisateurs
        String body = buildAndSendPastInterview(0);
        body += "<br/><br/> Moludo du random d'envoie :" + this.moduloFiltreEnvoiMailAdmin;
        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + Constantes.env + " - Que devient votre candidature ?", body);
    }

    /**
     * Envoie un email pour identifier le retour à l'emploi ou non de l'utilisateur
     */
    public String buildAndSendPastInterview(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String res = "";
        
        long uId;
        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = pastInterviewTimer.time();

        try
        {
            con = DatabaseManager.getConnection();
            // @RG - EMAIL : la campagne de mail "Que devient votre candidature" s'adresse aux utilisateurs notifiables qui ont une candidature avec un entretien depuis 15j et pour laquelle il n'y a aucun evt dans ces 15j passés de type échange mail, entretien, relancé, note ou remercié
            String sql = "SELECT users.id, users.login, candidatures.id as idCandidature, candidatures.nomCandidature, candidatures.nomSociete, candidatureEvents.eventTime " +
                    "FROM users LEFT JOIN candidatures on candidatures.userId = users.id " +
                    "LEFT JOIN candidatureEvents on candidatures.id = candidatureEvents.candidatureId " +
                    "WHERE candidatures.id NOT IN " +
                    "( " +
                    "SELECT candidatureId FROM candidatureEvents WHERE (eventType=2 OR eventType=3 OR eventType=5 OR eventType=8 OR eventType=11) AND DATEDIFF(eventTime, now())<0 AND DATEDIFF(eventTime, now())>-15 " +
                    ") " +
                    "AND candidatureEvents.eventType = 3 " +
                    "AND candidatures.archived = 0 " +
                    "AND DATEDIFF(now(),candidatureEvents.eventTime)=15 " +
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

                sendPastInterview(currentUser, rs.getString("nomCandidature"), rs.getString("nomSociete"), rs.getLong("idCandidature"), (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-002 Error processing past interview reminder alert. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "003");
        }
        res = "Incitations à relancer suite à un entretien envoyées à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    public void sendPastInterview(UserSummary user, String nomCandidature, String nomSociete, Long idCandidature, boolean test)
    {

        String subject = "Que devient votre candidature";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Past_interview";
        String token = UserService.getUpdateCandidatureEmailLinkForUser(user.getUserId());

        String html = MailTools.buildHtmlHeader(user);
        String societe = "";

        if(nomSociete!=null && !nomSociete.equals(""))
            societe = " chez "+nomSociete;

        subject+= societe+" ?";

        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />Il y a 15 jours, vous avez passé un entretien pour le poste de "+nomCandidature+societe+". Qu'en est-il de votre candidature ? Avez-vous eu le poste ?";
        
        html+= "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:25px 10px;'>"+
        			"<table width='100%'>"+
        				"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='" +MailTools.url+ "/rest/candidatures/stateFromEmail/"+idCandidature+"/"+token+"/9' style='text-decoration:none;color:#fff;'>J'ai eu le poste</a></td><td style='width:25%;'></td></tr>"+
                        "<tr><td colspan='3' style='height:15px;'></td></tr>"+
        				"<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='" +MailTools.url+ "/rest/candidatures/stateFromEmail/"+idCandidature+"/"+token+"/4' style='text-decoration:none;color:#fff;'>Je n'ai pas eu le poste</a><td style='width:25%;'></td></tr>"+
                        "<tr><td colspan='3' style='height:15px;'></td></tr>"+
                        "<tr><td style='width:25%;'></td><td style='font-size:16px; font-weight:bold; background:#32c6d2; text-align:center; font-family:verdana; padding: 10px 10px; border-radius: 5px;'><a href='" +MailTools.url+ "/rest/candidatures/stateFromEmail/"+idCandidature+"/"+token+"/0' style='text-decoration:none;color:#fff;'>J'attends une réponse</a><td style='width:25%;'></td></tr>"+
        			"</table>"+
        				
        		"<br />" + 
                "</td></tr>";

        html += MailTools.buildHTMLSignature(source, campaign, "", true);
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
