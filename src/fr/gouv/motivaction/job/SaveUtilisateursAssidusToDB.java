package fr.gouv.motivaction.job;

import com.codahale.metrics.Timer;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;
import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.text.DateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Created by Alan on 03/04/2018.
 */
public class SaveUtilisateursAssidusToDB implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "043";

    public static Timer saveUtilisateursAssidusToDBTimer = Utils.metricRegistry.timer("saveUtilisateursAssidusToDBTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing save Utilisateurs Assidus to DB job");

        // construction du mail et envoi aux utilisateurs
        String body = this.saveUtilisateursAssidusToDB();

        // envoi du mail de rapport d'execution aux intras, devs et extra
        MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Enregistrement des utilisateurs assidus du mois précédent", body);
    }

    /**
     * Enregistrer les ids des utilisateurs assidus du mois précédent
     */
    private String saveUtilisateursAssidusToDB()
    {
        Connection con = null;
        PreparedStatement pStmt = null;

        String sql = null;
        String res = "";
        int ct=0;

        LocalDate date = LocalDate.now();
        date = date.minusMonths(1);

        int year = date.getYear();
        int month = date.getMonthValue();
        String dateInSql = date.format(DateTimeFormatter.BASIC_ISO_DATE);

        final Timer.Context context = saveUtilisateursAssidusToDBTimer.time();

        try
        {
            // @RG - JOB : Enregistrement des utilisateurs assidus du mois précédent
            con = DatabaseManager.getConnection();
            sql = "INSERT INTO utilisateursAssidus SELECT vueConnexions.userId, timestamp('"+dateInSql+"') " +
                    "FROM " +
                    "( SELECT ul.userId, DATE_FORMAT(ul.creationTime, '%m/%y') AS mois, COUNT(1) FROM userLogs ul " +
                    "       INNER JOIN users u " +
                    "       ON ul.userId = u.id WHERE u.login NOT LIKE '%@pole-emploi.fr' " +
                    "                                   AND ul.action LIKE 'Connexion%' " +
                    "                                   AND YEAR(ul.creationTime) = "+year+" " +
                    "                                   AND MONTH(ul.creationTime) = "+month+" " +
                    "       GROUP BY ul.userId,DATE_FORMAT(ul.creationTime, '%m/%y') " +
                    "       HAVING COUNT(1) >= 4) vueConnexions " +
                    "       INNER JOIN " +
                    "       (SELECT userId, DATE_FORMAT(creationTime, '%m/%y') as mois ,count(1) FROM userLogs " +
                    "                           WHERE YEAR(creationTime) = "+year+" " +
                    "                                   AND MONTH(creationTime) = "+month+" " +
                    "                           GROUP BY userId,DATE_FORMAT(creationTime, '%m/%y')" +
                    "                           HAVING COUNT(1) >= 8) vueActivites" +
                    "       ON vueConnexions.userId=vueActivites.userId" +
                    "           AND vueConnexions.mois=vueActivites.mois" +
                    " ORDER BY vueConnexions.userId";

            pStmt = con.prepareStatement(sql);

            ct = pStmt.executeUpdate();
        }
        catch (Exception e)
        {
            log.error(logCode + "-02 JOB Error processing SaveUtilisateursAssidusToDB. error=" + e);
        }
        finally
        {
            context.close();
            DatabaseManager.close(con, pStmt, null, logCode, "03");
        }
        res = "Enregistrement de "+ct+" utilisateurs assidus pour le mois de "+date.getMonth();

        log.info(logCode+"-004 JOB Added utilisateurs assidus for month "+date.getMonth()+". count="+ct);

        return res;
    }
}
