package fr.gouv.motivaction.mails;

import java.time.format.DateTimeFormatter;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * Created by Alan on 07/11/2016.
 */
public abstract class AlertMail implements Job  {

    public static final Logger log = Logger.getLogger("ctj");

    public static final DateTimeFormatter formatter = MailTools.formatter;
    
    // compteur pour dénombrer le nombre de mails envoyés
    protected int cptNbEnvoi = 0;
    // pour limiter le nombre de mails envoyés aux admins
    protected int moduloFiltreEnvoiMailAdmin = MailTools.moduloFiltreAccount;

    public abstract void execute(JobExecutionContext context) throws JobExecutionException;
}

