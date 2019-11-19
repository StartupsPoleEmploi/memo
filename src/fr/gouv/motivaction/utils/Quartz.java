package fr.gouv.motivaction.utils;

import java.util.Date;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.apache.log4j.Logger;
import org.quartz.CronTrigger;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.Trigger;
import org.quartz.impl.JobDetailImpl;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.matchers.GroupMatcher;
import org.quartz.impl.triggers.CronTriggerImpl;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.job.AccountRemoval;
import fr.gouv.motivaction.job.CleanExtract;
import fr.gouv.motivaction.job.ExportDatalake;
import fr.gouv.motivaction.job.ExtractBO;
import fr.gouv.motivaction.job.MergeDoubleAccount;
import fr.gouv.motivaction.job.SaveUtilisateursAssidusToDB;
import fr.gouv.motivaction.mails.AccountDisabledAlert;
import fr.gouv.motivaction.mails.AccountRemovalAlert;
import fr.gouv.motivaction.mails.DailyAlert;
import fr.gouv.motivaction.mails.InterviewPrepReminder;
import fr.gouv.motivaction.mails.InterviewThanksReminder;
import fr.gouv.motivaction.mails.LastConnectionAlert;
import fr.gouv.motivaction.mails.LastConnectionAlertJ60;
import fr.gouv.motivaction.mails.LastConnectionAlertJ90;
import fr.gouv.motivaction.mails.NudgeAlert;
import fr.gouv.motivaction.mails.PastInterview;
import fr.gouv.motivaction.mails.PastInterviewReminder;
import fr.gouv.motivaction.mails.WeeklyReport;

/**
 * Created by Alan on 22/06/2016.
 */
public class Quartz extends HttpServlet {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "005";

    private static Scheduler sch = null;

    public void init() throws ServletException
    {
        try
        {
            log.info(logCode + "-001 QUARTZ Quartz started - jobsMails ="+ Constantes.jobsMails + " jobsAdmins ="+ Constantes.jobsAdmins + " jobsCalculs ="+ Constantes.jobsCalculs);

            Quartz.sch = StdSchedulerFactory.getDefaultScheduler();

            Quartz.start();
        }
        catch(Exception se)
        {
            log.info(logCode+"-004 QUARTZ Quartz failed. error="+se);
        }
    }
    
    public static boolean isRunning()
    {
    	boolean result = false;
    	try
        {
    		Scheduler sch = StdSchedulerFactory.getDefaultScheduler();
    		result = sch.isStarted();
    	}
    	catch(Exception e)
        {
            log.info(logCode+"-005 QUARTZ Quartz isRunning. error="+e);
        }
    	return result;
    }
    
    public static void start() throws Exception {
    	if (Quartz.sch != null) {
    		Quartz.sch.start();
    		
    		if(Constantes.jobsMails) {
            	Quartz.setJobsMails();
            }
            
            if(Constantes.jobsAdmins) {
            	Quartz.setJobsAdmins();
            }
            
            // Jobs de nettoyage est tout le temps activé
            Quartz.setJobsCleans();
            
            if(Constantes.jobsCalculs) {
            	Quartz.setJobsCalculs();
            } 
	        
    		Quartz.listAllRunningJobsInLog();
    	} else {
    		log.info(logCode + "-002 QUARTZ not initialized.");
    	}
    }

    public static void stop() throws Exception
    {
        Quartz.sch.shutdown(true);
    }
    
