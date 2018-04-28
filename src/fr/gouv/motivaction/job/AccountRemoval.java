package fr.gouv.motivaction.job;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;

public class AccountRemoval implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "042";

    public static Timer accountRemovalTimer = Utils.metricRegistry.timer("accountRemovalTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing account removal job");

        // construction du mail et envoi aux utilisateurs
        String body = this.buildAndSendAccountRemovalJob(0);

        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Suppression des comptes inutilisés ?", body);
    }

    /**
     * Supprime les comptes utilisateurs sans activité depuis plus de 401 jours
     */
    private String buildAndSendAccountRemovalJob(long userId)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        String sql = null;
        String res = "";

        UserSummary currentUser;

        int ok=0; int err=0;
        String oks="";

        final Timer.Context context = accountRemovalTimer.time();

        try
        {
            // @RG - JOB : Suppression des utilisateurs n'ayant pas eu d'activités depuis plus de 401 jours
            con = DatabaseManager.getConnection();
            sql = "SELECT u.id, u.login, m.maxCreationTime, DATEDIFF(now(),creationTime) "
                    + "FROM users u "
                    + "INNER JOIN (SELECT userId,  MAX(creationTime) as maxCreationTime "
                    + 				"FROM userLogs "
                    + 				"GROUP BY userId) m "
                    + "ON u.id = m.userId "
                    + "AND (DATEDIFF(NOW(), maxCreationTime)>401 ) "
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

                deleteUnusedAccount(currentUser);

                ok++;
                oks+= " - "+currentUser.getEmail()+" (" + currentUser.getUserId()+")";
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 JOB Error processing unused account removal. userId=" + userId + " error=" + e);
            err++;
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, rs, logCode, "03");
        }
        res = "Suppression de compte faite pour "+ok+" utilisateurs : "+oks+"<br/>Erreurs de traitement : "+err;

        return res;
    }

    private void deleteUnusedAccount(UserSummary user)
    {
        Utils.logUserAction(user.getUserId(), "User", "SuppressionCompteAuto", 0);
        UserService.deleteUser(user.getUserId());
    }


}
