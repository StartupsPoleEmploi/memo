package fr.gouv.motivaction.job;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.log4j.Logger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.codahale.metrics.Timer;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.dao.AdminDAO;
import fr.gouv.motivaction.mails.MailTools;
import fr.gouv.motivaction.model.UserActivity;
import fr.gouv.motivaction.service.MailService;
import fr.gouv.motivaction.utils.Utils;

/**
 * Created by Alan on 03/04/2018.
 */
public class ExtractBO implements Job {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "044";

    public static Timer extractBOTimer = Utils.metricRegistry.timer("extractBOTimer");

    public void execute(JobExecutionContext context) throws JobExecutionException
    {
        log.info(logCode + "-001 JOB Executing ExtractBO job");

        try {
            // génération de l'export
            this.buildAndWriteExtract();

            // envoi du mail de rapport d'execution aux intras, devs et extra
            MailService.sendMailReport(Utils.concatArrayString(MailTools.tabEmailIntra, MailTools.tabEmailDev, MailTools.tabEmailExtra), "Rapport - ExtractBO", "");
        }
        catch (Exception e)
        {
            log.error(logCode+"-002 JOB Error executing ExtractBO job. error="+e);
            throw new JobExecutionException(e);
        }
    }

    public static void buildAndWriteExtract() throws Exception
    {
        long nbPaquet = 0;
        long idMin = 0;
        long idMax = 50000;
        List<String> lstFilePathCreated = null;
        String fileName = null;

        log.info(logCode+"-003 JOB Started building user extract");

        long nbUser = AdminDAO.getMaxUserId();

        if(nbUser>0)
        {
            try
            {
                lstFilePathCreated = new ArrayList<String>();
                nbPaquet = nbUser/50000;
                for (int i=0; i<=nbPaquet && idMin < nbUser; i++) {
                    // Récupération de tous les états des utilisateurs
                    Object [] activities = AdminDAO.getExtractUserActivities(idMin, idMax);
                    fileName = Constantes.pathCSV+"extract-userActivities-"+i+".csv";
                    // Ecriture du fichier CSV sur le serveur
                    ExtractBO.writeUserActivitiesInCSV(activities, i, fileName);
                    lstFilePathCreated.add(fileName);
                    idMin += 50000;
                    idMax += 50000;
                }
                // On zip les fichiers créés
                if (lstFilePathCreated != null)
                    ExtractBO.zipFiles(lstFilePathCreated.toArray(new String[lstFilePathCreated.size()]));

                log.info(logCode+"-004 JOB User extract built");

            } catch (Exception e) {
                log.error(logCode+"-005 JOB Erreur lors de l'écriture du fichier d'extract. error=" + e);
            }
        }
    }

    private static void writeUserActivitiesInCSV(Object [] lstUserActivities, int i, String fileName) {
        File f = new File (fileName);
        UserActivity a;

        try
        {
            FileWriter fw = new FileWriter (f);
            StringBuilder sb = new StringBuilder();
            fw.write("userId;visitorLink;email;je_vais_postule;j_ai_postule;j_ai_relance;j_ai_un_entretien;nbConnexion;nbConnexionFacebook;dateCreation;dateLastActivity;receivedEmail;assiduLastMonth;assiduLastTrimestre");
            fw.write("\n");
            for(Object o : lstUserActivities)
            {
                a = (UserActivity) o;
                // Réinitialise la String
                sb.delete(0, sb.length());
                sb.append(String.valueOf(a.getUserId()+";"+MailTools.url+"/?link="+a.getVisitorLink()+";"+a.getEmail()+";"+a.getTodos()+";"+a.getCandidatures()+";"+a.getRelances()+";"+a.getEntretiens()+";"+a.getConns()+";"+a.getFbConns()+";"+a.getDateCreation()+";"+a.getLastActivity()+";"+a.getReceiveEmail()+";"));
                // Assidu le mois dernier
                if(a.getNbConnLastMonth()>=4 && a.getNbActLastMonth()>=8) {
                    // assidu = au moins 4 connexions et 8 activités
                    sb.append("1;");
                } else {
                    sb.append("0;");
                }
                // Assidu le trimestre dernier
                if(a.getNbConnLastTrim()>=4 && a.getNbActLastTrim()>=8) {
                    // assidu = au moins 4 connexions et 8 activités
                    sb.append("1;");
                } else {
                    sb.append("0;");
                }
                sb.append("\n");
                fw.write(sb.toString());
            }
            fw.close();
        }
        catch (IOException exception)
        {
            log.error(logCode+"-006 JOB Erreur lors de l'écriture du fichier d'activités user. error="+exception);
        }
    }

    private static boolean zipFiles(String[] filePaths) {
        boolean isZipped = false;
        String zipFileName = Constantes.pathCSV+"extract-userActivities.zip";

        try {


            FileOutputStream fos = new FileOutputStream(zipFileName);
            ZipOutputStream zos = new ZipOutputStream(fos);

            for (String aFile : filePaths) {
                zos.putNextEntry(new ZipEntry(new File(aFile).getName()));

                byte[] bytes = Files.readAllBytes(Paths.get(aFile));
                zos.write(bytes, 0, bytes.length);
                zos.closeEntry();
            }
            zos.close();
            // Modification des droits du fichier pr le rendre telechargeable
            File f = new File(zipFileName);
            if (f!=null)
                f.setExecutable(true);
            isZipped = true;

        } catch (FileNotFoundException ex) {
            log.error(logCode+"-007 A file does not exist: " + ex);
        } catch (IOException ex) {
            log.error(logCode+"-008 I/O error: " + ex);
        }
        return isZipped;
    }

}