    public static void setJobsMails() throws Exception
    {
    	String groupName = "mails";
    	
    	log.info(logCode + "-002 QUARTZ jobs mails running.");
    	
        // MESSAGE QUOTIDIEN POUR RELANCER LES VISITEURS SANS ACTIVITE
        // @RG - EMAIL : la campagne de mail "Memo vous aide pour votre recherche d'emploi" s'execute quotidiennement à 7h45
        JobDetail dailyAlert = new JobDetailImpl("Relance_visiteur_sans_activite", groupName, DailyAlert.class);
        CronTrigger cronTrigger = new CronTriggerImpl("cronTrigger1", groupName, "0 45 7 * * ?");
        Quartz.sch.scheduleJob(dailyAlert, cronTrigger);

        // RAPPORT HEBDOMADAIRE
        // @RG - EMAIL : la campagne de mail "Vos priorités cette semaine" s'execute hebdomadairement le Lundi à 2h00
        JobDetail weeklyReport = new JobDetailImpl("Vos_Priorites", groupName, WeeklyReport.class);
        CronTrigger cronTrigger2 = new CronTriggerImpl("cronTrigger2", groupName, "0 0 2 ? * MON");
        Quartz.sch.scheduleJob(weeklyReport, cronTrigger2);

        // INCITATION CANDIDATURES SPONTANEES
        // @RG - EMAIL : la campagne de mail "Avez-vous pensé aux candidatures spontanées ?" s'execute qutodiennement à 10h00
        JobDetail spontaneousNudgeMail = new JobDetailImpl("Incitation_candidature_spontanee", groupName, NudgeAlert.class);
        CronTrigger cronTrigger3 = new CronTriggerImpl("cronTrigger3", groupName, "0 0 10 * * ?");
        Quartz.sch.scheduleJob(spontaneousNudgeMail, cronTrigger3);

        // INCITATION ENTRETIEN A PREPARER
        // @RG - EMAIL : la campagne de mail "Pour bien préparer votre entretien" s'execute quotidiennement toutes les heures
        JobDetail interviewPrepReminder = new JobDetailImpl("Préparation_entretien", groupName, InterviewPrepReminder.class);
        CronTrigger cronTrigger4 = new CronTriggerImpl("cronTrigger4", groupName, "0 0 * * * ?");
        Quartz.sch.scheduleJob(interviewPrepReminder, cronTrigger4);

        // RAPPEL REMERCIEMENT ENTRETIEN
        // @RG - EMAIL : la campagne de mail "Avez-vous pensé à remercier après votre entretien ?" s'execute quotidiennement à 9h
        JobDetail interviewThanksReminder = new JobDetailImpl("Incitation remercier pour un entretien", groupName, InterviewThanksReminder.class);
        CronTrigger cronTrigger5 = new CronTriggerImpl("cronTrigger5", groupName, "0 0 9 * * ?");
        Quartz.sch.scheduleJob(interviewThanksReminder, cronTrigger5);

        // RAPPEL RELANCE ENTRETIEN
        // @RG - EMAIL : la campagne de mail "Avez-vous pensé à relancer votre candidature" s'execute quotidiennement à 9h15
        JobDetail pastInterviewReminder = new JobDetailImpl("Incitation relance entretien", groupName, PastInterviewReminder.class);
        CronTrigger cronTrigger6 = new CronTriggerImpl("cronTrigger6", groupName, "0 15 9 * * ?");
        Quartz.sch.scheduleJob(pastInterviewReminder, cronTrigger6);

        // RELANCE SANS CONNEXION J+30
        // @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier mois" s'execute quotidiennement à 8h30
        JobDetail lastConnectionAlert = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 30j", groupName, LastConnectionAlert.class);
        CronTrigger cronTrigger7 = new CronTriggerImpl("cronTrigger7", groupName, "0 30 8 * * ?");
        Quartz.sch.scheduleJob(lastConnectionAlert, cronTrigger7);

        // RELANCE SANS CONNEXION J+60
        // @RG - EMAIL : la campagne de mail "Reprenez le fil de vos candidatures" s'execute quotidiennement à 8h35
        JobDetail lastConnectionAlertJ60 = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 60j", groupName, LastConnectionAlertJ60.class);
        CronTrigger cronTrigger8 = new CronTriggerImpl("cronTrigger8", groupName, "0 35 8 * * ?");
        Quartz.sch.scheduleJob(lastConnectionAlertJ60, cronTrigger8);

        // RELANCE SANS CONNEXION J+90
        // @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier trimestre" s'execute quotidiennement à 8h40
        JobDetail lastConnectionAlertJ90 = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 90j", groupName, LastConnectionAlertJ90.class);
        CronTrigger cronTrigger9 = new CronTriggerImpl("cronTrigger9", groupName, "0 40 8 * * ?");
        Quartz.sch.scheduleJob(lastConnectionAlertJ90, cronTrigger9);

        // RELANCE ENTRETIEN SANS ANCTION DEPUIS 2 SEMAINES
        // @RG - EMAIL : la campagne de mail "Que devient votre candidature" s'execute quotidiennement à 8h25
        JobDetail pastInterview = new JobDetailImpl("Relance d'une candidature avec un entretien car sans action depuis 2semaines", groupName, PastInterview.class);
        CronTrigger cronTrigger10 = new CronTriggerImpl("cronTrigger10", groupName, "0 25 8 * * ?");
        Quartz.sch.scheduleJob(pastInterview, cronTrigger10);

        // NOTIFIE LA DESACTIVATION DU COMPTE
        // @RG - EMAIL : la campagne de mail "Désactivation automatique des notifications de conseils" s'execute hebdomadairement le samedi à 8h
        JobDetail accountDisabledAlert = new JobDetailImpl("Notifie la désactivation du compte", groupName, AccountDisabledAlert.class);
        CronTrigger cronTrigger11 = new CronTriggerImpl("cronTrigger11", groupName, "0 0 8 ? * SAT");
        Quartz.sch.scheduleJob(accountDisabledAlert, cronTrigger11);

        // ALERTE AVANT SUPPRESSION AUTOMATIQUE DE COMPTE
        // @RG - EMAIL : la campagne de mail "Alerte avant suppression automatique de compte" s'exécute hebdomadairement le samedi à 3h
        JobDetail accountRemovalAlert = new JobDetailImpl("Préviens de la suppression future du compte", groupName, AccountRemovalAlert.class);
        CronTrigger cronTrigger12 = new CronTriggerImpl("cronTrigger12", groupName, "0 0 3 ? * SAT");
        Quartz.sch.scheduleJob(accountRemovalAlert, cronTrigger12);

        // SUPPRESSION AUTOMATIQUE DE COMPTE
        // @RG - JOB : le nettoyage des comptes s'exécute hebdomadairement le samedi à 3h30
        JobDetail accountRemoval = new JobDetailImpl("Suppression des comptes inutilisés", groupName, AccountRemoval.class);
        CronTrigger cronTrigger13 = new CronTriggerImpl("cronTrigger13", groupName, "0 30 3 ? * SAT");
        Quartz.sch.scheduleJob(accountRemoval, cronTrigger13);

        // FUSION DES COMPTES EN DOUBLON
        // @RG - JOB : le nettoyage des comptes en doublon a lieu toutes les 20 minutes
        JobDetail mergeDoubleAccount = new JobDetailImpl("Fusion des doublons de compte", groupName, MergeDoubleAccount.class);
        CronTrigger cronTrigger14 = new CronTriggerImpl("cronTrigger14", groupName, "0 */20 * * * ?");
        Quartz.sch.scheduleJob(mergeDoubleAccount, cronTrigger14);
    }

