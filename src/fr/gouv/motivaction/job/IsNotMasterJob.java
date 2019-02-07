package fr.gouv.motivaction.job;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * Created by Alan on 03/04/2018.
 */
public class IsNotMasterJob implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "xxx";

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing isNotMasterJob");
    }
}
