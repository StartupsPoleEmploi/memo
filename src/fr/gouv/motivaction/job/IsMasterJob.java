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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Created by Alan on 03/04/2018.
 */
public class IsMasterJob implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "xxx";

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing isMasterJob");
    }
}