    public static void setJobsCleans() throws Exception
    {
    	String groupName = "cleans";
    	
    	log.info(logCode + "-006 QUARTZ jobs cleans running.");
    	
    	// NETTOYAGE EXTRACT TDB et BO 
        // @RG - JOB : Nettoyage extract TDB et BO s'exécute hebdomadairement le samedi à 4h30
        JobDetail cleanExtract = new JobDetailImpl("Nettoyage des extrats des utilisateurs et du BO", groupName, CleanExtract.class);
        CronTrigger cronTrigger1 = new CronTriggerImpl("cronTrigger1", groupName, "0 30 4 ? * SAT");
        Quartz.sch.scheduleJob(cleanExtract, cronTrigger1);

    }
    
    public static void setJobsAdmins() throws Exception
    {
    	String groupName = "admins";

    	log.info(logCode + "-006 QUARTZ jobs admins running.");
    	
        // EXTRACT BO
        // @RG - JOB : extract BO s'exécute hebdomadairement le samedi à 4h55
        JobDetail exportBO = new JobDetailImpl("Extract de la liste des utilisateurs", groupName, ExtractBO.class);
        CronTrigger cronTrigger1 = new CronTriggerImpl("cronTrigger1", groupName, "0 55 4 ? * SAT");
        Quartz.sch.scheduleJob(exportBO, cronTrigger1);
    }
    
