package fr.gouv.motivaction.mails;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDateTime;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 06/03/2018.
 */
public class AccountRemovalAlert extends AlertMail implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "041";

    public static Timer accountRemovalAlertTimer = Utils.metricRegistry.timer("accountRemovalAlertTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 Executing account removal alert");

        // construction du mail et envoi aux utilisateurs
        String body = this.buildAndSendAccountRemovalAlert(0);

        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + Constantes.env + " - Alerte de compte inutilisé avant suppression ?", body);
    }

    /**
     * Envoie un email d'alerte lorsque l'utilisateur ne s'est pas connecté depuis 90j
     */
    private String buildAndSendAccountRemovalAlert(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String sql = null;
        String res = "";

        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = accountRemovalAlertTimer.time();

        try
        {
            // @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier trimestre" s'adresse aux utilisateurs n'ayant pas eu d'activités sur les 365 (inclus) à 371 (exclus) derniers jours
            con = DatabaseManager.getConnection();
            sql = "SELECT u.id, u.login, m.maxCreationTime, DATEDIFF(now(),creationTime) "
                    + "FROM users u "
                    + "INNER JOIN (SELECT userId,  MAX(creationTime) as maxCreationTime "
                    + 				"FROM userLogs "
                    + 				"GROUP BY userId) m "
                    + "ON u.id = m.userId "
                    + "AND (DATEDIFF(NOW(), maxCreationTime)>=365 AND DATEDIFF(NOW(), maxCreationTime)<371 ) "
                    + "WHERE u.login IS NOT NULL ";

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

                sendAccountRemovalAlert(currentUser, (userId > 0) ? true : false);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 Error processing account removal alert. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "03");
        }
        res = "Alerte avant suppression de compte envoyée à "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;
        res += "<br/><br/>IP serveur SMTP d'envoi : " + MailTools.host;

        return res;
    }

    private void sendAccountRemovalAlert(UserSummary user, boolean test)
    {
        String subject = "Notice avant suppression de vos données";

        LocalDateTime currentTime = LocalDateTime.now();
        String campaign = currentTime.format(formatter);
        String source = "Account_removal_alert";
        String html = MailTools.buildHtmlHeader(user);

        html += "<tr><td style='border-left:1px solid #c1c1c1;border-right:1px solid #c1c1c1; padding:15px 10px; text-align:justify'>" +
                "Bonjour,<br /><br />";

        html += "Vous n'avez pas effectué d'action sur votre compte utilisateur MEMO depuis un an.<br /><br />";

        html += "La loi nous impose la suppression de vos données.<br /><br />";

        html += "Si vous souhaitez les conserver vous pouvez vous reconnecter sur votre espace MEMO.<br /><br />";

        html += "A défaut votre compte sera supprimé dans 30 jours.<br />";
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
