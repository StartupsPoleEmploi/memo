package fr.gouv.motivaction.job;

import com.codahale.metrics.Timer;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.UserSummary;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.service.UserService;
import fr.gouv.motivaction.utils.DatabaseManager;
import fr.gouv.motivaction.utils.Utils;
import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class MergeDoubleAccount implements Job
{
    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "047";

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing double account merge job");

        String body = this.mergeDoubleAccounts();

        if(body != null)
        {
            MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport " + MailTools.env + " - Fusion des comptes en double ?", body);
        }
    }

    /**
     * Enregistrer les ids des utilisateurs assidus du mois précédent
     */
    private String mergeDoubleAccounts()
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        String res=null;

        try
        {
            // @RG - JOB : Détection des utilisateurs ayant un compte en double et fusion des comptes
            con = DatabaseManager.getConnection();
            String sql = "SELECT login FROM users WHERE login IS NOT NULL GROUP BY login HAVING COUNT(*) > 1";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                String login = rs.getString("login");

                if(res==null)
                    res = "Fusion des comptes pour : ";
                else
                    res += ", ";

                res+=login;

                mergeAccountsForLogin(rs.getString("login"));
            }
        }
        catch (Exception e)
        {
            log.error(logCode + "-002 JOB Error processing merge double account job. error=" + e);
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "003");
        }

        return res;
    }

    private void mergeAccountsForLogin(String login)
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        String res=null;

        log.info(logCode+"-004 JOB Merging double account. login="+login);

        try
        {
            // @RG - JOB : Récupération des identifiant des comptes à fusionner. Le dernier id inséré est le destinataire
            con = DatabaseManager.getConnection();
            String sql = "SELECT id FROM users WHERE login = '"+login+"' ORDER BY id DESC";

            long destinationId=0;
            String idsToRemove=null;

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next())
            {
                if(destinationId==0)
                    destinationId = rs.getLong("id");
                else
                {
                    if(idsToRemove==null)
                        idsToRemove = "(";
                    else
                        idsToRemove+=", ";
                    idsToRemove+=rs.getLong("id");
                }
            }

            if(idsToRemove!=null)
            {
                idsToRemove += ")";

                log.info(logCode+"-008 JOB Double account detected. Merging. idsToRemove="+idsToRemove+" destinationId="+destinationId);

                UserService.mergeCandidatures(destinationId, idsToRemove);
                UserService.mergeAttachments(destinationId, idsToRemove);
                UserService.mergeAttachmentFiles(destinationId, idsToRemove);
                UserService.mergeUserLogs(destinationId, idsToRemove);

                UserService.deleteDoubleAccounts(destinationId,idsToRemove);
            }

            log.info(logCode+"-005 JOB Finished merging double account. login="+login);
        }
        catch (Exception e)
        {
            log.error(logCode + "-006 JOB Error merging double accounts. login="+login+" error=" + e);
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "007");
        }
    }

}
