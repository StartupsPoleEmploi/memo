package fr.gouv.motivaction.job;

import java.io.File;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 03/04/2018.
 */
public class CleanExtract implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "049";

    public static Timer cleanExtractTimer = Utils.metricRegistry.timer("cleanExtractTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing cleanExtract job");

        try {
            // nettoyage du dossier des extracts
        	FileUtils.cleanDirectory(new File(Constantes.pathCSV));

        }
        catch (Exception e)
        {
            log.error(logCode+"-002 JOB Error executing cleanExtract job. error="+e);
            throw new JobExecutionException(e);
        }
    }
}
