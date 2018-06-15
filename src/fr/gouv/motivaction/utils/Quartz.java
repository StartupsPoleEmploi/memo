package fr.gouv.motivaction.utils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import fr.gouv.motivaction.job.ExportMaintenance;
import fr.gouv.motivaction.job.SaveUtilisateursAssidusToDB;
import fr.gouv.motivaction.mails.*;
import fr.gouv.motivaction.job.AccountRemoval;
import org.apache.log4j.Logger;
import org.quartz.CronTrigger;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.impl.JobDetailImpl;
import org.quartz.impl.StdSchedulerFactory;
import org.quartz.impl.triggers.CronTriggerImpl;

/**
 * Created by Alan on 22/06/2016.
 */
public class Quartz extends HttpServlet {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "005";

    public void init() throws ServletException
    {
        try
        {
            log.info(logCode + "-001 QUARTZ Quartz started");

            Scheduler sch = StdSchedulerFactory.getDefaultScheduler();
            //log.info(logCode+"-002 Quartz already running ? ="+sch.isStarted());
            //sch.shutdown();
            sch.start();

            if(MailTools.isMaster) {

                // MESSAGE QUOTIDIEN POUR RELANCER LES VISITEURS SANS ACTIVITE
                // @RG - EMAIL : la campagne de mail "Avis de relance" s'execute quotidiennement à 7h45
                JobDetail dailyAlert = new JobDetailImpl("Quotidienne", "Group1", DailyAlert.class);
                CronTrigger cronTrigger = new CronTriggerImpl("cronTrigger", "Group1", "0 45 7 * * ?");
                sch.scheduleJob(dailyAlert, cronTrigger);

                // RAPPORT HEBDOMADAIRE
                // @RG - EMAIL : la campagne de mail "Vos priorités cette semaine" s'execute hebdomadairement le Lundi à 2h00
                JobDetail weeklyReport = new JobDetailImpl("Hebdomadaire", "Group2", WeeklyReport.class);
                CronTrigger cronTrigger2 = new CronTriggerImpl("cronTrigger", "Group2", "0 0 2 ? * MON");
                sch.scheduleJob(weeklyReport, cronTrigger2);

                // INCITATION CANDIDATURES SPONTANEES
                // @RG - EMAIL : la campagne de mail "Passez-vous trop de temps sur les offres en ligne" s'execute qutodiennement à 10h00
                JobDetail spontaneousNudgeMail = new JobDetailImpl("Incitation candidatures spontanées", "Group3", NudgeAlert.class);
                CronTrigger cronTrigger3 = new CronTriggerImpl("cronTrigger", "Group3", "0 0 10 * * ?");
                sch.scheduleJob(spontaneousNudgeMail, cronTrigger3);

                // INCITATION ENTRETIEN A PREPARER
                // @RG - EMAIL : la campagne de mail "Allez-vous être recruté" s'execute quotidiennement toutes les heures
                JobDetail interviewPrepReminder = new JobDetailImpl("Rappel de préparation d'entretien", "Group4", InterviewPrepReminder.class);
                CronTrigger cronTrigger4 = new CronTriggerImpl("cronTrigger", "Group4", "0 0 * * * ?");
                sch.scheduleJob(interviewPrepReminder, cronTrigger4);

                // RAPPEL REMERCIEMENT ENTRETIEN
                // @RG - EMAIL : la campagne de mail "Avez-vous remercié après votre entretien" s'execute quotidiennement à 9h
                JobDetail interviewThanksReminder = new JobDetailImpl("Incitation remercier pour un entretien", "Group5", InterviewThanksReminder.class);
                CronTrigger cronTrigger5 = new CronTriggerImpl("cronTrigger", "Group5", "0 0 9 * * ?");
                sch.scheduleJob(interviewThanksReminder, cronTrigger5);

                // RAPPEL RELANCE ENTRETIEN
                // @RG - EMAIL : la campagne de mail "Avez-vous relancé votre candidature" s'execute quotidiennement à 9h15
                JobDetail pastInterviewReminder = new JobDetailImpl("Incitation relance entretien", "Group6", PastInterviewReminder.class);
                CronTrigger cronTrigger6 = new CronTriggerImpl("cronTrigger", "Group6", "0 15 9 * * ?");
                sch.scheduleJob(pastInterviewReminder, cronTrigger6);

                // RELANCE SANS CONNEXION J+30
                // @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier mois" s'execute quotidiennement à 8h30
                JobDetail lastConnectionAlert = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 30j", "Group7", LastConnectionAlert.class);
                CronTrigger cronTrigger7 = new CronTriggerImpl("cronTrigger", "Group7", "0 30 8 * * ?");
                sch.scheduleJob(lastConnectionAlert, cronTrigger7);

                // RELANCE SANS CONNEXION J+60
                // @RG - EMAIL : la campagne de mail "Reprenez le fil de vos candidatures" s'execute quotidiennement à 8h35
                JobDetail lastConnectionAlertJ60 = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 60j", "Group8", LastConnectionAlertJ60.class);
                CronTrigger cronTrigger8 = new CronTriggerImpl("cronTrigger", "Group8", "0 35 8 * * ?");
                sch.scheduleJob(lastConnectionAlertJ60, cronTrigger8);

                // RELANCE SANS CONNEXION J+90
                // @RG - EMAIL : la campagne de mail "Avez-vous recherché un emploi durant le dernier trimestre" s'execute quotidiennement à 8h40
                JobDetail lastConnectionAlertJ90 = new JobDetailImpl("Relance d'utilisation car sans connexion depuis 90j", "Group9", LastConnectionAlertJ90.class);
                CronTrigger cronTrigger9 = new CronTriggerImpl("cronTrigger", "Group9", "0 40 8 * * ?");
                sch.scheduleJob(lastConnectionAlertJ90, cronTrigger9);

                // RELANCE ENTRETIEN SANS ANCTION DEPUIS 2 SEMAINES
                // @RG - EMAIL : la campagne de mail "Que devient votre candidature" s'execute quotidiennement à 8h25
                JobDetail pastInterview = new JobDetailImpl("Relance d'une candidature avec un entretien car sans action depuis 2semaines", "Group10", PastInterview.class);
                CronTrigger cronTrigger10 = new CronTriggerImpl("cronTrigger", "Group10", "0 25 8 * * ?");
                sch.scheduleJob(pastInterview, cronTrigger10);

                // NOTIFIE LA DESACTIVATION DU COMPTE
                // @RG - EMAIL : la campagne de mail "Désactivation automatique des notifications de conseils" s'execute hebdomadairement le samedi à 8h
                JobDetail accountDisabledAlert = new JobDetailImpl("Notifie la désactivation du compte", "Group11", AccountDisabledAlert.class);
                CronTrigger cronTrigger11 = new CronTriggerImpl("cronTrigger", "Group11", "0 0 8 ? * SAT");
                sch.scheduleJob(accountDisabledAlert, cronTrigger11);

                // ALERTE AVANT SUPPRESSION AUTOMATIQUE DE COMPTE
                // @RG - EMAIL : la campagne de mail "Alerte avant suppression automatique de compte" s'exécute hebdomadairement le samedi à 3h
                JobDetail accountRemovalAlert = new JobDetailImpl("Préviens de la suppression future du compte", "Group12", AccountRemovalAlert.class);
                CronTrigger cronTrigger12 = new CronTriggerImpl("cronTrigger", "Group12", "0 0 3 ? * SAT");
                sch.scheduleJob(accountRemovalAlert, cronTrigger12);

                // SUPPRESSION AUTOMATIQUE DE COMPTE
                // @RG - JOB : le nettoyage des comptes s'exécute hebdomadairement le samedi à 3h30
                JobDetail accountRemoval = new JobDetailImpl("Suppression des comptes inutilisés", "Group13", AccountRemoval.class);
                CronTrigger cronTrigger13 = new CronTriggerImpl("cronTrigger", "Group13", "0 30 3 ? * SAT");
                sch.scheduleJob(accountRemoval, cronTrigger13);

                // ENRICHISSEMENT DE LA TABLE DES UTILISATEURS ASSIDUS
                // @RG - JOB : l'enrichissement de la table des utilisateurs assidus a lieu le 1er de chaque mois à 4h00
                JobDetail saveUtilisateursAssidusToDB = new JobDetailImpl("Enregistrement des utilisateurs assidus du mois précédent", "Group14", SaveUtilisateursAssidusToDB.class);
                CronTrigger cronTrigger14 = new CronTriggerImpl("cronTrigger", "Group14", "0 0 4 1 * ?");
                sch.scheduleJob(saveUtilisateursAssidusToDB, cronTrigger14);
            }
            else
                log.info(logCode + "-003 QUARTZ Server is not master. Quartz dit not need to start mailing jobs");

            // NETTOYAGE EXPORTS ET REFRESH LISTE DES UTILISATEURS
            // @RG - JOB : Nettoyage exports et refresh liste des utilisateurs s'exécute hebdomadairement le samedi à 4h30
            JobDetail exportMaintenance = new JobDetailImpl("Nettoyage exports et refresh liste des utilisateurs", "Group15", ExportMaintenance.class);
            CronTrigger cronTrigger15 = new CronTriggerImpl("cronTrigger", "Group15", "0 30 4 ? * SAT");
            /*CronTrigger cronTrigger15 = new CronTriggerImpl("cronTrigger", "Group15", "0 0/15 * * * ?");*/
            sch.scheduleJob(exportMaintenance, cronTrigger15);

        }
        catch(Exception se)
        {
            log.info(logCode+"-002 QUARTZ Quartz failed. error="+se);
        }
    }

    public static boolean isRunning() {
        boolean result = false;
        try {
            Scheduler sch = StdSchedulerFactory.getDefaultScheduler();
            result = sch.isStarted();
        }
        catch(Exception e)
        {
            log.info(logCode+"-003 QUARTZ Quartz isRunning. error="+e);
        }
        return result;
    }
}