    public static void setJobsCalculs() throws Exception
    {
    	String groupName = "calculs";
    	
    	log.info(logCode + "-002 QUARTZ jobs calculs running.");
    	
        // ENRICHISSEMENT DE LA TABLE DES UTILISATEURS ASSIDUS
        // @RG - JOB : l'enrichissement de la table des utilisateurs assidus a lieu le 1er de chaque mois à 4h00
        JobDetail saveUtilisateursAssidusToDB = new JobDetailImpl("Enregistrement des utilisateurs assidus du mois précédent", groupName, SaveUtilisateursAssidusToDB.class);
        CronTrigger cronTrigger1 = new CronTriggerImpl("cronTrigger1", groupName, "0 0 4 1 * ?");
        Quartz.sch.scheduleJob(saveUtilisateursAssidusToDB, cronTrigger1);

        // EXPORT DATALAKE PE
        // @RG - JOB : export des données de MEMO pour le DATALAKE de PE exécuté tous les jours à 9h00
        JobDetail exportDatalake = new JobDetailImpl("Export_datalake", groupName, ExportDatalake.class);
        CronTrigger cronTrigger2 = new CronTriggerImpl("cronTrigger2", groupName, "0 0 9 * * ?");
        Quartz.sch.scheduleJob(exportDatalake, cronTrigger2);
    }
    
    public static void reloadJobs(String jobs, boolean isRunning) throws Exception
    {   
        if ("mails".equals(jobs)) {
        	Constantes.jobsMails = isRunning;
        	if(isRunning)
        		Quartz.setJobsMails();
        	else
        		unsetGroupJobs(jobs);
        } else if ("admins".equals(jobs)) {
        	Constantes.jobsAdmins = isRunning;
        	if(isRunning)
        		Quartz.setJobsAdmins();
        	else
        		unsetGroupJobs(jobs);
        } else if ("calculs".equals(jobs)) {
        	Constantes.jobsCalculs = isRunning;
        	if(isRunning)
        		Quartz.setJobsCalculs();
        	else
        		unsetGroupJobs(jobs);
        }

        Quartz.listAllRunningJobsInLog();
    }
    
    private static void unsetGroupJobs(String groupName) throws Exception {
    	List<Trigger> triggers = null;

		for (JobKey jobKey : Quartz.sch.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {
			//get job's trigger
			triggers = (List<Trigger>) Quartz.sch.getTriggersOfJob(jobKey);
			Date nextFireTime = triggers.get(0).getNextFireTime(); 
			Quartz.sch.unscheduleJob(triggers.get(0).getKey());
		}
 
    }
    
    private static void listAllRunningJobsInLog() throws Exception {
    	List<Trigger> triggers = null;
    	String lstJobsName = "";
    	for (String groupName : Quartz.sch.getJobGroupNames()) {
    		for (JobKey jobKey : Quartz.sch.getJobKeys(GroupMatcher.jobGroupEquals(groupName))) {					
    			String jobName = jobKey.getName();
    			String jobGroup = jobKey.getGroup();

    			//get job's trigger
    			triggers = (List<Trigger>) Quartz.sch.getTriggersOfJob(jobKey);
    			Date nextFireTime = triggers.get(0).getNextFireTime(); 

    			lstJobsName += " [groupName] : " + jobGroup + " [jobName] : " + jobName + " [execution] : " +nextFireTime;
    		}
    		lstJobsName += "\n\n";
    	}
    	log.info(logCode+"-007 QUARTZ list running jobs : "+lstJobsName);
    }

}
